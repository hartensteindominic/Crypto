// CONFIGURATION
const HOUSE_WALLET = "0x13B87B819252A81381C3Ce35e3Bd33199F4c6650";
const ENTRY_FEE = "0.01"; // ETH
let gameActive = false;

// UI ELEMENTS
const payBtn = document.getElementById('pay-btn');
const statusText = document.getElementById('status');

// THE TROUBLESHOOTER FUNCTION
async function handleConnection() {
    console.log("Button Clicked");

    // 1. ARE WE ON MOBILE?
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // 2. CHECK IF WE ARE IN THE METAMASK BROWSER ALREADY
    if (window.ethereum) {
        try {
            statusText.innerText = "Wallet Detected. Connecting...";
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            // Payment logic
            const tx = await signer.sendTransaction({
                to: HOUSE_WALLET,
                value: ethers.parseEther(ENTRY_FEE)
            });

            statusText.innerText = "Confirming on ETH Network...";
            await tx.wait(); // Pauses until paid
            
            // SUCCESS: Unlock Game
            document.getElementById('ui-overlay').style.display = 'none';
            gameActive = true; 
            if(window.init3D) window.init3D(); // Start 3D engine

        } catch (err) {
            console.error(err);
            statusText.innerText = "User Rejected or Error.";
        }
    } 
    // 3. IF NO WALLET (TYPICAL ON IPHONE SAFARI)
    else if (isMobile) {
        statusText.innerText = "Redirecting to MetaMask...";
        
        // This is the Deep Link magic
        // It takes your current URL and opens it INSIDE the MetaMask App
        const currentUrl = window.location.href.split('//')[1];
        const metamaskAppUrl = `https://metamask.app.link/dapp/${currentUrl}`;
        
        window.location.href = metamaskAppUrl;
    } else {
        statusText.innerText = "Please install MetaMask extension.";
    }
}

// Ensure the button is clickable even if layers overlap
payBtn.addEventListener('click', handleConnection);
payBtn.style.pointerEvents = "auto"; 
