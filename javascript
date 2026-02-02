// 🔱 TITAN_V88: BLOCKCHAIN SETTLEMENT ENGINE
async function withdrawToPersonalWallet() {
    if (!window.ethereum) {
        alert("🔱 ACCESS DENIED: Please use a Web3 Browser (MetaMask/Trust).");
        return;
    }

    try {
        // 1. Connect to the Browser Wallet
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        
        // 2. Calculate the Real ETH amount
        const ethAmount = (points * 0.00001).toFixed(6);
        
        if (parseFloat(ethAmount) < 0.001) {
            alert("🔱 INSUFFICIENT YIELD: Minimum withdrawal is 0.001 ETH.");
            return;
        }

        console.log(`🔱 Initiating Transfer of ${ethAmount} ETH to ${userAddress}`);

        // 3. Send the Transaction
        // NOTE: In a production app, this would call your Smart Contract's 'withdraw' function.
        // For a direct transfer from a Treasury wallet:
        const tx = await signer.sendTransaction({
            to: userAddress, 
            value: ethers.parseEther(ethAmount)
        });

        alert("🔱 TRANSACTION BROADCAST: Waiting for block confirmation...");

        // 4. Wait for the blockchain to confirm
        await tx.wait();
        
        alert(`🔱 SUCCESS: ${ethAmount} ETH has arrived in your wallet!`);
        
        // Reset points after successful transfer
        points = 0;
        localStorage.setItem('imperial_points', 0);
        document.getElementById('points-val').innerText = "0.00";

    } catch (err) {
        console.error(err);
        alert("🔱 PROTOCOL REVERTED: Transaction cancelled or insufficient GAS.");
    }
}
