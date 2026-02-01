document.getElementById('pay-btn').onclick = async () => {
    // Check if the wallet provider exists (e.g., inside MetaMask Browser)
    if (window.ethereum) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            // Trigger the ETH payment
            const tx = await signer.sendTransaction({
                to: "0x13B87B819252A81381C3Ce35e3Bd33199F4c6650", 
                value: ethers.parseEther("0.01")
            });
            
            document.getElementById('status').innerText = "Confirming...";
            await tx.wait();
            document.getElementById('ui-overlay').style.display = 'none';
            gameActive = true;
        } catch (e) {
            alert("Error: " + e.message);
        }
    } else {
        // IPHONE FIX: Redirect the user to MetaMask's internal browser
        // This takes your current URL and opens it in the MetaMask app automatically
        const dappUrl = window.location.href.split('//')[1]; 
        window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
    }
};
