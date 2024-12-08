// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

import {LoanMetadata,
    LoanState,
    Lender,
    LoanTerms,
    LoanStatus
} from './Types.sol';

contract LendingPool {
    using SafeERC20 for IERC20;

    /// @notice the duration in seconds of the interest rate adjustment
    uint256 public constant INTEREST_RATE_DISCOVERY_PERIOD_SECONDS = 864000; // 10-days

    /// @notice the interest rate adjustment per second
    uint256 private immutable interestRateAdjustmentPerSecond;

    /// @notice loan metadata
    LoanMetadata public metadata;

    /// @notice the current state of the loan
    LoanState public state;

    /// @notice the finalized loan terms
    LoanTerms public terms;

    /// @notice the last repayment token balance. Used to ensure proper accounting
    uint256 _lastRepaymentTokenBalance;

    /// @notice the interest rate as of the last funding
    uint256 private _lastFundedInterestRate;

    /// @notice the lenders 
    mapping(address => Lender) public lenderInfo;

    /// @notice the loan funding amount is greater than the requested amount remaining
    error FundingAmountExceedsLoanAmount();

    /// @notice the discovery period ended without the loan being funded
    error FundingDiscoveryPeriodEnding();

    /// @notice signal that a loan has been funded
    event LoanFunded(uint256 indexed id, address indexed funder, uint256 amount);

    /// @notice signal that the loan terms has been agreed to
    event LoanTermsFinalized(uint256 indexed id, uint256 principalAmount, uint256 interestRate, uint256 interestAmount, uint256 amountOwed, uint256 loanDuration);

    /// @notice signal that the loaned funds have been transferd to the requestor
    event LoanReleased(uint256 indexed id, address indexed receiver, uint256 amount);

    /// @notice signal when the loan status has changed states
    event LoanStatusChanged(uint256 indexed id, LoanStatus status);

    /// @notice signal when a loan payment has been made
    event LoadPaymentAccepted(uint256 indexed id, uint256 amount);

    /// @notice signal when a lender has claimed repaid funds
    event LenderClaimedFunds(uint256 indexed id, address indexed lender, uint256 amount);

    constructor(
        LoanMetadata memory _metadata
    ) {
        metadata = _metadata;
        state = LoanState({
            createdAtTimestamp: block.timestamp,
            amountRemaining: _metadata.loanAmount,
            discoverPeriodEndsAtTimestamp: block.timestamp + INTEREST_RATE_DISCOVERY_PERIOD_SECONDS,
            status: LoanStatus.Funding
        });

        uint256 interestRateDelta = metadata.interestRateMax - metadata.interestRateMin;

        interestRateAdjustmentPerSecond = interestRateDelta / INTEREST_RATE_DISCOVERY_PERIOD_SECONDS;
    }

    /**
     * @notice gets the current interest rate of the loan
     * @dev the interest rate offered to the market is an auto adjusting rate until the loan is fully funded. 
     * the rate will rise in a linear fashion starting from the interestRateMin to the interestRateMax. When the loan
     * is fully funded then the rate and loan terms will be set.
     */
    function getInterestRate() public view returns(uint256) {
        uint256 secondsElapsed = block.timestamp - state.createdAtTimestamp;

        return metadata.interestRateMin + (secondsElapsed*interestRateAdjustmentPerSecond);
    }

    /**
     * @notice become a lender by adding funds to the pool
     * @dev a lender may fully or partially fund the loan. This will revert if the amount specified is more than the loan amount
     * or if the loan is already funded, or if the discovery period has elapsed.
     * @param amount the funding amount for the user
     */
    function fund(
        uint256 amount
    ) public {
        LoanState memory _state = state;

        // revert if the request fails sanity checks
        if(amount > _state.amountRemaining){
            revert FundingAmountExceedsLoanAmount();
        } else if(block.timestamp > _state.discoverPeriodEndsAtTimestamp) {
            revert FundingDiscoveryPeriodEnding();
        }
        
        // transfer the tokens
        IERC20(metadata.token).safeTransferFrom(msg.sender, address(this), amount);

        // update the lender record
        Lender memory lender = lenderInfo[msg.sender];

        lender.lender = msg.sender;
        lender.lendingAmount += amount;

        lenderInfo[msg.sender] = lender;

        emit LoanFunded(metadata.id, msg.sender, amount);
    }

    /**
     * @notice finalize loan terms and receive send the loaned funds to the payor
     * @dev reverts if the sender is not the payor (loan requestor)
     */
    function finalizeLoanTerms() public {
        // ensure the caller is the intended receiver
        require(msg.sender == metadata.payor, "unauthorized");

        // create loan terms from the final interest rate and loan params
        LoanMetadata memory _metadata = metadata;

        uint256 principalAmount = IERC20(_metadata.token).balanceOf(address(this));
        uint256 interestRate = _lastFundedInterestRate;
        uint256 oneYearInterestAmount = (principalAmount * interestRate) / 1e18;
        uint256 interestAmount = (((_metadata.loanPeriod * 1e18) / 365) * oneYearInterestAmount) / 1e18;

        LoanTerms memory _terms = LoanTerms({
            loanId: _metadata.id,
            principalAmount: principalAmount,
            interestRate: interestRate,
            interestAmount: interestAmount,
            amountOwed: principalAmount+interestAmount,
            amountRepaid: 0
        });

        terms = _terms;

        emit LoanTermsFinalized(
            _terms.loanId, 
            _terms.principalAmount, 
            _terms.interestRate, 
            _terms.interestAmount, 
            _terms.amountOwed,
            _metadata.loanPeriod);

        // update the loan status to finalized
        _setLoanStatus(LoanStatus.Finalized);
    }

    /**
     * @notice release the funds to the requestor
     * @dev this call will revert if the loan is already released or the sender is not the receiver
     */
    function releaseFunds() public {
        LoanMetadata memory _metadata = metadata;

        require(msg.sender == _metadata.payor, "unauthorized");
        require(state.status == LoanStatus.Finalized || state.status == LoanStatus.Funding, "invalid state for release of funds");

        // ensure the loan is finalized before releasing funds
        if(state.status == LoanStatus.Funding){
            finalizeLoanTerms();
        }

        LoanTerms memory _terms = terms;
        IERC20(_metadata.token).safeTransfer(_metadata.payor, terms.principalAmount);

        emit LoanReleased(_metadata.id, _metadata.payor, _terms.principalAmount);

        // update the loan status to released
        _setLoanStatus(LoanStatus.Released);

        // set the last payment amount to 0
        _lastRepaymentTokenBalance = IERC20(_metadata.token).balanceOf(address(this));
    }

    /**
     * @notice accept a loan payment sent to the contract
     */
    function acceptPayment() public {
        uint256 currentRepaymentTokenBalance = IERC20(metadata.token).balanceOf(address(this));
        uint256 repaymentAmount = currentRepaymentTokenBalance - _lastRepaymentTokenBalance;

        terms.amountRepaid += repaymentAmount;

        if(terms.amountRepaid >= terms.amountOwed){
            _setLoanStatus(LoanStatus.Repaid);
        }

        _lastRepaymentTokenBalance = currentRepaymentTokenBalance;

        emit LoadPaymentAccepted(terms.loanId, repaymentAmount);
    }

    /**
     * @notice withdraw repayed loan funds to lenders
     * @param amount the amount to withdraw
     */
    function withdraw(
        uint256 amount
    ) public {
        uint256 claimableAmount = getClaimableAmount(msg.sender);

        require(claimableAmount >= amount, "requested amount is greater than claimable amount");

        lenderInfo[msg.sender].claimedAmount += amount;

        IERC20(metadata.token).transfer(msg.sender, amount);

        emit LenderClaimedFunds(metadata.id, msg.sender, amount);
    }

    /**
     * @notice get the amount claimable by the given lender
     * @dev this will be proportional based on the total loan amount and the amount lent by the lender
     * @param lender the lender to query
     * @return amount the claimable amount
     */
    function getClaimableAmount(
        address lender
    ) public view returns (uint256 amount) {
        Lender memory _lender = lenderInfo[lender];

        if(_lender.lendingAmount == 0){ return 0; }

        LoanTerms memory _terms = terms;

        if(_terms.amountOwed == 0) { return 0; }

        uint256 percentageLent = (_lender.lendingAmount * 1e18) / _terms.amountOwed;
        uint256 totalClaimableAmount = (_terms.amountRepaid*percentageLent) / 1e18;

        if(_lender.claimedAmount >= totalClaimableAmount){ return 0; }

        return totalClaimableAmount - _lender.claimedAmount;
    }

    /**
     * @notice update the loan status
     * @param status the new loan status
     */
    function _setLoanStatus(
        LoanStatus status
    ) private {
        state.status = status;
    }

}