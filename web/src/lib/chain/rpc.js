import { ethers } from 'ethers';

export function getRPC(chainId){
    return `https://${chainId}.rpc.thirdweb.com`
}

export async function getGasPrice(chainId) {
    const rpc = getRPC(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    
    return provider.getGasPrice()
}

export async function getNonce(chainId, address) {
    const rpc = getRPC(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpc);

    return provider.getTransactionCount(address)
}

export async function estimateGasCost(chainId, gasUsed) {
    const gasPrice = await getGasPrice(chainId);
    
    return Number(ethers.utils.formatEther(gasPrice)) * gasUsed;
}