import { Box, Stack } from "@mui/material";
import { useMemo, useState } from "react";
import SubmitTransactionButton from "../../components/SubmitTransactionButton";
import { numberToBig } from "../../lib/chain/numbers";
import AssetSelector from '../../components/AssetSelector';
import AmountInput from "../../components/AmountInput";
import CaptionedTextField from "../../components/CaptionedTextField";
import { createNewBorrowRequest } from "../../lib/vault/vault";


function BorrowAction({ onActionCompleted, network }){
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [headline, setHeadline] = useState("");
    const [description, setDescription] = useState("");
    const [loanAmount, setLoanAmount] = useState(null);
    const [loanPeriod, setLoanPeriod] = useState(null)
    const [interestRate, setInterestRate] = useState(null);
    const [maxInterestRate, setMaxInterestRate] = useState(null);

    const canSubmit = selectedAsset != null && loanAmount != null && interestRate != null && maxInterestRate != null && loanPeriod != null;
    const interestRateSpread = .12;

    useMemo(() => {
        if(!interestRate)
            return

        const amount = Number(interestRate);
        const interestRateAdjustmentAmount = interestRateSpread*100;
        const max = `${(amount + interestRateAdjustmentAmount).toFixed(2)}%`

        setMaxInterestRate(max);
    }, [interestRate])

    async function submitTransaction(signer){
        const amount = numberToBig(Number(loanAmount), selectedAsset.decimals);
        const interestRateAsPercentage = Number(interestRate)/100;
        const interestRateMin = numberToBig(interestRateAsPercentage, 18);
        const interestRateMax = numberToBig(interestRateAsPercentage + interestRateSpread, 18);
        
        return createNewBorrowRequest(signer, 
            headline, 
            description,
            selectedAsset.address,
            amount,
            interestRateMin,
            interestRateMax,
            loanPeriod);
    }

    return (
        <>
            <CaptionedTextField 
                label="Headline"
                rows={1}
                onTextChanged={setHeadline}
            />

            <CaptionedTextField 
                label="Description"
                sx={{mt:3}}
                rows={3}
                onTextChanged={setDescription}
            />

            <Stack direction="row" spacing={1} sx={{mt:3}}>
                <AssetSelector 
                    sx={{flex: 1}}
                    selectSx={{marginTop: "0px"}}
                    network={network} 
                    onSelectedAssetChanged={setSelectedAsset} />
            </Stack>

            <Stack direction="row" spacing={1} sx={{mb: 2}}>
                <Box sx={{width: "50%"}}>
                    <AmountInput
                        caption="Loan Amount"
                        containerSx={{mt: 3}}
                        checkForInsuffientInput={false}
                        displayBalances={false}
                        asset={selectedAsset}
                        network={network}
                        minimumValue={0}
                        onAmountInChanged={setLoanAmount} />
                </Box>
                <Box sx={{width: "50%"}}>
                    <AmountInput
                        caption="Loan Period (days)"
                        containerSx={{mt: 3}}
                        checkForInsuffientInput={false}
                        displayBalances={false}
                        minimumValue={1}
                        defaultValue={30}
                        onAmountInChanged={setLoanPeriod} />
                </Box>
            </Stack>

            
            <Stack direction="row" spacing={1} sx={{mb: 2}}>
                <Box sx={{width:"50%"}}>
                    <AmountInput sx={{width: "100%", marginTop: 0}}
                        caption="Interest Rate (min)"
                        checkForInsuffientInput={false}
                        displayBalances={false}
                        onAmountInChanged={setInterestRate}
                        inputSx={{padding: "2px"}} />
                </Box>
                <Box sx={{width:"50%"}}>
                    <AmountInput sx={{width: "100%", marginTop: 0}}
                        caption="Interest Rate (max)"
                        checkForInsuffientInput={false}
                        displayBalances={false}
                        readonly={true}
                        inputSx={{
                            backgroundColor: "#efefef",
                            padding: "2px"
                        }}
                        value={maxInterestRate} />
                </Box>
            </Stack>    
            


            <SubmitTransactionButton 
                network={network}
                disabled={!canSubmit} 
                label="Publish Loan Request" 
                showDivider={false}
                onSubmitTransaction={submitTransaction} 
                callback={onActionCompleted}
                waitForConfirmation={true} />
        </>
    )
}


export default BorrowAction