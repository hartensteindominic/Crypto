using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
#if UNITY_ANDROID && !UNITY_EDITOR
using UnityEngine.Android;
#endif

public sealed class HyperStreamQuestWorldMapper : MonoBehaviour
{
    [Serializable] public class Point { public float x,y,z,confidence; public string kind; }
    [Serializable] public class WorldPacket { public int version=1; public long time; public string device="Quest"; public List<Point> points=new List<Point>(); public int planes; public int meshes; }

    public ARPlaneManager planeManager;
    public ARMeshManager meshManager;
    public Camera xrCamera;
    public float sendInterval=.15f;
    public bool mapping;
    float nextSend;

    void Start(){
        if(xrCamera==null) xrCamera=Camera.main;
        if(planeManager==null) planeManager=FindFirstObjectByType<ARPlaneManager>();
        if(meshManager==null) meshManager=FindFirstObjectByType<ARMeshManager>();
#if UNITY_ANDROID && !UNITY_EDITOR
        if(!Permission.HasUserAuthorizedPermission("com.oculus.permission.USE_SCENE")) Permission.RequestUserPermission("com.oculus.permission.USE_SCENE");
#endif
    }

    void Update(){ if(mapping && Time.unscaledTime>=nextSend){ nextSend=Time.unscaledTime+sendInterval; BuildPacket(); } }
    public void StartMapping(){ mapping=true; if(planeManager!=null) planeManager.enabled=true; if(meshManager!=null) meshManager.enabled=true; }
    public void StopMapping(){ mapping=false; }

    void BuildPacket(){
        var packet=new WorldPacket{time=DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()};
        if(xrCamera!=null){var p=xrCamera.transform.position;packet.points.Add(new Point{x=p.x,y=p.y,z=p.z,confidence=1,kind="camera"});}
        if(planeManager!=null) foreach(var plane in planeManager.trackables){var p=plane.transform.position;packet.points.Add(new Point{x=p.x,y=p.y,z=p.z,confidence=.9f,kind="plane"});if(packet.points.Count>=1900)break;}
        if(meshManager!=null) foreach(var mf in meshManager.meshes){if(mf==null)continue;var p=mf.transform.position;packet.points.Add(new Point{x=p.x,y=p.y,z=p.z,confidence=.98f,kind="mesh"});if(packet.points.Count>=2000)break;}
        packet.planes=planeManager==null?0:planeManager.trackables.count;
        packet.meshes=meshManager==null?0:meshManager.meshes.Count;
        HyperStreamRelayClient.Instance?.Send(JsonUtility.ToJson(packet));
    }
}
