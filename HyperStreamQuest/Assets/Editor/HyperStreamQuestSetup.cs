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
        var scene=EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
        var session=new GameObject("AR Session"); session.AddComponent<ARSession>();
        var origin=GameObject.Find("XR Origin")??new GameObject("XR Origin");
        var xr=origin.GetComponent<XROrigin>()??origin.AddComponent<XROrigin>();
        var cameraGo=new GameObject("Main Camera"); cameraGo.tag="MainCamera"; cameraGo.transform.SetParent(origin.transform,false); cameraGo.AddComponent<Camera>();
        xr.Camera=cameraGo.GetComponent<Camera>();
        origin.AddComponent<ARPlaneManager>();
        origin.AddComponent<ARMeshManager>();
        origin.AddComponent<ARCameraManager>();
        var hs=new GameObject("HyperStream"); hs.AddComponent<HyperStreamBootstrap>();
        Selection.activeGameObject=hs;
        EditorSceneManager.SaveScene(scene,"Assets/Scenes/HyperStreamQuest.unity");
        EditorUtility.DisplayDialog("HyperStream","Scene created. Enable OpenXR + Meta Quest features, complete Space Setup on the headset, then build Android.","OK");
    }
}
#endif
