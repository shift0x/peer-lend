import StyledTable from "../../components/StyledTable"

function createHeading(name, id, content){
    return { name, id, content }
}

export default function OutstandinBorrows(){

    const headings = [
        createHeading("Asset", "asset"),
        createHeading("Symbol", "symbol"),
        createHeading("Chain", "chain"),
        createHeading("Balance", "balance")
    ]

    const rows = []

    return (
        <>
            <StyledTable headings={headings} rows={rows} justifyContent='flex-end' />
        </>
    )
}