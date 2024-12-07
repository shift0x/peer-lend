import { TransactionQueueProvider} from '../providers/TransactionQueueProvider';
import { SendTransactionProvider } from './SendTransactionProvider';

const ApplicationProviders = ({children}) => {
    return (
        <SendTransactionProvider>
            <TransactionQueueProvider>
                { children }
            </TransactionQueueProvider>
        </SendTransactionProvider>
    )
}

export default ApplicationProviders