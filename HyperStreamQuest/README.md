# HyperStream Quest

Native Quest/OpenXR side of HyperStream. The Quest is the source of spatial truth; the iPhone enriches that world with visual detail.

## Runtime flow

`Quest passthrough → Space Setup/Scene Model → real planes + room mesh → visible 3D reconstruction → Record → iPhone Enrich → Save World → Enter World`

## Native Quest changes

- Unity 6 project with AR Foundation + Meta OpenXR.
- Runtime XR loader initialization happens before mapping starts.
- Quest camera uses `ARCameraBackground` for passthrough instead of leaving a transparent camera over a black render target.
- Plane and mesh managers are enabled only after XR/session startup.
- Scene permission is requested on Android.
- Room mesh rendering uses the actual AR mesh trackable IDs and geometry.
- Mapping starts automatically after session startup.
- Spatial packets contain headset pose, plane locations, and sampled real mesh vertices.
- Mesh history is bounded; the mapper does not intentionally accumulate an infinite cloud.
- Android manifest includes `USE_SCENE` and network permission.

## Build

1. Open `HyperStreamQuest/` in Unity 6.
2. Let Package Manager resolve the existing AR Foundation, OpenXR, and Meta OpenXR dependencies.
3. Use **HyperStream → Create Quest World Scene**.
4. In **Project Settings → XR Plug-in Management → Android**, enable OpenXR.
5. Enable the Meta Quest features for Scene/meshing/camera available in the installed Meta OpenXR package.
6. Complete Quest **Space Setup** on the headset.
7. Build an Android APK and install it on Quest.

The project is deliberately not pretending that a browser can access private Quest scene data. The native application is the spatial mapper.

## Phone + relay

Run:

```bash
cd hyperstream-relay
npm install
node server.js
```

Then open `HyperStream_Advanced.html` on the phone and set the relay address to the computer's LAN address, for example `ws://192.168.1.100:8787`.

The phone camera is an enrichment source. Quest establishes the spatial coordinate system first, and phone images are associated with the current world location rather than being treated as the room's primary depth source.

## Saved world

The HyperStream world format keeps:

- X/Y/Z spatial coordinates
- T temporal history
- S spatial confidence/state
- planes
- meshes/vertices
- phone enrichment references

The renderer should show actual received geometry. It does not fabricate a room when Quest Scene/Meshing data is unavailable.

## Honest status

The repository now contains the native Quest source and project structure, but an Android APK still has to be produced by Unity and installed on the headset. A GitHub source commit alone cannot be truthfully described as a tested APK.
