// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LendingVaultModule = buildModule("LendingVaultModule", (m) => {

    const vault = m.contract("LendingVault");
  
    return { vault };
  });
  
  export default LendingVaultModule;