import { makeCalldata } from '../../lib/chain/contract'
import { sendTransaction } from "../../lib/chain/transaction";

const BORROW_VAULT_ABI = ``;
const BORROW_VAULT_ADDRESS = ``;

export const createNewBorrowRequest = async (signer, tokenAddress, borrowAmount, interestRate, headline, description) => {
   const calldata = makeCalldata(BORROW_VAULT_ABI, "createBorrow", tokenAddress, borrowAmount, interestRate, headline, description)

   return sendTransaction(signer, BORROW_VAULT_ADDRESS, calldata);
}