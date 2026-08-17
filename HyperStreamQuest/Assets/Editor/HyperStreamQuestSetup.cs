#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using Unity.XR.CoreUtils;

public static class HyperStreamQuestSetup
{
    [MenuItem("HyperStream/Create Quest World Scene")]
    public static void CreateScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

        var session = new GameObject("AR Session");
        session.AddComponent<ARSession>();

        var origin = new GameObject("XR Origin");
        var xr = origin.AddComponent<XROrigin>();
        var offset = new GameObject("Camera Offset");
        offset.transform.SetParent(origin.transform, false);

        var cameraGo = new GameObject("Main Camera");
        cameraGo.tag = "MainCamera";
        cameraGo.transform.SetParent(offset.transform, false);
        var camera = cameraGo.AddComponent<Camera>();
        camera.nearClipPlane = .05f;
        camera.farClipPlane = 50f;
        camera.clearFlags = CameraClearFlags.SolidColor;
        camera.backgroundColor = new Color(0, 0, 0, 0);
        cameraGo.AddComponent<ARCameraManager>();
        cameraGo.AddComponent<ARCameraBackground>();
        xr.Camera = camera;
        xr.CameraFloorOffsetObject = offset;

        origin.AddComponent<ARPlaneManager>();
        origin.AddComponent<ARMeshManager>();

        var hs = new GameObject("HyperStream");
        hs.AddComponent<HyperStreamBootstrap>();
        Selection.activeGameObject = hs;

        System.IO.Directory.CreateDirectory("Assets/Scenes");
        EditorSceneManager.SaveScene(scene, "Assets/Scenes/HyperStreamQuest.unity");
        EditorUtility.DisplayDialog(
            "HyperStream Quest",
            "Scene created.\n\nBefore building: Android → XR Plug-in Management → OpenXR → enable the Meta Quest features for Scene/Meshing/Camera. Complete Quest Space Setup.\n\nThen build the Android APK and install it on Quest.",
            "OK");
    }
}
#endif
