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

import 'hardhat/console.sol';

contract LendingPool {
    using SafeERC20 for IERC20;

    /// @notice the duration in seconds of the interest rate adjustment
    uint256 public constant INTEREST_RATE_DISCOVERY_PERIOD_SECONDS = 864000; // 10-days

    /// @notice the interest rate adjustment per second
    uint256 private immutable interestRateAdjustmentPerSecond;

    /// @notice the loan id
    uint256 public immutable LOAN_ID;

    /// @notice the requested loan amount
    uint256 public immutable REQUESTED_LOAN_AMOUNT;

    /// @notice the opening interest rate
    uint256 public immutable OPENING_INTEREST_RATE;

    /// @notice the borrow token
    address public immutable BORROW_TOKEN;

    /// @notice the requestor of the loan
    address public immutable LOAN_REQUESTOR;

    /// @notice the loan period in days
    uint256 public immutable LOAN_PERIOD_DAYS;

    /// @notice the current state of the loan
    LoanState public state;

    /// @notice the finalized loan terms
    LoanTerms public terms;

    /// @notice the lenders 
    mapping(address => Lender) public lenderInfo;

    /// @notice the loan funding amount is greater than the requested amount remaining
    error FundingAmountExceedsLoanAmount();

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
        uint256 id,
        uint256 loanAmount,
        uint256 interestRateMin,
        uint256 interestRateMax,
        address borrowToken,
        address requestor,
        uint256 loanPeriod
    ) {
        LOAN_ID = id;
        REQUESTED_LOAN_AMOUNT = loanAmount;
        OPENING_INTEREST_RATE = interestRateMin;
        BORROW_TOKEN = borrowToken;
        LOAN_REQUESTOR = requestor;
        LOAN_PERIOD_DAYS = loanPeriod;

        state = LoanState({
            createdAtTimestamp: block.timestamp,
            amountRemaining: loanAmount,
            discoverPeriodEndsAtTimestamp: block.timestamp + INTEREST_RATE_DISCOVERY_PERIOD_SECONDS,
            status: LoanStatus.Funding,
            lastRepaymentTokenBalance: 0,
            lastFundedInterestRate: interestRateMin
        });

        uint256 interestRateDelta = interestRateMax - interestRateMin;

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

        return OPENING_INTEREST_RATE + (secondsElapsed*interestRateAdjustmentPerSecond);
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
        } 
        
        // transfer the tokens
        IERC20(BORROW_TOKEN).safeTransferFrom(msg.sender, address(this), amount);

        // update the lender record
        Lender memory lender = lenderInfo[msg.sender];

        lender.lender = msg.sender;
        lender.lendingAmount += amount;

        lenderInfo[msg.sender] = lender;

        // update the loan state
        state.amountRemaining -= amount;
        state.lastFundedInterestRate = getInterestRate();

        emit LoanFunded(LOAN_ID, msg.sender, amount);
    }

    /**
     * @notice finalize loan terms and receive send the loaned funds to the payor
     * @dev reverts if the sender is not the payor (loan requestor)
     */
    function finalizeLoanTerms() public {
        // ensure the caller is the intended receiver
        require(msg.sender == LOAN_REQUESTOR, "unauthorized");

        uint256 amountFunded = REQUESTED_LOAN_AMOUNT - state.amountRemaining;

        if(amountFunded == 0){
            _setLoanStatus(LoanStatus.Closed);

            return;
        }

        uint256 principalAmount = IERC20(BORROW_TOKEN).balanceOf(address(this));
        uint256 interestRate = state.lastFundedInterestRate;
        uint256 oneYearInterestAmount = (principalAmount * interestRate) / 1e18;
        uint256 interestAmount = (((LOAN_PERIOD_DAYS * 1e18) / 365) * oneYearInterestAmount) / 1e18;

        LoanTerms memory _terms = LoanTerms({
            loanId: LOAN_ID,
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
            LOAN_PERIOD_DAYS);

        // update the loan status to finalized
        _setLoanStatus(LoanStatus.Finalized);
    }

    /**
     * @notice release the funds to the requestor
     * @dev this call will revert if the loan is already released or the sender is not the receiver
     */
    function releaseFunds() public {
        require(msg.sender == LOAN_REQUESTOR, "unauthorized");
        require(state.status == LoanStatus.Finalized || state.status == LoanStatus.Funding, "invalid state for release of funds");

        // ensure the loan is finalized before releasing funds
        if(state.status == LoanStatus.Funding){
            finalizeLoanTerms();
        }

        LoanTerms memory _terms = terms;
        IERC20(BORROW_TOKEN).safeTransfer(LOAN_REQUESTOR, terms.principalAmount);

        emit LoanReleased(LOAN_ID, LOAN_REQUESTOR, _terms.principalAmount);

        // update the loan status to released
        _setLoanStatus(LoanStatus.Released);

        // update the repayment token balance
        state.lastRepaymentTokenBalance = IERC20(BORROW_TOKEN).balanceOf(address(this));
    }

    /**
     * @notice accept a loan payment sent to the contract
     */
    function acceptPayment() public {
        require(state.status == LoanStatus.Released, "loan cannot accept payments");

        uint256 currentRepaymentTokenBalance = IERC20(BORROW_TOKEN).balanceOf(address(this));
        uint256 repaymentAmount = currentRepaymentTokenBalance - state.lastRepaymentTokenBalance;

        terms.amountRepaid += repaymentAmount;

        if(terms.amountRepaid >= terms.amountOwed){
            _setLoanStatus(LoanStatus.Repaid);
        }

        state.lastRepaymentTokenBalance = currentRepaymentTokenBalance;

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

        // allow claiming of funds if the loan is still in the funding stage
        if(state.status == LoanStatus.Funding){
            lenderInfo[msg.sender].lendingAmount -= amount;
            state.amountRemaining += amount;
        } else {
            lenderInfo[msg.sender].claimedAmount += amount;
        }

        IERC20(BORROW_TOKEN).transfer(msg.sender, amount);

        emit LenderClaimedFunds(LOAN_ID, msg.sender, amount);
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

        if(state.status == LoanStatus.Funding){
            return _lender.lendingAmount;
        }

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