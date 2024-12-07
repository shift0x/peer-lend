import { Box, Button } from "@mui/material";
import Hero from "../../components/Hero";
import { Link } from "react-router-dom";


export default function HomePage(){
    return (
        <Box
            sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
            textAlign: "center",
            }}
        >
            <Hero />
            <Box sx={{textAlign: "center"}}>
                <Link to="/dashboard">
                    <Button variant="contained"
                        sx={{
                            pl: 8,
                            pr: 8,
                            fontWeight: "bold"
                        }}
                    >Enter App</Button>
                </Link>
            </Box>
        </Box>
    )
}