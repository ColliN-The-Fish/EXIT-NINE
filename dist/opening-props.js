import * as T from './vendor/three.module.js';
import {makePerson} from './characters.js';
// Permanent site props; cinematic vehicles and actors are created only on demand.
export function installArrivalProps(w){const a=w.a,steel=a.get('metal'),dark=a.plain(0x29342e),wood=a.get('wood'),tag={cinematicProp:true};w.arrival={};
 const post=w.box(-14.15,1.38,-16.35,.07,2.76,.07,steel,true);w.sign(['COUNTY TRANSIT','EXIT NINE','LAST BUS 23:55'],-14.15,2.43,-16.31,.72,0,{aspect:.8,bg:'#385657',fg:'#ddd6b9'});w.box(-14.15,1.24,-16.29,.34,.55,.018,a.get('paper'));for(const x of[-17.1,-15.3]){w.box(x,.25,-16.5,.08,.5,.45,steel);}w.box(-16.2,.53,-16.5,2.2,.085,.46,wood);w.box(-16.2,.86,-16.68,2.2,.53,.055,wood);w.solids.push({x:-16.2,z:-16.5,w:2.2,d:.62,sightBottom:0,sightTop:1.13,fixture:'bus-stop-bench'});w.arrival.stop=post;w.arrival.busLight=new T.PointLight(0xffd7a1,0,10,1.5);w.scene.add(w.arrival.busLight);
 const g=new T.Group();g.name='staff-uniform-locker';g.position.set(16.6,.11,9.55);w.scene.add(g);const b=(x,y,z,sx,sy,sz,m=steel,parent=g)=>w.box(x,y,z,sx,sy,sz,m,false,parent);for(const x of[-.65,.65])b(x,1,0,.06,2,.60);b(0,1,-.29,1.3,2,.06);for(const y of[.1,1.98])b(0,y,0,1.3,.06,.6);b(0,1.72,0,1.2,.035,.04,dark);const leaf=new T.Group();leaf.position.set(-.65,0,.32);g.add(leaf);b(.65,1,0,1.3,1.9,.06,a.get('paint',0x6d776b),leaf);b(1.16,1.06,.055,.035,.24,.07,dark,leaf);for(const y of[1.51,1.58,1.65])b(.65,y,.038,.65,.02,.012,dark,leaf);w.solids.push({x:16.6,z:9.55,w:1.4,d:.65});
 const shirt=new T.Group();g.add(shirt);shirt.position.set(0,1.24,.10);const cloth=a.get('cloth',0x617561),cream=a.get('cloth',0xaca68d);b(0,0,0,.50,.66,.12,cloth,shirt);for(const side of[-1,1]){const arm=b(side*.32,.13,0,.24,.40,.11,cloth,shirt);arm.rotation.z=side*.35;b(side*.11,.34,.07,.14,.11,.03,cream,shirt);}b(0,.04,.07,.025,.53,.01,dark,shirt);for(let i=0;i<4;i++)b(.035,.25-i*.13,.083,.013,.013,.01,cream,shirt);w.arrival.locker=g;w.arrival.lockerDoor=leaf;w.arrival.uniform=shirt;
}
export function makeArrivalBus(w){
 const a=w.a,g=new T.Group();g.name='last-county-bus';g.userData.wheels=[];w.scene.add(g);
 const cream=a.get('plaster',0xddd8c2,{side:T.DoubleSide,roughness:.6,metalness:.15}),green=a.get('paint',0x334d43),rubber=a.plain(0x151b19),steel=a.plain(0x7f8a80,.44,.65),trim=a.plain(0x3a433d),cloth=a.get('cloth',0x69715b);
 const glass=new T.MeshStandardMaterial({color:0x758579,transparent:true,opacity:.16,roughness:.46,metalness:0,depthWrite:false,side:T.DoubleSide});
 const b=(x,y,z,sx,sy,sz,m=cream,parent=g)=>w.box(x,y,z,sx,sy,sz,m,false,parent);
 const rod=(from,to,r=.018,m=steel,parent=g)=>{const start=new T.Vector3(...from),end=new T.Vector3(...to),delta=end.clone().sub(start),mesh=new T.Mesh(new T.CylinderGeometry(r,r,delta.length(),6),m);mesh.position.copy(start).addScaledVector(delta,.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());parent.add(mesh);return mesh;};

 // Underfloor chassis and a modestly rounded roof; the entrance is flush with
 // the body. No staircase or deployable platform projects onto the pavement.
 b(0,.69,0,8.35,.22,2.36,rubber);b(0,.87,0,8.55,.12,2.52,trim);b(0,.96,0,8.45,.035,2.48,a.get('floor',0x596156));
 b(0,2.89,0,8.50,.18,2.57);b(0,2.94,0,8.05,.15,2.35);b(0,2.77,0,8.65,.16,2.70,green);
 for(const side of[-1,1]){
  const z=side*1.33;
  // Real cutouts around both wheels, rather than tyres pasted onto solid walls.
  const shape=new T.Shape();shape.moveTo(-4.32,.57);shape.lineTo(-3.52,.57);shape.lineTo(-3.52,.65);shape.absarc(-2.9,.65,.62,Math.PI,0,true);shape.lineTo(-2.28,.57);shape.lineTo(.83,.57);shape.lineTo(.83,.65);shape.absarc(1.45,.65,.62,Math.PI,0,true);shape.lineTo(2.07,.57);shape.lineTo(side<0?4.32:2.10,.57);shape.lineTo(side<0?4.32:2.10,1.70);shape.lineTo(-4.32,1.70);shape.closePath();
  const geo=new T.ShapeGeometry(shape,12),mat=cream;
  // The curb-side front entrance has its own full-height movable door leaves.
  const panel=new T.Mesh(geo,mat);panel.position.z=z;g.add(panel);
  if(side>0){b(3.96,1.30,z,.72,.83,.07);b(2.78,.96,1.28,1.30,.055,.20,rubber);}

  for(const x of[-2.9,1.45]){const curve=new T.EllipseCurve(x,.65,.65,.65,0,Math.PI,false),pts=curve.getPoints(14).map(p=>new T.Vector3(p.x,p.y,z+side*.025)),arch=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),14,.035,5,false),trim);g.add(arch);}
  for(const[l,r]of side<0?[[-4.28,4.28]]:[[-4.28,2.10],[3.48,4.28]]){b((l+r)/2,1.37,z+side*.045,r-l,.16,.025,green);b((l+r)/2,.62,z+side*.035,r-l,.045,.035,steel);}
  const windows=[[-3.57,1.24],[-2.18,1.24],[-.79,1.24],[.60,1.24],[1.73,.78],...(side<0?[[3.22,1.85]]:[])];
  for(const[x,width]of windows){for(const y of[1.75,2.63])b(x,y,z,width+.075,.055,.075,trim);for(const edge of[-1,1])b(x+edge*(width+.02)/2,2.19,z,.055,.91,.075,trim);b(x,2.19,z,width,.83,.018,glass);b(x,2.45,z+side*.012,width,.022,.024,steel);}
  b(0,2.70,z,8.6,.10,.08,cream);for(const x of[-4.28,4.28])b(x,2.18,z,.11,1.04,.11,green);
  for(const x of[-4.03,-1.4,1.4,4.03]){b(x,.79,z+side*.04,.08,.07,.016,a.glow(0xb87937,.38,false));}
  b(-3.98,1.06,z+side*.05,.25,.23,.025,trim);for(let j=0;j<5;j++)b(-3.98,.97+j*.045,z+side*.07,.22,.013,.012,rubber);
 }
 // Two-piece windscreen, gasket, wipers, bumpers, lamps and radiator grille.
 b(4.30,1.30,0,.18,.82,2.64);b(-4.30,1.30,0,.18,.82,2.64);
 for(const x of[-4.38,4.38]){b(x,2.18,0,.035,1.01,2.58,rubber);for(const side of[-1,1])b(x+(x>0?.016:-.016),2.17,side*.63,.02,.87,1.18,glass);b(x,2.17,0,.065,.97,.055,green);b(x,.73,0,.16,.18,2.75,trim);b(x,1.07,0,.025,.38,.98,rubber);for(let n=0;n<8;n++)b(x+(x>0?.016:-.016),.93+n*.038,0,.012,.012,.9,steel);}
 for(const side of[-1,1]){b(4.40,1.23,side*.96,.04,.26,.48,trim);b(4.43,1.25,side*.96,.025,.17,.32,a.glow(0xf0d29d,1.15,false));b(4.43,1.02,side*1.03,.025,.10,.20,a.glow(0xb1783c,.55,false));b(-4.41,1.16,side*1.03,.025,.25,.16,a.glow(0x822a21,.6,false));rod([4.415,1.76,side*.50],[4.415,2.14,side*.75],.016,rubber);rod([4.415,2.08,side*.81],[4.415,2.25,side*.68],.023,rubber);rod([3.99,2.44,side*1.31],[4.08,2.32,side*1.65],.025,trim);b(4.08,2.18,side*1.65,.07,.30,.20,trim);b(4.12,2.18,side*1.65,.012,.24,.15,steel);}
 b(4.42,.80,0,.025,.17,.47,a.plain(0xb8bba4));b(-4.42,.80,0,.025,.17,.47,a.plain(0xb8bba4));
 const destination=new T.Mesh(new T.PlaneGeometry(2.21,.28),new T.MeshBasicMaterial({map:a.sign(['N9  /  EXIT NINE'],{aspect:8,bg:'#171e17',fg:'#c8b782'}),toneMapped:false}));destination.position.set(4.405,2.72,0);destination.rotation.y=Math.PI/2;g.add(destination);
 // Each wheel rolls about its axle; separate hubs no longer yaw sideways.
 for(const x of[-2.9,1.45])for(const side of[-1,1]){const roll=new T.Group();roll.position.set(x,.54,side*1.31);g.add(roll);const tyre=new T.Mesh(new T.CylinderGeometry(.52,.52,.25,20),rubber);tyre.rotation.x=Math.PI/2;roll.add(tyre);const hub=new T.Mesh(new T.CylinderGeometry(.29,.29,.025,12),steel);hub.rotation.x=Math.PI/2;hub.position.z=side*.143;roll.add(hub);for(let n=0;n<6;n++){const v=n/6*Math.PI*2;b(Math.cos(v)*.19,Math.sin(v)*.19,side*.16,.035,.035,.025,trim,roll);}const rim=new T.Mesh(new T.TorusGeometry(.32,.025,5,20),trim);rim.position.z=side*.145;roll.add(rim);g.userData.wheels.push({tyre,hub,roll});}
 // Seat frames, aisle, overhead rails and a recognisable driver's station.
 for(const x of[-3.1,-1.65,-.2,1.25])for(const side of[-1,1]){b(x,1.22,side*.80,1.05,.18,.71,cloth);const back=b(x-.46,1.61,side*.80,.12,.73,.71,cloth);back.rotation.z=-.07;for(const z of[side*.48,side*1.1])b(x,1.05,z,.045,.24,.045,steel);}
 for(const side of[-1,1]){rod([-3.8,2.57,side*.64],[2.25,2.57,side*.64],.026);for(const x of[-2.8,-.5,1.6])rod([x,.98,side*.58],[x,2.57,side*.58],.023);b(-.5,2.80,side*.68,5.8,.035,.12,a.glow(0xd5bc86,.48,false));}
 b(3.62,1.29,-.72,.70,.18,.65,cloth);b(3.26,1.68,-.72,.12,.75,.65,cloth);b(4.02,1.52,-.48,.47,.20,1.22,trim);b(3.98,1.65,-.48,.30,.045,.55,rubber);for(const z of[-.68,-.48,-.28])b(3.98,1.676,z,.11,.01,.13,a.glow(0x7f9b6b,.15,false));const steering=new T.Mesh(new T.TorusGeometry(.24,.023,6,16),rubber);steering.position.set(3.73,1.62,-.70);steering.rotation.y=Math.PI/2-.45;g.add(steering);rod([3.75,1.58,-.70],[4.02,1.38,-.70],.035,trim);
 const doors=[];for(const side of[-1,1]){const leaf=new T.Group();leaf.position.set(2.8+side*.64,.89,1.34);g.add(leaf);b(-side*.31,.91,0,.62,1.82,.045,green,leaf);b(-side*.31,.33,.03,.48,.50,.025,cream,leaf);b(-side*.31,1.18,.026,.49,1.05,.025,rubber,leaf);b(-side*.31,1.18,.044,.43,.97,.014,glass,leaf);b(-side*.31,.68,.052,.47,.035,.02,steel,leaf);doors.push({leaf,side});}
 g.userData.doors=doors;g.userData.ownedMaterials=[glass];
 // Merge only the stationary coach body. Wheels and door leaves keep their
 // own transforms; detailing must not multiply the cinematic's draw calls.
 const moving=new Set();for(const root of [...doors.map(q=>q.leaf),...g.userData.wheels.map(q=>q.roll)])root.traverse(o=>moving.add(o));
 const batches=new Map();g.updateMatrixWorld(true);g.traverse(o=>{if(!o.isMesh||moving.has(o)||o.material.transparent)return;const key=o.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);});
 for(const meshes of batches.values()){if(meshes.length<2)continue;const parts=meshes.map(m=>{const geo=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();geo.applyMatrix4(m.matrixWorld);return geo;}),geo=new T.BufferGeometry();for(const key of ['position','normal','uv']){if(!parts.every(p=>p.attributes[key]))continue;const size=parts[0].attributes[key].itemSize,values=new Float32Array(parts.reduce((n,p)=>n+p.attributes[key].array.length,0));let at=0;for(const p of parts){values.set(p.attributes[key].array,at);at+=p.attributes[key].array.length;}geo.setAttribute(key,new T.BufferAttribute(values,size));}geo.computeBoundingSphere();const mesh=new T.Mesh(geo,meshes[0].material);mesh.name='coach-body-batch';mesh.castShadow=meshes.some(m=>m.castShadow);mesh.receiveShadow=true;g.add(mesh);for(const m of meshes){m.geometry.dispose();m.removeFromParent();}for(const p of parts)p.dispose();}
 return g;
}
export function makeOpeningActors(w){const self=makePerson(w.scene,w.a,'cinematic-player'),ben=makePerson(w.scene,w.a,'handoff-ben');self.g.name='opening-player-legs';ben.g.name='outgoing-clerk-ben';self.upper.visible=false;self.item.visible=false;self.g.scale.setScalar(1.03);ben.g.scale.setScalar(1.03);ben.item.visible=false;for(const m of[self,ben])m.g.traverse(o=>{o.userData.cinematicOnly=true;delete o.userData.actor;});const hands=new T.Group();hands.name='opening-first-person-arms';hands.rotation.y=Math.PI;w.camera.add(hands);self.arms.forEach(({arm},i)=>{arm.userData.openingBodyPosition=arm.position.clone();hands.add(arm);arm.position.set(i?.22:-.22,-.12,.12);});const key=new T.Group();key.name='handover-station-keys';w.scene.add(key);const ring=new T.Mesh(new T.TorusGeometry(.035,.008,6,12),w.a.plain(0xc2c9b4,.3,.65));ring.rotation.x=Math.PI/2;key.add(ring);for(const x of[-.02,.02])w.box(x,-.045,.02,.015,.10,.025,w.a.plain(0xc2c9b4,.3,.65),false,key);key.visible=false;return{self,ben,hands,key};}
export function disposeOpeningActor(w,model){model.g.traverse(o=>{o.geometry?.dispose();});w.scene.remove(model.g);}
