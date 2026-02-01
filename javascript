// This is the configuration for the swap engine
const swapParameters = {
  sellToken: 'ETH',         // What the user is selling
  buyToken: 'USDC',         // What the user is buying
  sellAmount: '1000000000000000000', // 1 ETH
  
  // YOUR PAYOUT STRATEGY:
  feeRecipient: '0x13B87B819252A81381C3Ce35e3Bd33199F4c6650', // Your wallet
  buyTokenPercentageFee: 0.01, // This takes 1% of every trade for you
};
