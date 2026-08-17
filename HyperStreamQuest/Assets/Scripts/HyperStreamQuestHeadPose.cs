using UnityEngine;
using UnityEngine.XR;

public sealed class HyperStreamQuestHeadPose : MonoBehaviour
{
    public Camera targetCamera;
    void Start(){if(targetCamera==null)targetCamera=GetComponent<Camera>()??Camera.main;}
    void LateUpdate()
    {
        if(targetCamera==null)return;
        var p=InputTracking.GetLocalPosition(XRNode.CenterEye);
        var r=InputTracking.GetLocalRotation(XRNode.CenterEye);
        if(p!=Vector3.zero)targetCamera.transform.localPosition=p;
        targetCamera.transform.localRotation=r;
    }
}
