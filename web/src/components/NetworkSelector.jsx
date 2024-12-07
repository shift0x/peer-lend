import PropTypes from 'prop-types';
import { Box } from "@mui/material";
import { StyledMenuItem } from './StyledMenuItem';
import { StyledSelect } from './StyledSelect';
import { StyledCaption } from './StyledCaption';
import { useChainId } from '@thirdweb-dev/react';
import { useEffect, useState } from 'react';
import { useNetworks } from '../providers/NetworksProvider';
import NetworkWithIcon from './NetworkWithIcon';


function NetworkSelector({onNetworkChanged, showLabel=true, selectSx={}, ...props}){
    const { networks } = useNetworks()
    const [selectedNetworkIndex, setSelectedNetworkIndex] = useState(-1);
    const selectedNetwork = selectedNetworkIndex == -1 ? null : networks[selectedNetworkIndex];
    const currentChainId = useChainId();
    

    useEffect(() => {
        onNetworkChanged(selectedNetwork);
    }, [selectedNetworkIndex])

    useEffect(() => {
        if(selectedNetworkIndex != -1)
            return;

        const connectedChainIndex = networks.map(n => { return n.chainId.toString() }).indexOf(currentChainId.toString());

        if(connectedChainIndex != -1){ 
            setSelectedNetworkIndex(connectedChainIndex);
        } else {
            setSelectedNetworkIndex(0);
        }
    }, [selectedNetworkIndex])

    return (
        <Box {...props}>

            {
                showLabel ?  <StyledCaption>Network</StyledCaption> : null
            }
            

            <StyledSelect
                sx={{ ...selectSx }}
                value={selectedNetworkIndex} 
                onChange={(e) => { setSelectedNetworkIndex(e.target.value) }}>

                { networks.map((network, index) => (
                    <StyledMenuItem value={index}>
                        <NetworkWithIcon network={network} height="25px" width="25px" />
                    </StyledMenuItem>
                ))}
            </StyledSelect>

        </Box>
    )
}

NetworkSelector.propTypes = {
    onNetworkChanged: PropTypes.func.isRequired,
};

export default NetworkSelector