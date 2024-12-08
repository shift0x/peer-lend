
import {AbiCoder} from 'ethers';
import {ethers, network} from 'hardhat';

const MAX_INT = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

export async function approve(tokenAddress : string, spender: string, signer: any = null) : Promise<void> {
    const token = await ethers.getContractAt("IERC20", tokenAddress);

    if(signer){
        await token.connect(signer).approve(spender, MAX_INT);
    } else {
        await token.approve(spender, MAX_INT);
    }

}

export async function transferERC20(tokenAddress: string, amount : any, to : string) : Promise<void> {
    const token = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", tokenAddress);

    await token.transfer(to, amount);
}


export async function impersonateTransferERC20(owner : string, tokenAddress : string, amount : any, to: string) : Promise<void> {
    // impersonate an account with access to call the contract
    // Replace 'accountToImpersonate' with the address of the account you want to impersonate
    const accountToImpersonate = owner;

    // Impersonate the account
    await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [accountToImpersonate]
    });

    // Get the signer for the impersonated account
    const ownerSigner = await ethers.getSigner(accountToImpersonate);

    const tokenContract = (await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", tokenAddress)) as any;

    // Set the desired balance in Wei
    const desiredBalanceWei = AbiCoder.defaultAbiCoder().encode(["uint256"], ["1000000000000000000"])

    // Set the balance of the signer account
    await ethers.provider.send("hardhat_setBalance", [accountToImpersonate, desiredBalanceWei]);

    await tokenContract.connect(ownerSigner).transfer(to, amount);
}

export async function balanceOf(tokenAddress : string, account : string) : Promise<any> {
    const token = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", tokenAddress);
    const balance = await token.balanceOf(account);

    return balance;
}

export async function getSymbol(tokenAddress : string) : Promise<string> {
    const token = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol:IERC20Metadata", tokenAddress);
    const symbol = await token.symbol();
    
    return symbol;
}

export async function transferERC20Balance(from : string, to : string, token : string) : Promise<void> {
    var balance = await balanceOf(token, from);

    await transferERC20(token, balance, to);
}