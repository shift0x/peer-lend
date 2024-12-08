import StyledTable from "../../components/StyledTable"
import { useConnectedAddress } from "../../providers/ConnectedAddressProvider"
import { useEffect, useState } from "react"
import { Button, Stack, Typography } from "@mui/material"
import { formatNumber } from "../../lib/format"

const actionButtonStyle = {
    padding: "3px 10px"
}

function createHeading(name, id, content){
    return { name, id, content }
}

export default function OutstandinBorrows({ renderModal }){
    const { connectedAddressLoans } = useConnectedAddress()
    const [rows, setRows] = useState([])

    useEffect(() => {
        const records = connectedAddressLoans.map(loan => {
            return createRow(loan)
        })

        setRows(records);
    }, [connectedAddressLoans])

    const headings = [
        createHeading("Name", "name"),
        createHeading("Token", "token"),
        createHeading("Amount", "amount"),
        createHeading("Days", "days"),
        createHeading("Status", "status"),
        createHeading("Rate", "rate"),
        createHeading("", "actions")
    ]

    function createRow(record){
        return {
            name: ( 
                <Typography variant='body1'>{record.headline}</Typography>
            ),
            token: (
                <Typography variant='body1' sx={{ 
                    textTransform: "uppercase"
                }}>{record.token.symbol}</Typography>
            ),
            amount: (
                <Typography variant='body1'>{formatNumber(record.loanAmount)}</Typography>
            ),
            days: (
                <Typography variant='body1'>{record.loanPeriod}</Typography>
            ),
            status: (
                <Typography variant='body1'>Status</Typography>
            ),
            rate: (
                <Typography variant='body1'>Rate</Typography>
            ),
            actions: (
                <Stack direction="row" spacing={1}>
                    <Button variant='outlined' sx={actionButtonStyle} onClick={() => { renderModal("repay") }} disabled={true}>Repay</Button>
                    <Button variant='outlined' sx={actionButtonStyle} onClick={() => { renderModal("release") }} disabled={true}>Release Funds</Button>
                </Stack>
            )
        }
    }


    return (
        <>
            <StyledTable headings={headings} rows={rows} justifyContent='flex-end' />
        </>
    )
}