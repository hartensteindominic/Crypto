const http=require('http');
const {WebSocketServer}=require('ws');
const PORT=8787;
const peers=new Set();
const server=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify({ok:true,service:'HyperStream Relay',clients:peers.size}));});
const wss=new WebSocketServer({server});
wss.on('connection',ws=>{peers.add(ws);ws.send(JSON.stringify({type:'hello',service:'HyperStream Relay',version:1}));ws.on('message',m=>{for(const p of peers)if(p!==ws&&p.readyState===1)p.send(m.toString())});ws.on('close',()=>peers.delete(ws));});
server.listen(PORT,'0.0.0.0',()=>console.log(`HyperStream Relay listening on :${PORT}`));
