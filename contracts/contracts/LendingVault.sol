// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {LoanMetadata} from './Types.sol';
import {ILoanPool} from './Interfaces.sol';
import {LendingPool} from './LendingPool.sol';

import 'hardhat/console.sol';

contract LendingVault {

    /// @notice mapping of payees to loan pool ids
    mapping(address => uint256[]) private loanPoolsByPayor;

    /// @notice list of all loan pools in the system
    LoanMetadata[] public allLoans;


    /**
     * @notice get all the loan pools
     * @return the loan pools
     */
    function getLoans() public view returns (LoanMetadata[] memory) {
        return allLoans;
    }

    /**
     * @notice get loans opened by a payor
     * @param payor the payor to get the loans for
     * @return loans the loans associated to the payor
     */
    function getLoansByPayor(
        address payor
    ) public view returns (LoanMetadata[] memory loans) {
        uint256 length = loanPoolsByPayor[payor].length;
        
        loans = new LoanMetadata[](length);

        for(uint256 i = 0; i < length; i++){
            uint256 poolId = loanPoolsByPayor[payor][i];
            
            loans[i] = allLoans[poolId];
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
        LendingPool pool = new LendingPool(
            allLoans.length,
            loanAmount,
            interestRateMin,
            interestRateMax,
            token,
            msg.sender,
            loanPeriod
        );

        LoanMetadata memory metadata = LoanMetadata({
            id: allLoans.length,
            payor: msg.sender,
            payee: address(pool),
            headline: headline,
            description: description,
            token: token,
            loanAmount: loanAmount,
            loanPeriod: loanPeriod,
            interestRateMin: interestRateMin,
            interestRateMax: interestRateMax,
            timestamp: block.timestamp
        });

        allLoans.push(metadata);
        loanPoolsByPayor[msg.sender].push(metadata.id);

    }
}