import * as T from './vendor/three.module.js';
import {PRODUCTS,productSlot} from './product-catalog.js';
import {createProduct,removeProduct} from './product-models.js';
import {damp,smooth,solveArm,angleDelta} from './locomotion.js';
const zAxis=new T.Vector3(0,0,1),up=new T.Vector3(0,1,0),ease=(o,k,v,dt,snap)=>o[k]=snap?v:damp(o[k],v,18,dt);
function depth(p,scale){return ((p.grip==='round'?p.r:p.d/2)+.010)/scale;}
export function animateGrasp(m,a,c,u,dt,snap){
 const id=c?.basket?.[a.browseIndex],p=PRODUCTS[id];if(!p||!u){if(m.shopItem)m.shopItem.visible=false;m.graspState=null;return;}
 const side=c?.appearance==='cane'?0:(a.spawnOrder||0)%2,limb=m.arms[side],scale=m.g.scale.x,roll=(side?-1:1)*Math.PI/2,offset=new T.Vector3(0,-.03,depth(p,scale));
 m.g.updateMatrixWorld(true);
 let center;if(a.shoppingTarget)center=new T.Vector3(a.shoppingTarget.x,a.shoppingTarget.y,a.shoppingTarget.z);else{center=m.g.localToWorld(new T.Vector3(limb.arm.position.x+(side?-.03:.03),0,.56));center.y=1.3175+p.h/2;}
 const offsetWorld=offset.clone().applyAxisAngle(zAxis,roll).multiplyScalar(scale).applyQuaternion(m.g.quaternion),contact=m.upper.worldToLocal(center.clone().sub(offsetWorld));m.graspContact=contact.clone();m.graspRoll=roll;
 const rest=new T.Vector3(limb.arm.position.x,-.27,.025),held=new T.Vector3(limb.arm.position.x+(side?1:-1)*(p.w/2+.065)/scale,-.025,0),stowed=new T.Vector3(limb.arm.position.x+(side?1:-1)*(p.w/2+.065)/scale,-.23,-.02),lifted=contact.clone().add(new T.Vector3(0,(a.shoppingTarget?.fixture?.12:.085)/scale,-.055)),clear=lifted.clone().setX(held.x).setZ(0),progress=u.u??0,target=rest.clone().lerp(contact,smooth((progress-.17)/.22)).lerp(lifted,smooth((progress-.54)/.09)).lerp(clear,smooth((progress-.64)/.14)).lerp(held,smooth((progress-.79)/.10)).lerp(stowed,u.stow),dy=target.y-limb.arm.position.y,dx=target.x-limb.arm.position.x,dz=target.z,ik=solveArm(dy,Math.hypot(dx,dz)),yaw=Math.atan2(dx,dz);
 limb.arm.rotation.order='YXZ';ease(limb.arm.rotation,'x',ik.shoulder,dt,snap);limb.arm.rotation.y+=angleDelta(limb.arm.rotation.y,yaw)*(snap?1:1-Math.exp(-18*dt));ease(limb.arm.rotation,'z',0,dt,snap);ease(limb.elbow.rotation,'x',ik.elbow,dt,snap);ease(limb.elbow.rotation,'z',0,dt,snap);
 m.g.updateMatrixWorld(true);const desired=m.g.getWorldQuaternion(new T.Quaternion()).multiply(new T.Quaternion().setFromAxisAngle(zAxis,roll*smooth(((u.u??0)-.17)/.22)*(1-smooth(((u.u??0)-.96)/.04)))),parent=limb.elbow.getWorldQuaternion(new T.Quaternion()).invert(),local=parent.multiply(desired);limb.hand.quaternion.copy(local);
 const round=p.grip==='round',radius=depth(p,scale)-.003,halfWidth=p.w/2/scale;
 limb.fingers.forEach(({joint,tip,distal},j)=>{const L1=[.028,.032,.031,.025][j],L2=[.021,.023,.022,.018][j],L3=[.017,.018,.017,.014][j],close=smooth((u.close-j*.075)/.775)*(1-u.stow*.55),pinch=p.grip==='pinch'&&j!==(side?0:3)?.35:1;
  const angles=round?[L1/(2*radius),(L1+L2)/(2*radius),(L2+L3)/(2*radius)]:[.014,.035,L1+L2>halfWidth+.002?1.30:.014];
  ease(joint.rotation,'x',-.10+(.10-angles[0])*close*pinch,dt,snap);ease(tip.rotation,'x',-.10+(.10-angles[1])*close*pinch,dt,snap);ease(distal.rotation,'x',-.08+(.08-angles[2])*close*pinch,dt,snap);ease(joint.rotation,'z',(j-1.5)*.045*u.spread,dt,snap);
 });
 ease(limb.thumb.position,'y',round?.008:Math.max(.008,halfWidth+.005-.03),dt,snap);ease(limb.thumb.rotation,'x',-.25-u.close*(round?.55:.38),dt,snap);ease(limb.thumb.rotation,'z',(side?-1:1)*(.45-u.close*.27),dt,snap);
 if(m.shopItemId!==id){removeProduct(m.shopItem);m.shopItem=createProduct(m.art,id);m.shopItem.userData.actor=a.id;m.shopItemId=id;}
 const item=m.shopItem,owner=u.attached?limb.hand:m.g,targetRotation=new T.Quaternion().setFromAxisAngle(zAxis,-roll).multiply(new T.Quaternion().setFromAxisAngle(up,Math.PI));m.g.updateMatrixWorld(true);
 if(item.parent!==owner){if(u.attached&&item.parent){owner.attach(item);m.gripOffset=item.position.clone();m.gripRotation=item.quaternion.clone();}else{owner.add(item);m.gripOffset=offset.clone();m.gripRotation=targetRotation.clone();}}
 item.scale.setScalar(1/scale);item.visible=u.attached&&u.stow<.98;
 if(u.attached){const blend=smooth(u.close/.30);item.position.copy(m.gripOffset||offset).lerp(offset,blend);item.quaternion.copy(m.gripRotation||targetRotation).slerp(targetRotation,blend);}else{item.position.copy(m.g.worldToLocal(center.clone()));item.rotation.set(0,Math.PI,0);}
 m.graspState={...u,side,product:id,held:u.attached};m.graspTarget={x:target.x,y:target.y,z:target.z,side};
}
