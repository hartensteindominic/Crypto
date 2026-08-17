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
            var cameraGO = new GameObject("Main Camera");
            cameraGO.tag = "MainCamera";
            cameraGO.transform.SetParent(root.transform, false);
            cameraGO.transform.localPosition = Vector3.zero;
            cameraGO.AddComponent<Camera>();
            cameraGO.AddComponent<ARCameraManager>();
            cameraGO.AddComponent<ARCameraBackground>();
            xrOrigin.Camera = cameraGO.GetComponent<Camera>();
            xrOrigin.CameraFloorOffsetObject = cameraGO;
        }

        planeManager = xrOrigin.GetComponent<ARPlaneManager>();
        if (planeManager == null) planeManager = xrOrigin.gameObject.AddComponent<ARPlaneManager>();
        planeManager.requestedDetectionMode = UnityEngine.XR.ARSubsystems.PlaneDetectionMode.Horizontal | UnityEngine.XR.ARSubsystems.PlaneDetectionMode.Vertical;
        planeManager.enabled = true;

        meshManager = xrOrigin.GetComponent<ARMeshManager>();
        if (meshManager == null) meshManager = xrOrigin.gameObject.AddComponent<ARMeshManager>();
        meshManager.density = UnityEngine.XR.ARSubsystems.MeshVertexAttributes.None;
        meshManager.enabled = true;
    }

    public void StartMapping()
    {
        if (arSession != null) arSession.enabled = true;
        mapper?.StartMapping();
    }

    public void StopMapping() => mapper?.StopMapping();
}
