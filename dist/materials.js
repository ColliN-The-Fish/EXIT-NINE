import * as T from './vendor/three.module.js';

// Original, deterministic pixel textures. No remote images or runtime downloads.
function random(seed){let v=seed>>>0;return()=>{v=(1664525*v+1013904223)>>>0;return v/4294967296;};}
function canvas(w,h=w){const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d')];}
function texture(c,repeat=true){const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.magFilter=T.NearestFilter;t.minFilter=T.NearestMipmapLinearFilter;t.wrapS=t.wrapT=repeat?T.RepeatWrapping:T.ClampToEdgeWrapping;t.anisotropy=2;return t;}
function surface(kind){
 const[c,g]=canvas(128),r=random([...kind].reduce((a,b)=>a+b.charCodeAt(0),59));
 const colors={plaster:'#b8b9a2',tile:'#736a4b',floor:'#c1c2ad',ceiling:'#b1b39e',brick:'#6e7057',concrete:'#777a73',asphalt:'#44494a',dirt:'#222d2d',wood:'#6d4a32',metal:'#7e8b89',paint:'#354c50',paper:'#b69e70',cloth:'#bdbdb3',skin:'#e8ded0',roof:'#283639'};
 g.fillStyle=colors[kind]||'#898a7c';g.fillRect(0,0,128,128);
 for(let i=0;i<4300;i++){const v=r()>.46?230:12;g.fillStyle=`rgba(${v},${v},${v},${.02+r()*.10})`;const sz=r()>.94?3:1;g.fillRect(Math.floor(r()*128),Math.floor(r()*128),sz,sz);}
 if(kind==='tile'||kind==='floor'){
  const step=kind==='tile'?32:64;
  for(let x=0;x<128;x+=step)for(let y=0;y<128;y+=step){if((x/step+y/step)%2){g.fillStyle=kind==='floor'?'#687d7b':'#496062';g.globalAlpha=kind==='floor'?.58:.3;g.fillRect(x+2,y+2,step-3,step-3);g.globalAlpha=1;}g.fillStyle='#3f4946';g.fillRect(x,y,step,1);g.fillRect(x,y,1,step);g.fillStyle='#dde0ca55';g.fillRect(x+1,y+1,step-2,1);}
 }
 if(kind==='brick'){for(let y=0;y<128;y+=16){g.fillStyle='#333b32';g.fillRect(0,y,128,2);for(let x=(y/16)%2?16:0;x<128;x+=32){g.fillRect(x,y,2,16);g.fillStyle='#aaa68b33';g.fillRect(x+3,y+3,27,2);g.fillStyle='#333b32';}}}
 if(kind==='ceiling'){g.strokeStyle='#4e554b';g.lineWidth=2;for(let i=0;i<=128;i+=64){g.strokeRect(i,0,64,64);g.strokeRect(i,64,64,64);}}
 if(kind==='wood'){for(let i=0;i<100;i++){g.fillStyle=r()>.5?'#241b1840':'#ce956133';g.fillRect(0,Math.floor(r()*128),128,1);}g.fillStyle='#1a16137a';g.fillRect(0,63,128,2);}
 if(kind==='metal'||kind==='roof'){for(let x=0;x<128;x+=16){g.fillStyle='#17272d30';g.fillRect(x,0,2,128);g.fillStyle='#e0dfcd20';g.fillRect(x+2,0,1,128);}}
 if(['plaster','concrete','paper','asphalt'].includes(kind))for(let i=0;i<22;i++){g.fillStyle='#302c2520';const x=r()*128,y=r()*128;g.fillRect(x,y,3+r()*18,1+r()*6);}
 if(kind==='asphalt'||kind==='concrete'){g.strokeStyle='#19252a66';g.lineWidth=1;for(let i=0;i<4;i++){g.beginPath();let x=r()*128,y=r()*128;g.moveTo(x,y);for(let j=0;j<7;j++){x+=r()*15-5;y+=r()*20;g.lineTo(x,y);}g.stroke();}}
 if(kind==='cloth'){g.fillStyle='#1b1e1c22';for(let i=0;i<128;i+=4){g.fillRect(i,0,1,128);g.fillRect(0,i,128,1);}}
 return texture(c);
}
export function worldUV(geometry,unit=1){const p=geometry.attributes.position,n=geometry.attributes.normal,u=geometry.attributes.uv;if(!u)return geometry;for(let i=0;i<p.count;i++){const x=Math.abs(n.getX(i)),y=Math.abs(n.getY(i)),z=Math.abs(n.getZ(i));if(y>=x&&y>=z)u.setXY(i,p.getX(i)/unit,p.getZ(i)/unit);else if(x>=z)u.setXY(i,p.getZ(i)/unit,p.getY(i)/unit);else u.setXY(i,p.getX(i)/unit,p.getY(i)/unit);}return geometry;}
export class ArtMaterials{
 constructor(){this.cache=new Map();this.maps=new Map();this.powerMaterials=[];}
 map(kind){if(!this.maps.has(kind))this.maps.set(kind,surface(kind));return this.maps.get(kind);}
 get(kind,color=0xffffff,options={}){const key=kind+':'+color+':'+JSON.stringify(options);if(!this.cache.has(key)){const m=new T.MeshStandardMaterial({map:this.map(kind),color,roughness:kind==='metal'?.56:kind==='floor'?.55:.93,metalness:kind==='metal'?.42:0,flatShading:true,...options});m.userData.worldUV=true;this.cache.set(key,m);}return this.cache.get(key);}
 plain(color,roughness=.8,metalness=0){const key='plain:'+color+':'+roughness+':'+metalness;if(!this.cache.has(key))this.cache.set(key,new T.MeshStandardMaterial({color,roughness,metalness,flatShading:true}));return this.cache.get(key);}
 glow(color,intensity=1,powered=true){const key='glow:'+color+':'+intensity+':'+powered;if(!this.cache.has(key)){const m=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:.5,toneMapped:false});this.cache.set(key,m);if(powered)this.powerMaterials.push({m,intensity});}return this.cache.get(key);}
 base(color){const types=new Map([[0x909486,'plaster'],[0x52695c,'tile'],[0x535955,'asphalt'],[0x2d3938,'dirt'],[0x292f32,'asphalt'],[0x8f9385,'floor'],[0xa1a392,'floor'],[0x777f72,'concrete'],[0x657466,'roof'],[0x58695b,'roof'],[0x7c7868,'wood'],[0xa6a28b,'concrete'],[0x69736a,'paint'],[0x9da291,'metal'],[0x5a7167,'paint'],[0x7b8577,'wood'],[0x83754f,'paper'],[0xb6a175,'wood'],[0x617266,'metal'],[0xb7b7a1,'plaster'],[0x465f4d,'paint'],[0xa6b0a5,'metal'],[0x627e79,'paint']]);if(types.has(color))return this.get(types.get(color));return this.plain(color);}
 sign(lines,{bg='#19383a',fg='#ded8bc',accent='#c97442',size=256,aspect=2}={}){
  if(Array.isArray(lines)&&lines.includes('DANIEL REED'))lines=['ROAD NOTICE','CHECK WEATHER'];
  const[c,g]=canvas(size,Math.round(size/aspect));g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);g.fillStyle=accent;g.fillRect(5,2,c.width-10,2);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';const list=Array.isArray(lines)?lines:[lines];list.forEach((s,i)=>{g.font=`bold ${Math.floor(Math.min(size/(list.length===1?10:14),c.height/(list.length+1)*.88))}px monospace`;g.fillText(s,size/2,c.height*(i+1)/(list.length+1),size-18);});g.fillStyle='#080c0e44';for(let i=0;i<70;i++)g.fillRect((i*37)%size,(i*13)%c.height,2,1);return texture(c,false);
 }
 package(kind,tint='#c19c54'){
  const key='package:'+kind+tint;if(this.maps.has(key))return this.maps.get(key);
  const[c,g]=canvas(64,64);g.fillStyle=tint;g.fillRect(0,0,64,64);g.fillStyle='#e2d8bb';g.fillRect(4,9,56,42);g.fillStyle='#334947';g.fillRect(6,13,52,8);g.fillStyle=tint;g.beginPath();g.arc(32,35,11,0,7);g.fill();g.fillStyle='#272f2c';g.font='bold 8px monospace';g.textAlign='center';g.fillText(kind,32,19,49);g.font='6px monospace';g.fillText('EXIT NINE',32,57,58);g.fillStyle='#ddd4b6';for(let y=3;y<64;y+=58)g.fillRect(0,y,64,2);const t=texture(c,false);this.maps.set(key,t);return t;
 }
 skin(color){return this.get('skin',color,{roughness:1,metalness:0});}
 power(on){for(const {m,intensity}of this.powerMaterials)m.emissiveIntensity=on?intensity:0;}
}

// Static details are instanced by geometry/material, keeping the decorated scene economical.
export class Details{
 constructor(scene){this.scene=scene;this.groups=new Map();this.boxGeometry=new T.BoxGeometry(1,1,1);this.cylinderGeometry=new T.CylinderGeometry(1,1,1,8);this.coneGeometry=new T.ConeGeometry(1,1,7);}
 add(geometry,material,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){const key=geometry.uuid+material.uuid;if(!this.groups.has(key))this.groups.set(key,{geometry,material,matrices:[]});const o=new T.Object3D();o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);o.updateMatrix();this.groups.get(key).matrices.push(o.matrix.clone());}
 box(m,x,y,z,w,h,d,ry=0){this.add(this.boxGeometry,m,x,y,z,w,h,d,0,ry);}
 cylinder(m,x,y,z,r,h,rx=0,rz=0){this.add(this.cylinderGeometry,m,x,y,z,r,h,r,rx,0,rz);}
 cone(m,x,y,z,r,h){this.add(this.coneGeometry,m,x,y,z,r,h,r);}
 finish(){for(const {geometry,material,matrices}of this.groups.values()){const mesh=new T.InstancedMesh(geometry,material,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.decorative=true;this.scene.add(mesh);}this.groups.clear();}
}
export function decal(scene,map,x,y,z,w,h,rotation=[0,0,0],emissive=false){const m=emissive?new T.MeshBasicMaterial({map,toneMapped:false}):new T.MeshStandardMaterial({map,roughness:.9,side:T.DoubleSide});const o=new T.Mesh(new T.PlaneGeometry(w,h),m);o.position.set(x,y,z);o.rotation.set(...rotation);o.userData.decorative=true;scene.add(o);return o;}
export function contactShadow(scene,x,z,w,d,opacity=.3){
 const[c,g]=canvas(32);const grad=g.createRadialGradient(16,16,1,16,16,16);grad.addColorStop(0,'rgba(0,0,0,.85)');grad.addColorStop(.5,'rgba(0,0,0,.45)');grad.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=grad;g.fillRect(0,0,32,32);
 const o=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshBasicMaterial({map:texture(c,false),transparent:true,opacity,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));o.rotation.x=-Math.PI/2;o.position.set(x,.083,z);o.userData.decorative=true;scene.add(o);return o;
}
