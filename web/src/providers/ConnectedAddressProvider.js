import { useAddress } from "@thirdweb-dev/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNetworks } from "./NetworksProvider";
import { getOpenBorrowsForUser } from "../lib/vault/vault";
import { numberFromBig } from "../lib/chain/numbers";
import { useChainId } from '@thirdweb-dev/react';

const ConnectedAddressContext = createContext(null);

export const useConnectedAddress = () => {
    const context = useContext(ConnectedAddressContext);

    return context;
}

export const ConnectedAddressProvider = ({children}) => {
    const [connectedAddressLoans, setConnectedAddressLoans] = useState(null);
    const connectedUserAddress = useAddress();
    const {getNetworkTokenByChainId} = useNetworks()
    const chainId = useChainId();

    const updateConnectedAddressLoans = async () => {
        
        const raw = await getOpenBorrowsForUser(connectedAddress)

        const loans = raw.map(loan => {
            const model = {
                ...loan
            }

            const token = getNetworkTokenByChainId(chainId, model.token)

            model.id = numberFromBig(loan.id, 1)
            model.interestRateMin = numberFromBig(loan.interestRateMin, 18)
            model.interestRateMax = numberFromBig(loan.interestRateMax, 18)
            model.loanPeriod = numberFromBig(loan.loanPeriod, 0)
            model.loanAmount = numberFromBig(loan.loanAmount, token.decimals);
            model.token = token;
            
            return model
        })

        setConnectedAddressLoans(loans);
    }

    const connectedAddress = useMemo(() => { return connectedUserAddress });

    useEffect(() => {
        if(!connectedAddress){
            setConnectedAddressLoans([])
        } else {
            updateConnectedAddressLoans();
        }
    }, [connectedAddress])

    const value = {
        connectedAddress, 
        connectedAddressLoans, 
        updateConnectedAddressLoans
    }

    return (
        <ConnectedAddressContext.Provider value={value}>
            {children}
        </ConnectedAddressContext.Provider>
    )
}