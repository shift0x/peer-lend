import { utils } from 'ethers'

export function numberToBig(amount, decimals) {
    const fixedAmount = Number(amount).toFixed(decimals);

    return utils.parseUnits(fixedAmount, decimals).toString();
}

export function numberFromBig(amount, decimals){
    return Number(utils.formatUnits(amount.toString(), decimals));
}