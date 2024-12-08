
import { Box, Button, Grid, Dialog, Typography, DialogTitle } from '@mui/material';
import { useState } from 'react';
import { useConnectionStatus } from '@thirdweb-dev/react';
import Web3WalletConnection from '../../features/web3-wallet-connection/Web3WalletConnection';
import OutstandinBorrows from '../../features/borrow/OutstandingBorrows';
import LendAction from '../../features/lend/LendAction';
import TradeAction from '../../features/trade/TradeAction';
import BorrowActionButton from '../../components/BrrowActionButton';
import BorrowAction from '../../features/borrow/BorrowAction';
import { useNetworks } from '../../providers/NetworksProvider';
import { useConnectedAddress } from '../../providers/ConnectedAddressProvider';


const headings = [
    { id: "borrow", name: "Borrow" },
    { id: "lend", name: "Lend" },
    { id: "trade", name: "Trade" }
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


export default function DashboardPage(){
    const [ selectedHeading, setSelectedHeading] = useState("borrow")
    const [ isModalActive, setIsModalActive] = useState(false);
    const [ activeModalContent, setActiveModalContent] = useState(null);

    const { defaultNetwork } = useNetworks()

    const connectionStatus = useConnectionStatus();

    function renderModalContent(content, header, data){
        setActiveModalContent({ content, header, data });
        setIsModalActive(true)
    }

    function closeModal(){
        setIsModalActive(false)
    }

    function completedNewBorrow(){
        closeModal()
    }

    function getActiveModal(){
        switch(activeModalContent.content) {
            case "borrow":
                return <BorrowAction network={defaultNetwork} onActionCompleted={completedNewBorrow} />
            default:
                return null;
        }
    }
    
    function renderModalContent(content, header, data){
        setActiveModalContent({ content, header, data });
        setIsModalActive(true)
    }

    function getContent(){
        if(connectionStatus != "connected")
            return requiredActionContainer(<Web3WalletConnection active={true} />);

        switch(selectedHeading){
            case "borrow":
                return <OutstandinBorrows renderModal={renderModalContent} />
            case "lend":
                return <LendAction />
            case "trade":
                return <TradeAction />
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

                    <Box sx={{
                        marginLeft: "auto",
                        justifyContent: "flex-end",
                        flexGrow: 1,
                        textAlign: "right"
                    }}>
                        
                        <BorrowActionButton 
                            onClick={() => { renderModalContent("borrow") }} />
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