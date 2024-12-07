import { getRPC } from "../chain/rpc";
import { callContract, makeCalldata } from '../chain/contract';
import erc20 from './abi.json';
import { numberFromBig } from "../chain/numbers";

const erc20TokenDecimalCache = {}

export async function getERC20TokenDecimals(chainId, address){
    const id = `${chainId}.${address}`
    const decimals = erc20TokenDecimalCache[id];

    if(decimals)
        return decimals;

    const rpc = getRPC(chainId);
    const result = await callContract(rpc, erc20, address, "decimals");

    erc20TokenDecimalCache[id] = result[0];

    return result[0];
}

export async function getERC20TokenAllowance(chainId, owner, spender, token, decimals){
    const rpc = getRPC(chainId);
    const result = (await callContract(rpc, erc20, token, "allowance", owner, spender))[0]
    const allowance = numberFromBig(result, decimals);
    
    return allowance;
}

export async function transferERC20Token(to, amountBig){
    return makeCalldata(erc20, "transfer", to, amountBig);
}

export async function makeERC20TokenApproveCalldata(spender, cap){
    if(!cap)
        cap = "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    
    return makeCalldata(erc20, "approve", spender, cap)
}

export async function ensureERC20Allowance(network, owner, spender, minAllowance, asset, label, onNewTransaction){
    const allowance = await getERC20TokenAllowance(network.chainId, 
        owner,
        spender, 
        asset.address, 
        asset.decimals);

    if(allowance < minAllowance){
        const approveCalldata = await makeERC20TokenApproveCalldata(spender);
        
        onNewTransaction(
            {
                label: label,
                network: network,
                params: {
                    to: asset.address,
                    data: approveCalldata,
                    gasLimit: 300000,
                    value: 0,
                    chainId: network.chainId.toString()
                }
            }
        );
    }
}