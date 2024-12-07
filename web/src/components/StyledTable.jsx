import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box } from '@mui/material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: "#fff",
    '&:nth-of-type(odd)': {
        backgroundColor: "#f9f9f9",
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

function StyledTable({ headings, rows, showHeadings=true, elevate=true, justifyContent="flex-start", sx={} }){
    const alignment = justifyContent == "flex-start" ? "left" : "right";

    return (
        <TableContainer component={elevate ? Paper : null} sx={{
                borderRadius: 1,
                ...sx
            }}>
            <Table aria-label="customized table">
                <TableHead sx={{ display: showHeadings ? "table-header-group": "none"}}>
                    <TableRow key="header">
                        { headings.map((heading, index) => (
                            <StyledTableCell 
                                align={ index == 0 ? "left" : alignment}
                                key={heading.name}>
                                    {heading.content ?? heading.name}
                            </StyledTableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <StyledTableRow key={index}>
                            { headings.map((heading, index) => (
                                <StyledTableCell key={`${row.name}_${heading.id}`}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: index == 0 ? 'flex-start' : {justifyContent} }}
                                    >
                                        {row[heading.id]}
                                    </Box>
                                </StyledTableCell>
                            ))}
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

StyledTable.propTypes = {
    headings: PropTypes.arrayOf(PropTypes.object).isRequired,
    rows: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default StyledTable