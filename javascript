// Install: npm install @lifi/sdk
import { Lifi } from '@lifi/sdk';

const lifi = new Lifi({ integrator: 'Your_App_Name' });

async function startHighRevenueBridge(amount, fromChain, toChain, userAddress) {
    // This finds the best route and includes YOUR fee
    const quoteRequest = {
        fromChain: fromChain, // e.g., 1 (Mainnet)
        toChain: toChain,     // e.g., 137 (Polygon)
        fromToken: '0x...',   // USDT
        toToken: '0x...',     // USDC
        fromAmount: amount,   // User's amount
        fromAddress: userAddress,
        fee: 0.003            // <--- THIS IS YOUR 0.3% REVENUE
    };

    const route = await lifi.getQuote(quoteRequest);
    // Now you just execute the route with the user's signature
    await lifi.executeRoute(window.ethereum, route);
}
