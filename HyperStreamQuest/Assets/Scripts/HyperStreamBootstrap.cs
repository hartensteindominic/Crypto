using UnityEngine;
using UnityEngine.XR.ARFoundation;
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

    void Awake()
    {
        Application.targetFrameRate = 72;
        EnsureXRScene();
        if (relay == null) relay = gameObject.AddComponent<HyperStreamRelayClient>();
        if (mapper == null) mapper = gameObject.AddComponent<HyperStreamQuestWorldMapper>();
        mapper.planeManager = planeManager;
        mapper.meshManager = meshManager;
        mapper.xrCamera = Camera.main;
        if (spatialRenderer == null) spatialRenderer = gameObject.AddComponent<HyperStreamSpatialRenderer>();
        spatialRenderer.planeManager = planeManager;
        spatialRenderer.meshManager = meshManager;
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
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0f,0f,0f,0f);
            camera.nearClipPlane = .05f;
            camera.farClipPlane = 50f;
            cameraGO.AddComponent<ARCameraManager>();
            cameraGO.AddComponent<HyperStreamQuestHeadPose>();
            xrOrigin.Camera = camera;
            xrOrigin.CameraFloorOffsetObject = offset;
        }

        var mainCamera = xrOrigin.Camera;
        if (mainCamera != null)
        {
            mainCamera.clearFlags = CameraClearFlags.SolidColor;
            mainCamera.backgroundColor = new Color(0f,0f,0f,0f);
            if (mainCamera.GetComponent<ARCameraManager>() == null) mainCamera.gameObject.AddComponent<ARCameraManager>();
            if (mainCamera.GetComponent<HyperStreamQuestHeadPose>() == null) mainCamera.gameObject.AddComponent<HyperStreamQuestHeadPose>();
        }

        planeManager = xrOrigin.GetComponent<ARPlaneManager>();
        if (planeManager == null) planeManager = xrOrigin.gameObject.AddComponent<ARPlaneManager>();
        planeManager.requestedDetectionMode = UnityEngine.XR.ARSubsystems.PlaneDetectionMode.Horizontal | UnityEngine.XR.ARSubsystems.PlaneDetectionMode.Vertical;
        planeManager.enabled = false;

        meshManager = xrOrigin.GetComponent<ARMeshManager>();
        if (meshManager == null) meshManager = xrOrigin.gameObject.AddComponent<ARMeshManager>();
        meshManager.enabled = false;
    }

    public void StartMapping()
    {
        if (arSession != null) arSession.enabled = true;
        mapper?.StartMapping();
    }

    public void StopMapping() => mapper?.StopMapping();
}
