import { ethers } from 'ethers';

const payBtn = document.getElementById('pay-btn');
const status = document.getElementById('status');

// Use 'touchstart' for iPhone to guarantee the event fires
const triggerEvent = 'ontouchstart' in window ? 'touchstart' : 'click';

payBtn.addEventListener(triggerEvent, async (e) => {
    e.preventDefault(); // Prevents double-firing on some browsers
    console.log("Touch/Click detected on iPhone");

    // 1. Check if we are inside MetaMask Browser
    if (window.ethereum) {
        try {
            status.innerText = "Connecting...";
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            status.innerText = "Paying 0.01 ETH...";
            const tx = await signer.sendTransaction({
                to: "0x13B87B819252A81381C3Ce35e3Bd33199F4c6650",
                value: ethers.parseEther("0.01")
            });

            status.innerText = "Confirming...";
            await tx.wait();
            
            document.getElementById('ui-overlay').style.display = 'none';
            window.gameActive = true; 
        } catch (err) {
            status.innerText = "Error: " + err.message.slice(0, 20);
        }
    } 
    // 2. We are in Safari: Force deep link
    else {
        status.innerText = "Opening MetaMask...";
        const rawUrl = window.location.href.replace(/^https?:\/\//, '');
        // The 'dapp://' protocol is often faster than the https link on iOS
        window.location.href = `dapp://${rawUrl}`;
        
        // Fallback if dapp:// fails after 2 seconds
        setTimeout(() => {
            window.location.href = `https://metamask.app.link/dapp/${rawUrl}`;
        }, 2000);
    }
}, { passive: false });
