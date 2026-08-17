using System;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

namespace HyperStreamQuest {
    public sealed class HyperStreamSpatialBridge : MonoBehaviour {
        [SerializeField] ARMeshManager meshManager;
        [SerializeField] ARPlaneManager planeManager;
        public string RelayUrl = "ws://192.168.1.100:8787";
        public float SendInterval = 0.10f;
        float nextSend;
        int meshCount, planeCount;
        readonly List<Vector3> points = new();

        void Awake() {
            meshManager ??= FindFirstObjectByType<ARMeshManager>();
            planeManager ??= FindFirstObjectByType<ARPlaneManager>();
        }

        void Update() {
            meshCount = meshManager ? meshManager.meshes.count : 0;
            planeCount = planeManager ? planeManager.trackables.count : 0;
            if (Time.unscaledTime < nextSend) return;
            nextSend = Time.unscaledTime + SendInterval;
            SendSpatialFrame();
        }

        void SendSpatialFrame() {
            points.Clear();
            if (meshManager) {
                foreach (var f in meshManager.meshes) {
                    if (!f || !f.TryGetComponent<MeshFilter>(out var mf) || !mf.sharedMesh) continue;
                    var v = mf.sharedMesh.vertices;
                    var step = Mathf.Max(1, v.Length / 80);
                    for (int i = 0; i < v.Length; i += step)
                        points.Add(f.transform.TransformPoint(v[i]));
                }
            }
            var pose = transform.position;
            var sb = new StringBuilder(256 + points.Count * 42);
            sb.Append("{\"type\":\"spatial-frame\",\"time\":").Append(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());
            sb.Append(",\"pose\":{\"x\":").Append(pose.x.ToString("R"));
            sb.Append(",\"y\":").Append(pose.y.ToString("R"));
            sb.Append(",\"z\":").Append(pose.z.ToString("R")).Append("},\"meshes\":").Append(meshCount).Append(",\"planes\":").Append(planeCount).Append(",\"points\":[");
            for (int i = 0; i < points.Count; i++) {
                if (i > 0) sb.Append(',');
                var p = points[i];
                sb.Append("{\"x\":").Append(p.x.ToString("R"));
                sb.Append(",\"y\":").Append(p.y.ToString("R"));
                sb.Append(",\"z\":").Append(p.z.ToString("R"));
                sb.Append(",\"confidence\":0.9,\"kind\":\"mesh\"}");
            }
            sb.Append("]}");
            // Transport hook: pass sb.ToString() to the project's WebSocket/WebRTC relay client.
            SpatialFrameReady?.Invoke(sb.ToString());
        }

        public event Action<string> SpatialFrameReady;
    }
}
