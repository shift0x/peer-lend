import { createContext, useContext, useEffect, useState, useMemo } from "react"
import { useAddress } from "@thirdweb-dev/react";

export const TransactionStatus = {
    Queued: "queued",
    Pending: "pending",
    Success: "success",
    Failure: "failure"
}

const TransactionQueueContext = createContext(null);

export const useTransactionQueue = () => {
    const context = useContext(TransactionQueueContext)

    return context;
}

export const TransactionQueueProvider = ({children}) => {
    const [queuedTransactions, setQueuedTransactions] = useState([]);
    const connectedUserAddress = useAddress();
    const connectedAddress = useMemo(() => { return connectedUserAddress });

    useEffect(() => {
        setQueuedTransactions([])
    }, [connectedAddress])

    const addQueuedTransaction = (args) => {
        if(!args){ return; }
        
        let txs = [];

        if(!Array.isArray(args)) {
            txs.push(args);
        } else {
            txs = args;
        }

        const models = txs.map(tx => {
            return {
                id: queuedTransactions.length,
                status: TransactionStatus.Queued,
                ...tx
            }
        })


        setQueuedTransactions(prev => [...prev, ...models])
    }

    const removeQueuedTransaction = (tx) => {
        setQueuedTransactions(prev => { 
            return prev.filter(transaction => {
                return transaction.id != tx.id
            })
        })
    }

    const clearTransactionQueue = () => {
        setQueuedTransactions([]);
    }

    const value = {
        queuedTransactions,
        addQueuedTransaction,
        removeQueuedTransaction,
        clearTransactionQueue
    }

    return (
        <TransactionQueueContext.Provider value={value}>
            {children}
        </TransactionQueueContext.Provider>
    )
}
