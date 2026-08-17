using System;
using UnityEngine;
using UnityEngine.XR;
using UnityEngine.XR.ARFoundation;

public sealed class HyperStreamRebuildDiagnostics : MonoBehaviour
{
    public ARSession session;
    public ARPlaneManager planes;
    public ARMeshManager meshes;
    public Camera xrCamera;
    public bool showOverlay = true;
    string status = "Starting Quest spatial system…";
    float next;

    void Start()
    {
        if (!session) session = FindFirstObjectByType<ARSession>();
        if (!planes) planes = FindFirstObjectByType<ARPlaneManager>();
        if (!meshes) meshes = FindFirstObjectByType<ARMeshManager>();
        if (!xrCamera) xrCamera = Camera.main;
        status = "Waiting for XR tracking and Quest Scene data…";
    }

    void Update()
    {
        if (Time.unscaledTime < next) return;
        next = Time.unscaledTime + .5f;
        var loader = UnityEngine.XR.Management.XRGeneralSettings.Instance?.Manager?.activeLoader;
        int pc = planes ? planes.trackables.count : 0;
        int mc = meshes ? meshes.meshes.Count : 0;
        var state = session ? session.subsystem?.GetType().Name : "No ARSession";
        status = loader == null
            ? "XR loader NOT ACTIVE. Check Android OpenXR/Meta configuration."
            : pc + " planes · " + mc + " meshes · XR " + state;
    }

    void OnGUI()
    {
        if (!showOverlay) return;
        GUI.color = Color.white;
        GUI.Box(new Rect(18,18,Mathf.Min(Screen.width-36,720),96), "HyperStream Quest\n" + status + "\n" + (xrCamera ? "Camera active" : "XR camera missing"));
    }
}
