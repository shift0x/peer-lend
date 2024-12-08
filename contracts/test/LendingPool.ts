import {
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { expect } from "chai";
import { ethers } from "hardhat";
import { createNewLoan, DEFAULT_PERIOD, fundLoan, USDC, USDC_POOL } from "./helpers";
import { approve, balanceOf, impersonateTransferERC20, transferERC20 } from "./erc20";


const LOAN_AMOUNT = ethers.parseUnits("100", 6);


describe("Lending Pool", () => {

    async function setup(){
        const contract = await ethers.getContractFactory("LendingVault")

        const vault = await contract.deploy();

        await vault.waitForDeployment()

        await createNewLoan(vault, LOAN_AMOUNT)

        const poolInfo = await vault.allLoans(0)
        const pool = await ethers.getContractAt("LendingPool", poolInfo.payee);
        const poolAddress = await pool.getAddress()

        return { vault, pool, poolAddress }
    }

    describe("loan pool configuration", () => {

        it("should set immutables", async () => {
            const { pool } = await loadFixture(setup);
            const [deployer] = await ethers.getSigners()

            expect(await pool.LOAN_ID()).is.equal(0);
            expect(await pool.BORROW_TOKEN()).is.equal(USDC)
            expect(await pool.LOAN_PERIOD_DAYS()).is.equal(DEFAULT_PERIOD);
            expect(await pool.LOAN_REQUESTOR()).is.equal(deployer.address);
            expect(await pool.REQUESTED_LOAN_AMOUNT()).is.equal(LOAN_AMOUNT);
        })
    })

    describe("funding", () => {

        it("should fund loan", async () => {
            const {pool} = await loadFixture(setup);
            const [deployer] = await ethers.getSigners()

            // setup and fund funder account
            const fundingAmount = ethers.parseUnits("10", 6);
            
            const preFundingLenderInfo = await pool.lenderInfo(deployer.address);
            const preFundingLoanState = await pool.state();

            await fundLoan(pool, fundingAmount, deployer.address);

            const postFundingLenderInfo = await pool.lenderInfo(deployer.address);
            const postFundingLoanState = await pool.state();

            // funding account expectations
            expect(preFundingLenderInfo.lendingAmount).is.equal(0);
            expect(postFundingLenderInfo.lendingAmount).is.equal(fundingAmount);
            expect(postFundingLenderInfo.claimedAmount).is.equal(0);

            // loan state expectations
            const expected = Number(ethers.formatUnits(LOAN_AMOUNT, 6)) - Number(ethers.formatUnits(fundingAmount, 6))
            expect(preFundingLoanState.amountRemaining).is.equal(LOAN_AMOUNT);
            expect(postFundingLoanState.amountRemaining).is.equal(ethers.parseUnits(expected.toString(), 6))
        })
    })

    describe("Loan Terms", () => {

        it("should finalize loan terms", async () => {
            const {pool} = await loadFixture(setup);
            const [fundingAccount] = await ethers.getSigners()

            // setup and fund funder account
            const fundingAmount = ethers.parseUnits("10", 6);

            await fundLoan(pool, fundingAmount, fundingAccount.address);

            const preFinalizationTerms = await pool.terms();

            await pool.finalizeLoanTerms()

            const postFinalizationTerms = await pool.terms();
            const status = (await pool.state()).status
            
            expect(status).is.equal(1)
            expect(preFinalizationTerms.principalAmount).is.equal(0);
            expect(postFinalizationTerms.principalAmount).is.equal(fundingAmount);
            expect(postFinalizationTerms.interestAmount).is.greaterThan(0);
            expect(postFinalizationTerms.amountOwed).is.greaterThan(fundingAmount);
        })
    });

    describe("Release Funds", () => {

        it("should release funds", async () => {
            const {pool} = await loadFixture(setup);
            const [payor, fundingAccount] = await ethers.getSigners()

            // setup and fund funder account
            const fundingAmount = ethers.parseUnits("10", 6);

            await fundLoan(pool, fundingAmount, fundingAccount.address);
            
            const preReleasePayorBalance = await balanceOf(USDC, payor.address)

            await pool.releaseFunds()

            const postReleasePayorBalance = await balanceOf(USDC, payor.address)

            const amountReleased = postReleasePayorBalance - preReleasePayorBalance

            expect(amountReleased).is.equal(fundingAmount);

        })
    })

    describe("Repay", () => {

        it("should allow partial loan repayment", async() => {
            const {pool, poolAddress} = await loadFixture(setup);
            const [payor, fundingAccount] = await ethers.getSigners()

            // setup and fund funder account
            const fundingAmount = ethers.parseUnits("10", 6);

            await fundLoan(pool, fundingAmount, fundingAccount.address);
            await pool.releaseFunds()

            const repaymentAmount = ethers.parseUnits("1", 6)

            await transferERC20(USDC, repaymentAmount, poolAddress)
            await pool.acceptPayment()

            const terms = await pool.terms()

            expect(terms.amountRepaid).is.equal(repaymentAmount);
        })

        it("should close loan on full repayment", async() => {
            const {pool, poolAddress} = await loadFixture(setup);
            const [payor, fundingAccount] = await ethers.getSigners()

            // setup and fund funder account
            const fundingAmount = ethers.parseUnits("10", 6);

            await fundLoan(pool, fundingAmount, fundingAccount.address);
            await pool.releaseFunds()

            const terms = await pool.terms();

            await impersonateTransferERC20(USDC_POOL, USDC, terms.amountOwed, payor.address);
            await transferERC20(USDC, terms.amountOwed, poolAddress)
            await pool.acceptPayment()

            const state = await pool.state()
            const postRepaymentTerms = await pool.terms()

            expect(state.status).is.equal(3)
            expect(postRepaymentTerms.amountRepaid).is.equal(postRepaymentTerms.amountOwed);
        })
    })

    describe("Withdrawl", () => {
        it("should allow withdrawl on partial payment", async() => {
            const {pool, poolAddress} = await loadFixture(setup);
            const [payor, fundingAccountA, fundingAccountB] = await ethers.getSigners()

            // setup and fund funder account
            const fundingAmountA = ethers.parseUnits("10", 6);
            const fundingAmountB = ethers.parseUnits("20", 6)

            await fundLoan(pool, fundingAmountA, fundingAccountA.address);
            await fundLoan(pool, fundingAmountB, fundingAccountB.address);
            await pool.releaseFunds()

            const repaymentAmount = ethers.parseUnits("1", 6)

            await transferERC20(USDC, repaymentAmount, poolAddress)
            await pool.acceptPayment()

            const claimableAmountA = await pool.getClaimableAmount(fundingAccountA.address)
            const claimableAmountB = await pool.getClaimableAmount(fundingAccountB.address)
            const expectedClaimableAmountA = ethers.parseUnits("332987", 6)
            const expectedClaimableAmountB = ethers.parseUnits("665975", 6)

            expect(claimableAmountA - expectedClaimableAmountA).is.lessThanOrEqual("1");
            expect(claimableAmountB - expectedClaimableAmountB).is.lessThanOrEqual("1");
        })

        it("should allow withdrawl during funding period", async() => {
            const {pool} = await loadFixture(setup);
            const [funder] = await ethers.getSigners()

            const fundingAmount = ethers.parseUnits("10", 6);
            await fundLoan(pool, fundingAmount, funder.address);

            const preWithdrawlState = await pool.state();
            
            await pool.withdraw(fundingAmount);

            const postWithdrawlState = await pool.state();

            expect(preWithdrawlState.amountRemaining).is.equal(LOAN_AMOUNT - fundingAmount);
            expect(postWithdrawlState.amountRemaining).is.equal(LOAN_AMOUNT);
        })
    })
});