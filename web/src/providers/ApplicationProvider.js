import { TransactionQueueProvider} from '../providers/TransactionQueueProvider';
import { ConnectedAddressProvider } from './ConnectedAddressProvider';
import { NetworksProvider } from './NetworksProvider';
import { SendTransactionProvider } from './SendTransactionProvider';

const ApplicationProviders = ({children}) => {
    return (
        <NetworksProvider>
            <ConnectedAddressProvider>
                <SendTransactionProvider>
                    <TransactionQueueProvider>
                        { children }
                    </TransactionQueueProvider>
                </SendTransactionProvider>
            </ConnectedAddressProvider>
        </NetworksProvider>
    )
}

export default ApplicationProviders