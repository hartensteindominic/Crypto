const dbg = document.getElementById('dbg');
const btn = document.getElementById('connectBtn');
const actionBtn = document.getElementById('actionBtn');
const amountInput = document.getElementById('amountIn');

let userAddress = null;

// 1. Handle Connection
btn.addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = accounts[0];
            btn.innerText = `Connected: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`;
            btn.classList.replace('bg-blue-600', 'bg-green-600');
            enableInputs();
        } catch (err) {
            dbg.innerText = "Connection rejected.";
        }
    } else {
        dbg.innerText = "Please install MetaMask!";
    }
});

// 2. Logic to enable the UI
function enableInputs() {
    amountInput.disabled = false;
    actionBtn.disabled = false;
    actionBtn.classList.replace('bg-slate-600', 'bg-blue-600');
    actionBtn.classList.replace('text-slate-400', 'text-white');
    actionBtn.classList.remove('cursor-not-allowed');
    actionBtn.innerText = "Swap & Bridge";
}

// 3. The "Money Maker" Click
actionBtn.addEventListener('click', async () => {
    const amount = amountInput.value;
    if (!amount || amount <= 0) {
        dbg.innerText = "Enter a valid amount";
        return;
    }

    dbg.innerText = "Finding best route + verifying fees...";
    dbg.style.color = "yellow";

    try {
        // Here is where you integrate the Li.Fi SDK 
        // Example: const quote = await lifi.getQuote(...) 
        
        // For now, let's simulate the security check
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }], // Ensure they are on Mainnet
        });

        dbg.innerText = "Transaction pending in wallet...";
        
        // Trigger the actual swap here.
        // This is where your 0.3% fee is collected by the smart contract.
        
    } catch (error) {
        dbg.innerText = error.message;
        dbg.style.color = "red";
    }
});
