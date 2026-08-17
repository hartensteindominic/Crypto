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
    public float meshAlpha = 0.22f;

    readonly Dictionary<TrackableId, GameObject> meshObjects = new();
    Material meshMaterial;
    Material planeMaterial;

    void Awake()
    {
        meshMaterial = MakeMaterial(new Color(0.05f, 0.55f, 1f, meshAlpha));
        planeMaterial = MakeMaterial(new Color(0.1f, 0.8f, 0.65f, 0.08f));
    }

    Material MakeMaterial(Color color)
    {
        var shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
        var m = new Material(shader) { color = color };
        if (m.HasProperty("_Surface")) m.SetFloat("_Surface", 1f);
        if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", color);
        if (m.HasProperty("_Metallic")) m.SetFloat("_Metallic", 0f);
        if (m.HasProperty("_Smoothness")) m.SetFloat("_Smoothness", .08f);
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
            var trackable = filter.GetComponent<ARMesh>() ?? filter.GetComponentInParent<ARMesh>();
            if (trackable == null) continue;
            var id = trackable.trackableId;
            live.Add(id);

            if (!meshObjects.TryGetValue(id, out var go))
            {
                go = new GameObject("HS_Mesh_" + id);
                go.transform.SetParent(filter.transform, false);
                var mf = go.AddComponent<MeshFilter>();
                mf.sharedMesh = filter.sharedMesh;
                var mr = go.AddComponent<MeshRenderer>();
                mr.sharedMaterial = meshMaterial;
                meshObjects[id] = go;
            }

            var target = go.GetComponent<MeshFilter>();
            target.sharedMesh = filter.sharedMesh;
            go.transform.localPosition = Vector3.zero;
            go.transform.localRotation = Quaternion.identity;
            go.transform.localScale = Vector3.one;
            go.SetActive(showMeshes);
        }

        var stale = new List<TrackableId>();
        foreach (var kv in meshObjects)
            if (!live.Contains(kv.Key)) stale.Add(kv.Key);
        foreach (var id in stale)
        {
            if (meshObjects[id]) Destroy(meshObjects[id]);
            meshObjects.Remove(id);
        }
    }

    void UpdatePlanes()
    {
        foreach (var plane in planeManager.trackables)
        {
            var mf = plane.GetComponent<MeshFilter>();
            var mr = plane.GetComponent<MeshRenderer>();
            if (mf == null) mf = plane.gameObject.AddComponent<MeshFilter>();
            if (mr == null) mr = plane.gameObject.AddComponent<MeshRenderer>();

            var mesh = mf.sharedMesh;
            if (mesh == null || mesh.vertexCount != 4)
            {
                mesh = new Mesh { name = "HS_Plane" };
                mesh.vertices = new[]
                {
                    new Vector3(-.5f, 0, -.5f), new Vector3(-.5f, 0, .5f),
                    new Vector3(.5f, 0, .5f), new Vector3(.5f, 0, -.5f)
                };
                mesh.triangles = new[] { 0, 1, 2, 0, 2, 3 };
                mesh.uv = new[] { Vector2.zero, Vector2.up, Vector2.one, Vector2.right };
                mesh.RecalculateNormals();
                mf.sharedMesh = mesh;
            }

            plane.transform.localScale = new Vector3(plane.size.x, 1f, plane.size.y);
            mr.sharedMaterial = planeMaterial;
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
