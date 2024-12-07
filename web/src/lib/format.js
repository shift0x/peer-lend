export function formatNumber(number){
    return number > 1 ?
        number.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) :
        number.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 8})
}

export function shortString(str, length){
    if(str.length < length){
        return str;
    }

    return [str.substring(0, length), "..."].join("")
}