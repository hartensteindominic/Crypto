# HyperStream Quest Rebuild

This native Quest layer is intentionally the source of spatial truth.

## Runtime flow

1. Start OpenXR/Meta XR.
2. Require Quest Space Setup / Scene access.
3. Enable passthrough camera background.
4. Start AR Foundation plane + mesh managers.
5. Render real tracked meshes and planes.
6. Record bounded spatial snapshots.
7. Stream world packets to HyperStream relay.
8. Phone enriches the existing world instead of replacing mapping.
9. Save/load the world using X/Y/Z/T/S metadata.

## Non-negotiable behavior

- Never generate fake room geometry as a substitute for missing Quest data.
- Never show an unexplained black mapping state.
- Show explicit diagnostics for XR loader, scene permission, Space Setup, plane count, mesh count, and tracking state.
- The phone is an enrichment device; Quest owns spatial coordinates.
- Recording stores changes/snapshots, not every raw mesh vertex forever.

## Build requirements

Use a Unity project with Android + OpenXR + Meta OpenXR/Meta XR features configured for the Quest target. Complete Quest Space Setup before testing scene reconstruction. Build an Android APK and install it on the Quest. The HTML dashboard alone cannot access private Quest Scene Model data.
