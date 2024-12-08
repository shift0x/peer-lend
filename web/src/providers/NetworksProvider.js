import { createContext, useContext } from "react";
import { getNetworks } from "../lib/networks/networks"

const networks = getNetworks();

const NetworksContext = createContext(null);

const defaultNetwork = networks.find(network => { return network.default})

export const useNetworks = () => {
    const context = useContext(NetworksContext)

    return context
}

export const NetworksProvider = ({children}) => {

    const getNetworkByChainId = (id) => {
        return networks.find(network => { return network.chainId.toString() == id.toString() });
    }

    const getNetworkTokenByChainId = (chainId, address) => {
        const network = getNetworkByChainId(chainId);

        if(!network) { return null; }

        if(address == "native"){ 
            return {
                symbol: network.native.symbol.toUpperCase(),
                name: `${network.native.symbol.toUpperCase()} (Native)`,
                image: network.native.icon,
                decimals: network.native.decimals,
                chain: network
            }
        }

        const asset = network.tokens.find(token => { return token.address.toLowerCase() == address.toLowerCase() });

        return { ...asset, chain: network}
    }


    const value = {
        networks,
        getNetworkByChainId,
        getNetworkTokenByChainId,
        defaultNetwork
    }

    return (
        <NetworksContext.Provider value={value}>
            {children}
        </NetworksContext.Provider>
    )
}