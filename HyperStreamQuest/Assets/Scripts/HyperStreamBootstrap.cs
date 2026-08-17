using UnityEngine;

public sealed class HyperStreamBootstrap:MonoBehaviour
{
    public HyperStreamQuestWorldMapper mapper;
    public HyperStreamRelayClient relay;
    void Awake(){
        if(relay==null)relay=gameObject.AddComponent<HyperStreamRelayClient>();
        if(mapper==null)mapper=gameObject.AddComponent<HyperStreamQuestWorldMapper>();
    }
    public void StartMapping(){mapper?.StartMapping();}
    public void StopMapping(){mapper?.StopMapping();}
}
