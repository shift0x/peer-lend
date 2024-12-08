import {
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { expect } from "chai";
import { ethers } from "hardhat";
import { createNewLoan } from "./helpers";

describe("Lending Vault", () => {

    async function setup(){
        const contract = await ethers.getContractFactory("LendingVault")

        const vault = await contract.deploy();

        await vault.waitForDeployment()

        return { vault }
    }


    it("should create lending pools for loans", async () => {
        const { vault } = await loadFixture(setup);

        const args = [
            await createNewLoan(vault, ethers.parseUnits("700", 6)),
            await createNewLoan(vault, ethers.parseUnits("100", 6))
        ]

        const loans = await vault.getLoans()
        
        expect(loans.length).is.equal(2);

        for(var i = 1; i < 2; i++){
            const loan = loans[i];
            const arg = args[i];

            expect(loan.id).is.equal(i);
            expect(loan.headline).is.equal(arg.headline);
            expect(loan.description).is.equal(arg.description);
            expect(loan.loanAmount).is.equal(arg.amount);
            expect(loan.loanPeriod).is.equal(arg.period)
        }
    });

    it("should get loans by payor", async() => {
        const { vault } = await loadFixture(setup);
        const [deployer, anotherSender] = await ethers.getSigners()

        await createNewLoan(vault, ethers.parseUnits("700", 6)),
        await createNewLoan(vault, ethers.parseUnits("100", 6))

        const loansForSender = await vault.getLoansByPayor(deployer.address);
        const loansForAnotherAccount = await vault.getLoansByPayor(anotherSender.address);

        expect(loansForSender.length).is.equal(2);
        expect(loansForAnotherAccount.length).is.equal(0);
    });

});