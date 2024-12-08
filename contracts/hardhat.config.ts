import { vars } from "hardhat/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";


const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: vars.get("SEPOLIA_RPC_ADDRESS"),
      accounts: [ vars.get("SMART_CONTRACT_DEPLOYER") ],
    },
    hardhat: {
      forking: {
        url: vars.get("SEPOLIA_RPC_ADDRESS"),
      },
    },
  },
};

export default config;
