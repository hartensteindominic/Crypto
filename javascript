const payBtn = document.getElementById('pay-btn');
const gameContainer = document.getElementById('game-container');

// IPHONE HACK: Use 'touchstart' instead of 'click'
payBtn.addEventListener('touchstart', async (e) => {
    e.preventDefault(); // Prevents the 'ghost click'
    console.log("iPhone Touch Detected");

    if (window.ethereum) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            // Payment logic...
            const tx = await signer.sendTransaction({
                to: "0x13B87B819252A81381C3Ce35e3Bd33199F4c6650",
                value: ethers.parseEther("0.01")
            });
            await tx.wait();

            // UNLOCK GAME
            document.getElementById('ui-overlay').style.display = 'none';
            gameContainer.style.pointerEvents = "auto"; // Re-enable game controls
            window.gameActive = true;
        } catch (err) {
            alert("Error: " + err.message);
        }
    } else {
        // Redirect to MetaMask App
        const url = window.location.href.replace(/^https?:\/\//, '');
        window.location.href = `https://metamask.app.link/dapp/${url}`;
    }
}, { passive: false });
