import { Box, Button, Grid, Dialog, Typography, DialogTitle } from '@mui/material';
import { useState } from 'react';
import PortfolioHoldings from '../../features/portfolio-holdings/PortfolioHoldings';
import Swap from '../../features/swap/Swap';
import { useConnectionStatus } from '@thirdweb-dev/react';
import Web3WalletConnection from '../../features/web3-wallet-connection/Web3WalletConnection';
import CreateNewAccount from '../../features/create-account/CreateNewAccount';
import TransferAction from '../../features/transfer-action/TransferAction';
import WithdrawAction from '../../features/withdraw-action/WithdrawAction';
import DepositAction from '../../features/deposit-action/DepositAction';
import { useUserAccount } from '../../providers/UserAccountProvider';
import { useConnectedAddress } from '../../providers/ConnectedAddressProvider';
import TransactionsActionButton from '../../features/transaction-bundler/TransactionsActionButton';
import DepositActionButton from '../../components/DepositActionButton';
import SubmitTransactionsAction from '../../features/transaction-bundler/SubmitTransactionsAction';
import Earn from '../../features/portfolio-earn/Earn';
import EnterLiquidityPoolAction from '../../features/portfolio-earn/EnterLiquidityPoolAction';

const headings = [
    { id: "holdings", name: "Holdings" },
    { id: "swap", name: "Swap" },
    { id: "earn", name: "Earn" },
    { id: "borrowAndLend", name: "Borrow / Lend" },
]


const headingStyle = (selected) => {
    return {
        mr: 6,
        fontSize: "1.75em",
        color: selected ? "#000" : "#CCC",
        borderBottom: selected ? "2px solid #000" : "none",
        cursor: "pointer"
    }
}

const requiredActionContainer = (content) => {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 13,
            border: "1px solid #efefef",
            backgroundColor: "#fcfcfc",
            borderRadius: 2
        }}>
            {content}
        </Box>
    )
}

export default function PortfolioPage(){
    const [ selectedHeading, setSelectedHeading] = useState("holdings")
    const [ isModalActive, setIsModalActive] = useState(false);
    const [ activeModalContent, setActiveModalContent] = useState(null);
    const { userAccount, updateUserAccount } = useUserAccount()
    const { updateConnectedAddressBalances } = useConnectedAddress()

    
    const connectionStatus = useConnectionStatus();

    function renderModalContent(content, header, data){
        setActiveModalContent({ content, header, data });
        setIsModalActive(true)
    }

    async function updateBalancesAndClose(){
        closeModal()

        await updateConnectedAddressBalances();
        await updateUserAccount();
    }

    function closeModal(){
        setIsModalActive(false)
    }

    function getActiveModal(){
        switch(activeModalContent.content) {
            case "transfer":
                return <TransferAction data={activeModalContent.data} account={userAccount} onActionCompleted={closeModal} />
            case "withdraw":
                return <WithdrawAction data={activeModalContent.data} account={userAccount} onActionCompleted={closeModal} />
            case "deposit":
                return <DepositAction data={activeModalContent.data} account={userAccount} onActionCompleted={updateBalancesAndClose} />
            case "transactions":
                return <SubmitTransactionsAction data={activeModalContent.data} onActionCompleted={updateBalancesAndClose} />
            case "enter-liquidity-pool":
                return <EnterLiquidityPoolAction data={activeModalContent.data} onActionCompleted={closeModal} />
            default:
                return null;
        }
    }
    

    function getContent(){
        if(connectionStatus != "connected")
            return requiredActionContainer(<Web3WalletConnection active={true} />);
        else if(!userAccount) 
            return requiredActionContainer(<CreateNewAccount />);

        switch(selectedHeading){
            case "holdings":
                return <PortfolioHoldings renderModal={renderModalContent} />
            case "swap":
                return <Swap />
            case "earn":
                return <Earn renderModal={renderModalContent} />
            default:
                return requiredActionContainer(
                    <Typography sx={{textTransform: "uppercase", color: "#666", fontWeight: "bold"}}>...Coming Soon...</Typography>
                )
        }
    }

    return (
        <>
            <Grid key="sub-navigation" sx={{
                display: "flex",
                flexDirection: "row",
            }}>
                { headings.map(heading => (
                    <Typography 
                        key={heading.id}
                        variant="h3" 
                        sx={headingStyle(selectedHeading==heading.id)}
                        onClick={ () => { setSelectedHeading(heading.id)}}
                    >{heading.name}</Typography>
                ))}

                { 
                    userAccount == null ? null : 

                    <Box sx={{
                        marginLeft: "auto",
                        justifyContent: "flex-end",
                        flexGrow: 1,
                        textAlign: "right"
                    }}>
                        <DepositActionButton 
                            onClick={() => { renderModalContent("deposit") }}
                            sx={{mr: 2 }} />

                        <TransactionsActionButton
                            onClick={() => { renderModalContent("transactions") }}
                        />
                    </Box>
                
                }
            </Grid>
            <Box key="content" sx={{ mt: 6 }}>
                { getContent() }
            </Box>

            <Dialog key="dialog" open={isModalActive} onClose={ () => { setIsModalActive(false)}}>
                <Box sx={{ 
                    minWidth: "400px",
                    backgroundColor: "#f5f5f5"
                }}>
                    {
                        activeModalContent != null ? 
                            <>
                                <DialogTitle variant='h6' sx={{ 
                                        fontFamily: "Poppins",
                                        fontSize: "15px",
                                        textTransform: "uppercase",
                                        textAlign: "center"
                                    }}>
                                    {activeModalContent.header ?? activeModalContent.content}
                                </DialogTitle>

                                <Box sx={{ backgroundColor: "#fff", padding: 2, pb: 4 }}>
                                    { getActiveModal() }

                                    <Button variant="outlined" sx={{width: "100%", marginTop: 2}} onClick={closeModal}>Close</Button>
                                </Box>
                            </>
                            :
                            null
                    }
                    
                </Box>
            </Dialog>
            
        </>
    )
}