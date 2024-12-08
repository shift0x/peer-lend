
import { ethers, network } from "hardhat";
import { LendingPool, LendingVault } from "../typechain-types";
import { approve, balanceOf, impersonateTransferERC20 } from "./erc20";

export const USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
export const USDC_POOL = "0x3289680dd4d6c10bb19b899729cda5eef58aeff1"

export const DEFAULT_PERIOD = 30;
export const DEFAULT_INTEREST_RATE_MIN = ethers.parseEther("0.0125");

export const createNewLoan  = async(vault : LendingVault, amount : any) => {
    const headline = "test headline";
    const description = "test description";
    const token = USDC;
    const period = DEFAULT_PERIOD;
    const interestRateMin = DEFAULT_INTEREST_RATE_MIN;
    const interestRateMax = ethers.parseEther("10.25")

    await vault.createLendingPool(
        headline,
        description,
        token,
        amount,
        period,
        interestRateMin,
        interestRateMax
    )

    return {
        headline,
        description,
        token,
        period,
        interestRateMin,
        interestRateMax,
        amount
    }
}

export const fundLoan = async(pool: LendingPool, fundingAmount : any, fundingAccount : any) => {
    const poolAddress = await pool.getAddress()

    // Impersonate the account
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [fundingAccount]
    });

    // Get the signer for the impersonated account
    const ownerSigner = await ethers.getSigner(fundingAccount);

    await approve(await pool.BORROW_TOKEN(), poolAddress, ownerSigner);
    await impersonateTransferERC20(USDC_POOL, USDC, fundingAmount, fundingAccount);

    await pool.connect(ownerSigner).fund(fundingAmount);
}