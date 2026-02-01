// 1. Check if provider exists
if (!window.ethereum) {
    dbg.innerText = "Please install MetaMask or another Web3 wallet.";
    return;
}

// 2. Standardize comparison (Hex 0x1 is decimal 1)
const targetChainId = '0x1'; 

if (window.ethereum.networkVersion !== '1') {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }], 
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            dbg.innerText = "Ethereum Mainnet is missing from your wallet provider.";
            // Optionally: Trigger wallet_addEthereumChain here if it were a custom L2
        } else if (switchError.code === 4001) {
            dbg.innerText = "User rejected the network switch.";
        } else {
            dbg.innerText = `Switch Error: ${switchError.message}`;
        }
    }
}
