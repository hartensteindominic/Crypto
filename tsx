import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Art Liquidity Pool</h1>
      
      {/* This will handle the 0x02f93... connection */}
      <ConnectButton />

      <div className="grid grid-cols-2 gap-4 mt-12">
        <button className="bg-blue-600 p-4 rounded-lg">Deposit Artwork (Pay Fee)</button>
        <button className="bg-green-600 p-4 rounded-lg">Borrow from Pool</button>
      </div>
    </main>
  );
}
