using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;

public sealed class HyperStreamRelayClient : MonoBehaviour
{
    public static HyperStreamRelayClient Instance{get;private set;}
    public string relayUrl="ws://192.168.1.100:8787";
    public bool autoConnect=true;
    ClientWebSocket socket; CancellationTokenSource cts;
    void Awake(){if(Instance!=null){Destroy(gameObject);return;}Instance=this;DontDestroyOnLoad(gameObject);}
    async void Start(){if(autoConnect)await Connect();}
    public async Task Connect(){
        try{cts?.Cancel();cts=new CancellationTokenSource();socket=new ClientWebSocket();await socket.ConnectAsync(new Uri(relayUrl),cts.Token);_=ReceiveLoop();Debug.Log("HyperStream relay connected: "+relayUrl);}
        catch(Exception e){Debug.LogWarning("HyperStream relay connection failed: "+e.Message);}
    }
    public async void Send(string json){
        if(socket==null||socket.State!=WebSocketState.Open)return;
        try{var b=Encoding.UTF8.GetBytes(json);await socket.SendAsync(new ArraySegment<byte>(b),WebSocketMessageType.Text,true,cts.Token);}catch(Exception e){Debug.LogWarning("Relay send: "+e.Message);}
    }
    async Task ReceiveLoop(){var b=new byte[8192];try{while(socket.State==WebSocketState.Open){var r=await socket.ReceiveAsync(new ArraySegment<byte>(b),cts.Token);if(r.MessageType==WebSocketMessageType.Close)break;}}catch(Exception e){Debug.Log("Relay receive ended: "+e.Message);}}
    void OnDestroy(){try{cts?.Cancel();socket?.Dispose();}catch{}}
}
