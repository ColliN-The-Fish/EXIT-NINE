import * as T from './vendor/three.module.js';
import {WEED_BEDS,SCRAP_BARRIER} from './service-route-layout.js';
export function installRouteVegetation(w,parent){
 let seed=913;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 // Broad, bent blades with a centre ridge, drooping outer leaves and seed heads.
 // Three compact meshes, rather than thousands of separately rendered plants.
 const leafCanvas=document.createElement('canvas');leafCanvas.width=64;leafCanvas.height=128;const ctx=leafCanvas.getContext('2d');ctx.fillStyle='#b9b7a2';ctx.fillRect(0,0,64,128);for(let i=0;i<360;i++){ctx.fillStyle=i%3?'#777b6655':'#e2d9b55a';ctx.fillRect(random()*64,random()*128,.5+random()*2,2+random()*20);}ctx.fillStyle='#d3c59b88';ctx.fillRect(31,0,2,128);const leafMap=new T.CanvasTexture(leafCanvas);leafMap.colorSpace=T.SRGBColorSpace;leafMap.magFilter=T.LinearFilter;const material=new T.MeshStandardMaterial({map:leafMap,vertexColors:true,roughness:1,side:T.DoubleSide}),seedMat=w.a.plain(0x70634a),seedGeo=new T.IcosahedronGeometry(.027,0),heads=[];let blades=0,clumps=0;
 for(const bed of WEED_BEDS){const pos=[],color=[],uv=[],c=new T.Color();const tri=(a,b,d,tint)=>{for(const q of [a,b,d]){pos.push(...q);uv.push(...q.uv);color.push(c.r*tint,c.g*tint,c.b*tint);}};
  for(let i=0,accepted=0;i<bed.count*24&&accepted<bed.count;i++){
   const x=bed.x0+random()*(bed.x1-bed.x0),z=bed.z0+random()*(bed.z1-bed.z0),edge=Math.min(x-bed.x0,bed.x1-x,z-bed.z0,bed.z1-z),height=(bed.min+random()*(bed.max-bed.min))*(.45+.55*Math.min(1,edge/.4)),phase=random()*Math.PI*2;
   const radius=height*.42+.035;if([...w.solids,...SCRAP_BARRIER].some(p=>Math.abs(x-p.x)<p.w/2+radius&&Math.abs(z-p.z)<p.d/2+radius))continue;clumps++;accepted++;
   for(let j=0;j<6;j++){blades++;const a=phase+j*2.4+(random()-.5)*.8,h=height*(j<2?.82+random()*.18:.38+random()*.39),width=.015+random()*.035,bend=h*(.18+random()*.23),baseY=.025;const rows=[];c.setHex([0x46583a,0x526042,0x676b43,0x384a32,0x78744c,0x5b6240][(i+j)%6]);c.multiplyScalar(.80+random()*.32);
    for(let k=0;k<=4;k++){const t=k/4,spread=width*Math.sin(Math.PI*t)**.7,lean=bend*t*t,y=baseY+h*(t-.23*t*t);const centre=[x+Math.cos(a)*lean,y,z+Math.sin(a)*lean],left=[centre[0]-Math.sin(a)*spread,y-.012*t,centre[2]+Math.cos(a)*spread],right=[centre[0]+Math.sin(a)*spread,y-.012*t,centre[2]-Math.cos(a)*spread];left.uv=[0,t];centre.uv=[.5,t];right.uv=[1,t];rows.push([left,centre,right]);}
    if(j===0&&i%9===0){const tip=rows[4][1];for(let n=0;n<3;n++)heads.push({x:tip[0]-Math.cos(a)*n*.012,y:tip[1]-n*.04,z:tip[2]-Math.sin(a)*n*.012,angle:a});}
    for(let k=0;k<4;k++){const a0=rows[k],b0=rows[k+1];tri(a0[0],a0[1],b0[1],.82);tri(a0[0],b0[1],b0[0],.82);tri(a0[1],a0[2],b0[2],1);tri(a0[1],b0[2],b0[1],1);}
   }
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('color',new T.Float32BufferAttribute(color,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();geo.computeBoundingSphere();const mesh=new T.Mesh(geo,material);mesh.name='dense-natural-weeds-'+bed.id;mesh.receiveShadow=true;mesh.userData.decorative=true;parent.add(mesh);
 }
 const seedMesh=new T.InstancedMesh(seedGeo,seedMat,heads.length),dummy=new T.Object3D();heads.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.z=.3;dummy.rotation.y=p.angle;dummy.scale.set(.8,3.4,.8);dummy.updateMatrix();seedMesh.setMatrixAt(i,dummy.matrix);});seedMesh.userData.decorative=true;seedMesh.name='dry-seed-heads';parent.add(seedMesh);
 const rust=w.a.get('metal',0x695748),wood=w.a.get('wood',0x76654d),steel=w.a.get('paint',0x6a7164),dark=w.a.plain(0x2a3028);const b=(x,y,z,sx,sy,sz,m)=>w.box(x,y,z,sx,sy,sz,m,false,parent);
 for(const p of SCRAP_BARRIER){w.solids.push({...p,fixture:'rear-scrap-barrier'});
  if(p.kind==='cage'){for(const dx of[-.73,.73])for(const dz of[-1.25,1.25])b(p.x+dx,1,p.z+dz,.06,2,.06,rust);for(const y of[.18,.65,1.12,1.62,1.98]){for(const dx of[-.73,.73])b(p.x+dx,y,p.z,.035,.035,2.55,rust);for(const dz of[-1.25,1.25])b(p.x,y,p.z+dz,1.5,.035,.035,rust);}for(let j=0;j<9;j++){const m=new T.Mesh(new T.IcosahedronGeometry(.25+random()*.14,0),j%2?dark:steel);m.position.set(p.x+(random()-.5),.3+Math.floor(j/3)*.32,p.z+(random()-.5)*1.8);m.rotation.set(random(),random(),random());parent.add(m);}}
  else if(p.kind==='pallet'){for(const dx of[-.60,.60])b(p.x+dx,.055,p.z,.12,.07,1.7,wood);for(let k=0;k<6;k++){for(let j=0;j<5;j++)b(p.x-.70+j*.35,.12+k*.12,p.z,.22,.06,1.7,wood);for(const dz of[-.58,.58])b(p.x,.18+k*.12,p.z+dz,1.65,.06,.12,wood);}for(const dx of[-.62,.62])b(p.x+dx,.44,p.z,.08,.84,1.55,rust);}
  else if(p.kind==='barrels'){for(const dx of[-.38,.38])for(const dz of[-.54,.54]){const root=new T.Group();root.position.set(p.x+dx,0,p.z+dz);parent.add(root);const drum=new T.Mesh(new T.CylinderGeometry(.34,.35,1.14,12),rust);drum.position.y=.58;root.add(drum);for(const y of[.17,.55,1.02]){const ring=new T.Mesh(new T.TorusGeometry(.348,.018,4,12),dark);ring.rotation.x=Math.PI/2;ring.position.y=y;root.add(ring);}const cap=new T.Mesh(new T.CylinderGeometry(.052,.052,.02,8),dark);cap.position.set(.13,1.16,.08);root.add(cap);}}
  else{b(p.x,1,p.z,1.5,1.9,.85,steel);b(p.x,1,p.z-.44,1.35,1.7,.06,rust);b(p.x+.5,1,p.z-.5,.045,.55,.08,dark);b(p.x,.35,p.z+.75,1.3,.65,.75,steel);for(let j=0;j<9;j++)b(p.x-.55+j*.13,.70,p.z+.75,.05,.035,.65,rust);}
 }
 // Cardboard, discarded sheet metal and refuse lie among the weeds, not in the path.
 for(let i=0;i<44;i++){const x=11.1+random()*6.7,z=20+random()*4.3;const m=w.box(x,.07+random()*.08,z,.12+random()*.5,.03,.18+random()*.4,i%3?w.a.get('paper',0x877654):rust,false,parent);m.rotation.y=random()*Math.PI;m.userData.decorative=true;}
 w.routeVegetationInfo={beds:WEED_BEDS.map(b=>({...b})),clumps,plannedClumps:WEED_BEDS.reduce((n,b)=>n+b.count,0),blades,barrier:SCRAP_BARRIER,clearCorridor:{x0:18.85,x1:20.45,z0:7.3,z1:18.1},truckLaneMinZ:28};
}
