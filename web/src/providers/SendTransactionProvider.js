import { useSigner, useSwitchChain } from "@thirdweb-dev/react";
import { createContext, useContext, useEffect, useState } from "react"
import { sendTransaction } from "../lib/chain/transaction";

const SendTransactionContext = createContext(null);

export const useSendTransaction = () => {
    const context = useContext(SendTransactionContext);

    return context
}

export const SendTransactionProvider = ({children}) => {
    const [ executableTransaction, setExecutableTransaction ] = useState(null);
    
    const switchChain = useSwitchChain();
    const signer = useSigner();

    const sendTransactionFromChain = async (chainId, tx, callback) => {
        await switchChain(chainId);

        setExecutableTransaction({ tx, callback });
    }

    const doExecute = async (params) => {
        const tx = params.tx;
        const onCompleted = async (data) => {
            setExecutableTransaction(null);

            if(params.callback){
                await params.callback({...data})
            }
        }

        try {
            const submittedTx = await sendTransaction(signer, tx.to, tx.data, tx.value)
            const receipt = await submittedTx.wait();

            await onCompleted(receipt);
        } catch (error){ 
            await onCompleted({error});
        } 
    }

    useEffect(() => {
        if(!executableTransaction){ return }

        doExecute(executableTransaction);
    }, [executableTransaction])

    const value = {
        sendTransactionFromChain
    }

    return (
        <SendTransactionContext.Provider value={value}>
            {children}
        </SendTransactionContext.Provider>
    )

}