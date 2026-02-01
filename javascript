document.getElementById('pay-btn').onclick = async () => {
    // Check if we are inside the MetaMask Browser or a desktop browser
    if (typeof window.ethereum !== 'undefined') {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            const tx = await signer.sendTransaction({
                to: HOUSE_WALLET,
                value: ethers.parseEther(ENTRY_FEE)
            });

            document.getElementById('status').innerText = "Confirming...";
            await tx.wait();

            document.getElementById('ui-overlay').style.display = 'none';
            gameActive = true;
        } catch (e) {
            alert("Payment Error: " + e.message);
        }
    } else {
        // IPHONE FIX: If no wallet found, redirect to MetaMask's internal browser
        const dappUrl = window.location.href.split('//')[1]; // Get your site URL without https://
        const metamaskAppDeepLink = `https://metamask.app.link/dapp/${dappUrl}`;
        
        status.innerText = "Opening in MetaMask...";
        window.location.href = metamaskAppDeepLink;
    }
};
