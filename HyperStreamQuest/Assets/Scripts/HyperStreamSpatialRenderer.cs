using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

public sealed class HyperStreamSpatialRenderer : MonoBehaviour
{
    public ARMeshManager meshManager;
    public ARPlaneManager planeManager;
    public bool showMeshes = true;
    public bool showPlanes = true;
    public float meshAlpha = 0.30f;

    readonly Dictionary<TrackableId, GameObject> meshObjects = new();
    Material meshMaterial;
    Material planeMaterial;

    void Awake()
    {
        meshMaterial = MakeMaterial(new Color(0.05f, 0.55f, 1f, meshAlpha));
        planeMaterial = MakeMaterial(new Color(0.1f, 0.9f, 0.7f, 0.10f));
    }

    Material MakeMaterial(Color color)
    {
        var shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
        var m = new Material(shader) { color = color };
        if (m.HasProperty("_Surface")) m.SetFloat("_Surface", 1f);
        if (m.HasProperty("_Blend")) m.SetFloat("_Blend", 0f);
        if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", color);
        if (m.HasProperty("_Metallic")) m.SetFloat("_Metallic", 0f);
        if (m.HasProperty("_Smoothness")) m.SetFloat("_Smoothness", .15f);
        return m;
    }

    void Update()
    {
        if (meshManager != null) UpdateMeshes();
        if (planeManager != null) UpdatePlanes();
    }

    void UpdateMeshes()
    {
        var live = new HashSet<TrackableId>();
        foreach (var filter in meshManager.meshes)
        {
            if (filter == null || filter.sharedMesh == null) continue;
            live.Add(filter.trackableId);
            if (!meshObjects.TryGetValue(filter.trackableId, out var go))
            {
                go = new GameObject("HS_Mesh_" + filter.trackableId);
                go.transform.SetParent(filter.transform, false);
                go.AddComponent<MeshFilter>();
                var mr = go.AddComponent<MeshRenderer>();
                mr.sharedMaterial = meshMaterial;
                meshObjects[filter.trackableId] = go;
            }
            var target = go.GetComponent<MeshFilter>();
            target.sharedMesh = filter.sharedMesh;
            go.SetActive(showMeshes);
        }
        var stale = new List<TrackableId>();
        foreach (var kv in meshObjects) if (!live.Contains(kv.Key)) stale.Add(kv.Key);
        foreach (var id in stale) { Destroy(meshObjects[id]); meshObjects.Remove(id); }
    }

    void UpdatePlanes()
    {
        foreach (var plane in planeManager.trackables)
        {
            var mr = plane.GetComponent<MeshRenderer>();
            if (mr == null)
            {
                var mf = plane.gameObject.GetComponent<MeshFilter>() ?? plane.gameObject.AddComponent<MeshFilter>();
                var mesh = new Mesh { name = "HS_Plane" };
                mesh.vertices = new[]
                {
                    new Vector3(-plane.size.x/2,0,-plane.size.y/2),
                    new Vector3(-plane.size.x/2,0, plane.size.y/2),
                    new Vector3( plane.size.x/2,0, plane.size.y/2),
                    new Vector3( plane.size.x/2,0,-plane.size.y/2)
                };
                mesh.triangles = new[] { 0,1,2, 0,2,3 };
                mesh.RecalculateNormals();
                mf.sharedMesh = mesh;
                mr = plane.gameObject.AddComponent<MeshRenderer>();
                mr.sharedMaterial = planeMaterial;
            }
            mr.enabled = showPlanes;
        }
    }

    void OnDestroy()
    {
        foreach (var go in meshObjects.Values) if (go) Destroy(go);
        if (meshMaterial) Destroy(meshMaterial);
        if (planeMaterial) Destroy(planeMaterial);
    }
}
