# HyperStream native Quest world engine

This is the native Quest/OpenXR side of HyperStream. It is intentionally separate from the HTML dashboard so the headset can use real XR tracking and the Meta Scene/AR Foundation provider instead of trying to infer a room from browser pixels.

## What it does

- Quest-first spatial mapping through Unity OpenXR + Meta OpenXR.
- AR Foundation plane and mesh managers.
- Samples actual mesh vertices and sends them as XYZ world coordinates.
- Uses the Quest headset camera pose as a world reference.
- Sends live spatial packets to the HyperStream relay over WebSocket.
- The phone dashboard can send JPEG camera frames back through the same relay as enrichment data.
- The HTML dashboard can save/load the received world and replay its spatial records.
- World state is represented as `X Y Z T S`: position, time/history, and spatial confidence/state.

## Current package baseline

The project targets Unity 6 and uses released Unity OpenXR/Meta OpenXR packages. Unity's current Meta OpenXR package provides the AR Foundation provider for Quest planes, meshes, bounding boxes, anchors and passthrough. Meta Scene data requires the headset's Space Setup/Room Setup to be completed first. citeturn0search1turn0search4turn2search5

## Setup

1. Install Unity 6.
2. Open `HyperStreamQuest/` as a Unity project.
3. Let Package Manager resolve `Packages/manifest.json`.
4. In Project Settings > XR Plug-in Management > Android, enable OpenXR.
5. In OpenXR feature groups, enable the Meta Quest feature group and the Meta Quest Scene/Meshing/Plane features. The Meta OpenXR documentation requires `USE_SCENE` permission for planes, bounding boxes and meshes. citeturn0search1
6. In the headset, complete **Space Setup** before testing. Quest plane/scene data comes from the stored Scene Model. citeturn0search0turn0search4
7. In Unity use **HyperStream > Create Quest World Scene**.
8. Set the relay address in `HyperStreamQuestWorldMapper` / `HyperStreamRelayClient` to the computer running the relay, for example `ws://192.168.1.100:8787`.
9. Build the Android APK and install it on the Quest.

## Start the phone bridge

From `hyperstream-relay/`:

```bash
npm install
node server.js
```

The relay listens on TCP port `8787` and broadcasts Quest spatial packets and phone-enrichment packets to connected clients.

Then open `HyperStream_Advanced.html` on the phone and enter the relay address. Press **Connect**.

## Mapping flow

`Quest Space Setup → native Quest mapper → real planes/mesh vertices → WebSocket relay → HyperStream HTML → phone image enrichment → Save World → Enter World`

The native app does not fabricate room geometry when Quest scene data is unavailable. If Space Setup or the required Scene/Meshing features are unavailable, the mapper reports that state instead of creating fake geometry.

## Important limitation

This is a real native mapping foundation, but it is not yet a photorealistic scanned-room renderer. The Quest provider supplies scene/mesh information and the current bridge transfers sampled geometry. The next renderer upgrade can consume the full mesh topology/material data and attach phone imagery to spatial anchors.
