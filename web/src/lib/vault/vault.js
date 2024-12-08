import { ethers } from "ethers";
import { makeCalldata } from "../chain/contract";
import { getRPC } from "../chain/rpc";
import { sendTransaction } from "../chain/transaction";

const BORROW_VAULT_ABI = `[{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allLoans","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"payor","type":"address"},{"internalType":"address","name":"payee","type":"address"},{"internalType":"string","name":"headline","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"loanAmount","type":"uint256"},{"internalType":"uint256","name":"loanPeriod","type":"uint256"},{"internalType":"uint256","name":"interestRateMin","type":"uint256"},{"internalType":"uint256","name":"interestRateMax","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"headline","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"loanAmount","type":"uint256"},{"internalType":"uint256","name":"loanPeriod","type":"uint256"},{"internalType":"uint256","name":"interestRateMin","type":"uint256"},{"internalType":"uint256","name":"interestRateMax","type":"uint256"}],"name":"createLendingPool","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getLoans","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"payor","type":"address"},{"internalType":"address","name":"payee","type":"address"},{"internalType":"string","name":"headline","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"loanAmount","type":"uint256"},{"internalType":"uint256","name":"loanPeriod","type":"uint256"},{"internalType":"uint256","name":"interestRateMin","type":"uint256"},{"internalType":"uint256","name":"interestRateMax","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct LoanMetadata[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"payor","type":"address"}],"name":"getLoansByPayor","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"payor","type":"address"},{"internalType":"address","name":"payee","type":"address"},{"internalType":"string","name":"headline","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"loanAmount","type":"uint256"},{"internalType":"uint256","name":"loanPeriod","type":"uint256"},{"internalType":"uint256","name":"interestRateMin","type":"uint256"},{"internalType":"uint256","name":"interestRateMax","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct LoanMetadata[]","name":"loans","type":"tuple[]"}],"stateMutability":"view","type":"function"}]`;
const BORROW_VAULT_ADDRESS = `0x411f81e5af5f84f81246fb5fd2d8747ddd11a0fc`;
const DEFAULT_CHAIN_ID = 42161;

export const createNewBorrowRequest = async (signer, headline, description, loanToken, loanAmount, interestRateMin, interestRateMax, loanPeriod ) => {
      const calldata = makeCalldata(BORROW_VAULT_ABI, "createLendingPool", 
            headline,
            description,
            loanToken,
            loanAmount,
            loanPeriod,
            interestRateMin,
            interestRateMax);

      return sendTransaction(signer, BORROW_VAULT_ADDRESS, calldata);
}

export const getOpenBorrowsForUser = async(address) => {
      console.log({
            "method": "getOpenBorrowsForUser",
            address
      })
      const rpc = getRPC(DEFAULT_CHAIN_ID);
      const provider = new ethers.providers.JsonRpcProvider(rpc);
      const contract = new ethers.Contract(BORROW_VAULT_ADDRESS, BORROW_VAULT_ABI, provider);

      const loans = await contract.getLoansByPayor(address);

      console.log(loans);
      return loans
}