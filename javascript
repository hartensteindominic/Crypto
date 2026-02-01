const payBtn = document.getElementById('pay-btn');

payBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Stop any default Safari behavior

    // 1. Check if we are ALREADY inside a Web3 browser (like MetaMask Mobile)
    if (window.ethereum) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            // Trigger the transaction
            const tx = await signer.sendTransaction({
                to: "0x13B87B819252A81381C3Ce35e3Bd33199F4c6650",
                value: ethers.parseEther("0.01")
            });
            
            await tx.wait();
            gameActive = true;
            document.getElementById('ui-overlay').style.display = 'none';
        } catch (err) {
            alert("Payment failed: " + err.message);
        }
    } else {
        // 2. We are in Safari. We MUST jump to the MetaMask App.
        // This is the "Deep Link" magic.
        const currentUrl = window.location.href.split('//')[1];
        const metamaskAppUrl = `https://metamask.app.link/dapp/${currentUrl}`;
        
        // This forces the iPhone to show the "Open in MetaMask?" popup
        window.location.href = metamaskAppUrl;
    }
});
