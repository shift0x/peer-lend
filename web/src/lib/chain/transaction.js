import { ethers } from "ethers";
import { getNonce, getRPC } from "./rpc";

export async function createTransaction(signer, to, data, value, includeGasLimit){
    const tx = { to }

    if(data)
        tx.data = data;

    if(value)
        tx.value = value;

    if(includeGasLimit){
        const gasLimit = await signer.estimateGas(tx);

        tx.gasLimit = gasLimit.mul(2);
    } 

    return tx;
}

export async function sendTransaction(signer, to, data, value){
    const tx = await createTransaction(signer, to, data, value, true);

    try {
        return await signer.sendTransaction(tx);
    } catch (err) {
        alert(err.message);
    }
}

export async function waitForTxReceipt(chainId, txHash) {
    const rpc = getRPC(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpc);

    return provider.waitForTransaction(txHash);
}

export function watchForCompletedTransactions(pendingNetworks, eoa, onTick){

    if(pendingNetworks.length == 0)
        return

    const interval = setInterval(async () => {
        var pendingNetworkCount = 0

        const networkStatus = [];

        for(var i = 0; i < pendingNetworks.length; i++){
            const network = pendingNetworks[i];
            const nonce = await getNonce(network.chainId, eoa)

            pendingNetworkCount += nonce == network.nonce ? 0 : 1;

            networkStatus.push({
                chainId: network.chainId,
                status: nonce == network.nonce ? "confirmed" : "pending"
            })
        }

        onTick(networkStatus);

        if(pendingNetworkCount == 0){
            clearInterval(interval);
        }

    }, 5000)

}