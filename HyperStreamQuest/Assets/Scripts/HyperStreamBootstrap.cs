using System.Collections;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.Management;
using UnityEngine.XR.ARSubsystems;
using Unity.XR.CoreUtils;

public sealed class HyperStreamBootstrap : MonoBehaviour
{
    public HyperStreamQuestWorldMapper mapper;
    public HyperStreamRelayClient relay;
    public HyperStreamSpatialRenderer spatialRenderer;
    public ARSession arSession;
    public XROrigin xrOrigin;
    public ARPlaneManager planeManager;
    public ARMeshManager meshManager;
    bool xrReady;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
    static void AutoCreate()
    {
        if (FindFirstObjectByType<HyperStreamBootstrap>() != null) return;
        var go = new GameObject("HyperStream Runtime");
        DontDestroyOnLoad(go);
        go.AddComponent<HyperStreamBootstrap>();
    }

    IEnumerator Start()
    {
        Application.targetFrameRate = 72;
        EnsureXRScene();
        yield return InitializeXR();
        if (relay == null) relay = gameObject.AddComponent<HyperStreamRelayClient>();
        if (mapper == null) mapper = gameObject.AddComponent<HyperStreamQuestWorldMapper>();
        mapper.planeManager = planeManager;
        mapper.meshManager = meshManager;
        mapper.xrCamera = xrOrigin != null ? xrOrigin.Camera : Camera.main;
        if (spatialRenderer == null) spatialRenderer = gameObject.AddComponent<HyperStreamSpatialRenderer>();
        spatialRenderer.planeManager = planeManager;
        spatialRenderer.meshManager = meshManager;

        if (!xrReady)
        {
            Debug.LogError("HyperStream: XR loader did not start. Configure Android OpenXR + Meta Quest features and rebuild.");
            return;
        }

        yield return WaitForSessionTracking();
        planeManager.enabled = true;
        meshManager.enabled = true;
        mapper.StartMapping();
        Debug.Log("HyperStream: Quest mapping started. Walk around the room.");
    }

    IEnumerator InitializeXR()
    {
        var settings = XRGeneralSettings.Instance;
        if (settings == null || settings.Manager == null)
        {
            Debug.LogError("HyperStream: XRGeneralSettings/Manager missing.");
            yield break;
        }

        var manager = settings.Manager;
        if (manager.activeLoader == null)
            yield return manager.InitializeLoader();

        if (manager.activeLoader != null)
        {
            manager.StartSubsystems();
            xrReady = true;
            Debug.Log("HyperStream: OpenXR loader started.");
        }
    }

    IEnumerator WaitForSessionTracking()
    {
        if (arSession == null) yield break;
        arSession.enabled = true;
        float deadline = Time.realtimeSinceStartup + 12f;
        while (Time.realtimeSinceStartup < deadline && ARSession.state != ARSessionState.SessionTracking)
            yield return null;
    }

    void EnsureXRScene()
    {
        arSession = FindFirstObjectByType<ARSession>();
        if (arSession == null) arSession = new GameObject("AR Session").AddComponent<ARSession>();

        xrOrigin = FindFirstObjectByType<XROrigin>();
        if (xrOrigin == null)
        {
            var root = new GameObject("XR Origin");
            xrOrigin = root.AddComponent<XROrigin>();
            var offset = new GameObject("Camera Offset");
            offset.transform.SetParent(root.transform, false);
            var cameraGO = new GameObject("Main Camera");
            cameraGO.tag = "MainCamera";
            cameraGO.transform.SetParent(offset.transform, false);
            var camera = cameraGO.AddComponent<Camera>();
            camera.nearClipPlane = .05f;
            camera.farClipPlane = 50f;
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0f, 0f, 0f, 0f);
            cameraGO.AddComponent<ARCameraManager>();
            cameraGO.AddComponent<ARCameraBackground>();
            cameraGO.AddComponent<HyperStreamQuestHeadPose>();
            xrOrigin.Camera = camera;
            xrOrigin.CameraFloorOffsetObject = offset;
        }

        var mainCamera = xrOrigin.Camera;
        if (mainCamera != null)
        {
            mainCamera.clearFlags = CameraClearFlags.SolidColor;
            mainCamera.backgroundColor = new Color(0f, 0f, 0f, 0f);
            if (mainCamera.GetComponent<ARCameraManager>() == null) mainCamera.gameObject.AddComponent<ARCameraManager>();
            if (mainCamera.GetComponent<ARCameraBackground>() == null) mainCamera.gameObject.AddComponent<ARCameraBackground>();
            if (mainCamera.GetComponent<HyperStreamQuestHeadPose>() == null) mainCamera.gameObject.AddComponent<HyperStreamQuestHeadPose>();
        }

        planeManager = xrOrigin.GetComponent<ARPlaneManager>();
        if (planeManager == null) planeManager = xrOrigin.gameObject.AddComponent<ARPlaneManager>();
        planeManager.requestedDetectionMode = PlaneDetectionMode.Horizontal | PlaneDetectionMode.Vertical;
        planeManager.enabled = false;

        meshManager = xrOrigin.GetComponent<ARMeshManager>();
        if (meshManager == null) meshManager = xrOrigin.gameObject.AddComponent<ARMeshManager>();
        meshManager.enabled = false;
    }

    public void StartMapping()
    {
        if (!xrReady) return;
        planeManager.enabled = true;
        meshManager.enabled = true;
        mapper?.StartMapping();
    }

    public void StopMapping()
    {
        planeManager.enabled = false;
        meshManager.enabled = false;
        mapper?.StopMapping();
    }
}
