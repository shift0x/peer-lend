import { TransactionQueueProvider} from '../providers/TransactionQueueProvider';
import { NetworksProvider } from './NetworksProvider';
import { SendTransactionProvider } from './SendTransactionProvider';

const ApplicationProviders = ({children}) => {
    return (
        <NetworksProvider>
            <SendTransactionProvider>
                <TransactionQueueProvider>
                    { children }
                </TransactionQueueProvider>
            </SendTransactionProvider>
        </NetworksProvider>
    )
}

export default ApplicationProviders