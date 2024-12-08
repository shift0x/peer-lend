// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

struct LoanMetadata {
    uint256 id;
    address payor;
    string headline;
    string description;
    address token;
    uint256 loanAmount;
    uint256 loanPeriod;
    uint256 interestRateMin;
    uint256 interestRateMax;
    uint256 timestamp;
}

struct LoanState {
    uint256 createdAtTimestamp;
    uint256 discoverPeriodEndsAtTimestamp;
    uint256 amountRemaining;
    LoanStatus status;
}

struct Lender {
    address lender;
    uint256 lendingAmount;
    uint256 claimedAmount;
}

struct LoanTerms {
    uint256 loanId;
    uint256 principalAmount;
    uint256 interestRate;
    uint256 interestAmount;
    uint256 amountOwed;
    uint256 amountRepaid;
}

enum LoanStatus {
    Funding,
    Finalized,
    Released,
    Repaid
}