import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// Replace with your Project ID from cloud.walletconnect.com
const projectId = 'YOUR_PROJECT_ID'

export const config = createConfig({
  chains: [base],
  connectors: [
    injected(), // Supports MetaMask directly
    walletConnect({ projectId }),
  ],
  transports: {
    [base.id]: http(), // Uses the default Base RPC
  },
})
