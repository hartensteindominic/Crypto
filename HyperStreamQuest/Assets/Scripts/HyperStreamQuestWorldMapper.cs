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
    [Serializable] public class WorldPacket { public int version=2; public long time; public string device="Quest"; public List<Point> points=new List<Point>(); public int planes; public int meshes; }
    public ARPlaneManager planeManager; public ARMeshManager meshManager; public Camera xrCamera; public float sendInterval=.20f; public bool mapping;
    float nextSend;
    void Start(){
        if(xrCamera==null)xrCamera=Camera.main;
        if(planeManager==null)planeManager=FindFirstObjectByType<ARPlaneManager>();
        if(meshManager==null)meshManager=FindFirstObjectByType<ARMeshManager>();
#if UNITY_ANDROID && !UNITY_EDITOR
        if(!Permission.HasUserAuthorizedPermission("com.oculus.permission.USE_SCENE"))Permission.RequestUserPermission("com.oculus.permission.USE_SCENE");
#endif
    }
    void Update(){if(mapping&&Time.unscaledTime>=nextSend){nextSend=Time.unscaledTime+sendInterval;BuildPacket();}}
    public void StartMapping(){mapping=true;if(planeManager!=null)planeManager.enabled=true;if(meshManager!=null)meshManager.enabled=true;}
    public void StopMapping(){mapping=false;}
    void BuildPacket(){
        var p=new WorldPacket{time=DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()};
        if(xrCamera!=null){var q=xrCamera.transform.position;p.points.Add(new Point{x=q.x,y=q.y,z=q.z,confidence=1,kind="camera"});}
        if(planeManager!=null)foreach(var plane in planeManager.trackables){var q=plane.transform.position;p.points.Add(new Point{x=q.x,y=q.y,z=q.z,confidence=.9f,kind="plane"});if(p.points.Count>800)break;}
        if(meshManager!=null)foreach(var mf in meshManager.meshes){if(mf==null||mf.sharedMesh==null)continue;var verts=mf.sharedMesh.vertices;int stride=Mathf.Max(1,verts.Length/120);for(int i=0;i<verts.Length;i+=stride){var q=mf.transform.TransformPoint(verts[i]);p.points.Add(new Point{x=q.x,y=q.y,z=q.z,confidence=.98f,kind="mesh"});if(p.points.Count>=3000)break;}if(p.points.Count>=3000)break;}
        p.planes=planeManager==null?0:planeManager.trackables.count;p.meshes=meshManager==null?0:meshManager.meshes.Count;
        HyperStreamRelayClient.Instance?.Send(JsonUtility.ToJson(p));
    }
}
