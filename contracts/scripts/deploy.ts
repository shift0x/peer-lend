import { ethers } from "hardhat";

const deploy = async () => {
    const contract = await ethers.getContractFactory("LendingVault")

    const vault = await contract.deploy();

    await vault.waitForDeployment()

    const address = await vault.getAddress()

    console.log(`deployed vault: ${address}`);
}

deploy()
    .then(() => { process.exit() })