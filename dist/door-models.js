import {FRONT_LEAF_OFFSET} from './door-system.js';
import {buildShutter,syncShutter} from './shutter-model.js';
import * as T from './vendor/three.module.js';
import {DOORS} from './data.js';
export function buildDoors(w){const a=w.a,steel=a.plain(0x727c72,.46,.3),glass=new T.MeshStandardMaterial({color:0x8da494,transparent:true,opacity:.075,roughness:.72,metalness:0,depthWrite:false,side:T.DoubleSide});
 for(const[id,d]of Object.entries(DOORS)){const g=new T.Group();w.scene.add(g);w.doorMeshes[id]=g;g.name='door-'+id;
  if(d.rolling){buildShutter(w,g,d);continue;}
  if(id==='front'){g.position.set(d.x,0,d.z);g.userData.leaves=[];for(const sign of[-1,1]){const leaf=new T.Group();g.add(leaf);leaf.userData.sign=sign;leaf.position.z=FRONT_LEAF_OFFSET;const b=(x,y,z,sx,sy,sz,m)=>w.box(x,y,z,sx,sy,sz,m,false,leaf,{id:'door',key:id});b(0,1.38,0,d.w/2-.07,2.62,.035,glass);for(const xx of[-d.w/4+.025,d.w/4-.025])b(xx,1.4,0,.045,2.8,.09,steel);for(const yy of[.07,2.73])b(0,yy,0,d.w/2,.09,.09,steel);b(0,.28,0,d.w/2,.08,.05,steel);g.userData.leaves.push(leaf);}w.box(d.x,2.9,d.z+FRONT_LEAF_OFFSET,d.w*2,.16,.20,a.get('metal'));w.box(d.x,2.85,d.z+.14,.16,.07,.09,a.plain(0x202c25));
  }else{const vertical=d.d>d.w,width=vertical?d.d:d.w,mat=a.get('paint',id==='loading'?0x8c8467:0x787f6b);g.position.set(d.x-(vertical?0:width/2),0,d.z-(vertical?width/2:0));const build=new T.Group();g.add(build);build.position.set(vertical?0:width/2,0,vertical?width/2:0);if(vertical)build.rotation.y=Math.PI/2;g.userData.vertical=vertical;const tag={id:'door',key:id},cx=(vertical?-1:1)*width*.27,winW=.21,winY=1.74,winH=.95,b=(x,y,sx,sy,m=mat,z=0,dep=.14)=>w.box(x,y,z,sx,sy,dep,m,false,build,tag);
   b(-width/2+(cx-winW/2+width/2)/2,1.4,cx-winW/2+width/2,2.8);b(cx+winW/2+(width/2-cx-winW/2)/2,1.4,width/2-cx-winW/2,2.8);b(cx,(winY-winH/2)/2,winW,winY-winH/2);b(cx,(2.8+winY+winH/2)/2,winW,2.8-winY-winH/2);b(cx,winY,winW,winH,glass,0,.026);for(const x of[cx-winW/2,cx+winW/2])b(x,winY,.024,winH+.06,steel,0,.17);for(const y of[winY-winH/2,winY+winH/2])b(cx,y,winW+.03,.024,steel,0,.17);
   for(const side of[-1,1]){const h=b((vertical?-1:1)*width*.35,1.12,.045,.20,steel,side*.115,.08);h.userData.target={...tag,handle:true};}g.userData.window={x:cx,y:winY,w:winW,h:winH};
  }w.target('door',id,d.x,1.4,d.z,d.name);
 }
}
export function syncDoors(w,s){for(const[id,g]of Object.entries(w.doorMeshes)){if(DOORS[id].rolling){syncShutter(g,s);continue;}if(id==='front'){const half=DOORS.front.w/2,u=s.frontSlide??(s.doors.front?1:0);for(const leaf of g.userData.leaves)leaf.position.x=leaf.userData.sign*(half/2+half*u);}else g.rotation.y=s.doors[id]?(g.userData.vertical?Math.PI*.51:-Math.PI*.51):0;}}
