// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {LoanMetadata} from './Types.sol';
import {ILoanPool} from './Interfaces.sol';
import {LendingPool} from './LendingPool.sol';

contract LendingVault {

    /// @notice mapping of payees to loan pool ids
    mapping(address => uint256[]) private _loanPoolsByPayor;

    /// @notice list of all loan pools in the system
    address[] private _loanPools;


    /**
     * @notice get all the loans in the system
     * @return loans the unfiltred loans
     */
    function getLoans() public view returns (LoanMetadata[] memory loans) {
        address[] memory loanPools = _loanPools;

        loans = new LoanMetadata[](loanPools.length);

        for(uint256 i = 0; i < loanPools.length; i++){
            loans[i] = ILoanPool(loanPools[i]).metadata();
        }
        
        return loans;
    }

    /**
     * @notice get loans opened by a payor
     * @param payor the payor to get the loans for
     * @return loans the loans associated to the payor
     */
    function getLoansByPayor(
        address payor
    ) public view returns (LoanMetadata[] memory loans) {
        uint256 length = _loanPoolsByPayor[payor].length;
        
        loans = new LoanMetadata[](length);

        for(uint256 i = 0; i < length; i++){
            uint256 poolId = _loanPoolsByPayor[payor][i];
            address pool = _loanPools[poolId];

            loans[i] = ILoanPool(pool).metadata();
        }

        return loans;
    }       


    /**
     * @notice create a new lending pool contract to manage deposits and loan 
     * terms for a given contract
     * @param headline the headline of the loan request
     * @param description the text description of the loan request
     * @param token the loan token 
     * @param loanAmount the loan amount
     * @param loanPeriod the loan period (days)
     * @param interestRateMin the minimum interest rate for the loan
     * @param interestRateMax the maximum interest rate for the loan
     */
    function createLendingPool(
        string memory headline,
        string memory description,
        address token,
        uint256 loanAmount,
        uint256 loanPeriod,
        uint256 interestRateMin,
        uint256 interestRateMax
    ) external {
        LoanMetadata memory metadata = LoanMetadata({
            id: _loanPools.length,
            payor: msg.sender,
            headline: headline,
            description: description,
            token: token,
            loanAmount: loanAmount,
            loanPeriod: loanPeriod,
            interestRateMin: interestRateMin,
            interestRateMax: interestRateMax,
            timestamp: block.timestamp
        });

        LendingPool pool = new LendingPool(metadata);

        _loanPools.push(address(pool));
        _loanPoolsByPayor[msg.sender].push(metadata.id);

    }
}