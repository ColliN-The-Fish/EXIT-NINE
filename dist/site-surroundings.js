import * as T from './vendor/three.module.js';
import {makeCar} from './characters.js';
import {SURROUNDING_FIXTURES,WEST_GROWTH_BEDS} from './surroundings-layout.js';
export function installSiteSurroundings(w){
 const a=w.a,g=new T.Group();g.name='inhabited-service-station-surroundings';w.scene.add(g);w.siteSurroundings=g;
 const metal=a.get('metal',0x888c7d),dark=a.plain(0x28332e),paint=a.get('plaster',0x87918a),wood=a.get('wood',0x8f8367),brick=a.get('concrete',0x939288);
 const b=(x,y,z,sx,sy,sz,m=metal,parent=g)=>w.box(x,y,z,sx,sy,sz,m,false,parent);
 for(const f of SURROUNDING_FIXTURES)w.solids.push({...f,fixture:f.id});
 const pipe=(points,r=.03,m=metal)=>{const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const mesh=new T.Mesh(new T.TubeGeometry(c,Math.max(3,points.length*3),r,6,false),m);g.add(mesh);return mesh;};
 const sign=(text,x,y,z,width,angle=0,opts={})=>w.sign(text,x,y,z,width,angle,{aspect:5,bg:'#6b6d58',fg:'#d8cfad',...opts});
 // A shallow scored concrete maintenance walk and worn parking markings.
 for(let i=0;i<18;i++){const z=-4.6+i*1.28;b(-12.0,.025,z,1.12,.015,1.23,brick);}
 const marking=a.plain(0x9b9980);for(const x of[-19.65,-16.75])b(x,.027,-3.25,.075,.008,5.05,marking);b(-18.2,.028,-5.77,2.95,.01,.075,marking);
 const car=makeCar(w.scene,a,-18.2,-3,0x59645b,'EJN-219');car.name='parked-maintenance-sedan';w.siteParkedCar=car;
 for(const x of[-19.15,-17.25])b(x,.085,-.55,.60,.11,.16,a.get('concrete',0x9b9c84));
 // Old payphone: hood, handset, coiled cord and a supported pedestal.
 const phone=new T.Group();phone.position.set(-12.9,0,-2.1);phone.rotation.y=Math.PI/2;phone.name='west-payphone';g.add(phone);
 b(0,.59,0,.12,1.16,.12,metal,phone);b(0,.07,0,.5,.09,.5,dark,phone);b(0,1.45,.04,.52,.76,.28,paint,phone);for(const x of[-.28,.28])b(x,1.53,.17,.035,.98,.52,metal,phone);b(0,2.03,.17,.60,.065,.56,metal,phone);b(0,1.51,.20,.35,.60,.035,metal,phone);b(-.12,1.56,.235,.07,.33,.07,dark,phone);for(let row=0;row<4;row++)for(let col=0;col<3;col++)b(.01+col*.045,1.53-row*.043,.236,.029,.027,.015,dark,phone);const cord=[];for(let i=0;i<48;i++){const t=i/47;cord.push(new T.Vector3(-.12+Math.sin(t*36)*.018,1.39-t*.35,.24+Math.cos(t*36)*.018));}phone.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(cord),48,.008,4,false),dark));sign(['PUBLIC PHONE','COUNTY LINE'],-12.59,1.91,-2.1,.48,Math.PI/2,{aspect:2,bg:'#405b56'});
 // Wall utilities, conduits and rain drainage make the building have a back.
 b(-11.37,1.31,6.75,.42,.86,.72,paint);for(const z of[6.55,6.95]){const meter=new T.Mesh(new T.CylinderGeometry(.13,.13,.055,12),metal);meter.rotation.z=Math.PI/2;meter.position.set(-11.60,1.42,z);g.add(meter);b(-11.635,1.42,z,.012,.10,.012,dark);}pipe([[-11.37,.05,6.63],[-11.37,.8,6.63],[-11.37,2.4,6.63],[-11.2,2.65,6.63]],.035,dark);sign('DANGER / ELECTRIC',-11.59,1.03,6.75,.55,-Math.PI/2);
 for(const z of[-3.9,18.0]){pipe([[-11.23,3.42,z],[-11.40,3.25,z],[-11.40,.3,z],[-11.75,.12,z]],.052);for(const y of[.75,2.1])b(-11.28,y,z,.22,.04,.16,dark);}
 b(-11.27,3.48,7.05,.20,.14,23.0,metal);b(0,3.54,19.22,22,.13,.16,metal); // short edge gutter below rear roof
 const hvac=new T.Group();hvac.name='west-cooling-unit';hvac.position.set(-12.1,0,14.1);g.add(hvac);b(0,.12,0,1.12,.18,1.77,brick,hvac);b(0,.70,0,1.06,1.0,1.7,paint,hvac);for(const z of[-.62,.62])b(0,.20,z,.85,.12,.10,dark,hvac);for(let i=0;i<14;i++)b(-.542,.36+i*.045,0,.025,.018,1.45,dark,hvac);for(const z of[-.43,.43]){const fan=new T.Mesh(new T.CylinderGeometry(.31,.31,.035,16),dark);fan.position.set(0,1.22,z);hvac.add(fan);for(let i=-3;i<=3;i++)b(i*.073,1.245,z,.014,.02,.56,metal,hvac);}pipe([[-11.58,.50,14.65],[-11.3,.50,14.65],[-11.18,1.5,14.65]],.033,dark);
 // Recessed grates sit on the asphalt, without floating slabs or foot blockers.
 for(const z of[5.9,12.4,17.0]){b(-12.0,.027,z,.72,.012,.32,dark);for(let i=0;i<9;i++)b(-12.30+i*.075,.036,z,.027,.008,.29,metal);}
 // Covered rest spot: posts stand away from existing seats and walking gaps.
 const posts=SURROUNDING_FIXTURES.filter(f=>f.id.startsWith('picnic-post'));
 for(const p of posts){b(p.x,1.30,p.z,.11,2.56,.11,wood);b(p.x,.10,p.z,.24,.16,.24,brick);}
 const roof=b(-16.6,2.65,3.8,4.4,.12,3.80,a.get('roof'));roof.name='west-picnic-shelter-roof';
 b(-16.6,2.51,3.8,.38,.045,.19,a.glow(0xe5c08b,.65));w.light(-16.6,2.42,3.8,0xe5c08b,4.2,7).userData.westExterior=true;b(-17.6,2.22,12.78,.28,.10,.16,dark);b(-17.6,2.15,12.77,.22,.035,.12,a.glow(0xe5c08b,.55));w.light(-17.6,2.05,12.4,0xe5c08b,3,6).userData.westExterior=true;for(const z of[2.15,5.45])b(-16.6,2.52,z,4.15,.16,.11,wood);b(-16.6,2.60,3.8,4.15,.10,.12,wood);
 for(const z of[7.7,8.45,9.2]){b(-20.17,.82,z,.10,1.55,.08,wood);}for(const x of[-20.17,-16.64])b(x,.82,9.25,.10,1.55,.10,wood);for(let i=0;i<17;i++)b(-20.11+i*.215,.82,9.25,.15,1.50,.06,wood);for(let i=0;i<7;i++)b(-20.17,.82,7.72+i*.22,.06,1.5,.15,wood);sign(['RECYCLING','KEEP LIDS CLOSED'],-18.4,1.5,9.18,1.3,Math.PI);
 b(-19.8,.34,11.3,.48,.60,.50,brick);pipe([[-19.8,.63,11.3],[-19.8,1.15,11.3],[-19.55,1.15,11.3]],.027);const hose=new T.Mesh(new T.TorusGeometry(.21,.031,5,18),dark);hose.position.set(-19.8,.78,11.61);g.add(hose);sign('NON-POTABLE WATER',-19.8,1.46,11.63,.8,0);
 // Local moss, fallen leaves and bushes use compact instanced draws. Growth
 // is clipped against every solid so it cannot stick through tanks or sheds.
 let seed=180018;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const leafCanvas=document.createElement('canvas');leafCanvas.width=128;leafCanvas.height=128;const c=leafCanvas.getContext('2d');for(let i=0;i<100;i++){const angle=rnd()*6.28,r=rnd()*.47,x=64+Math.cos(angle)*r*128,y=64+Math.sin(angle)*r*128;c.fillStyle=['#57684b','#3e5139','#7b7950','#6c7051'][i%4];c.beginPath();c.ellipse(x,y,2+rnd()*5,1.5+rnd()*3,rnd()*6.28,0,6.28);c.fill();}const map=new T.CanvasTexture(leafCanvas);map.colorSpace=T.SRGBColorSpace;const foliage=new T.MeshStandardMaterial({map,alphaTest:.45,side:T.DoubleSide,roughness:1}),positions=[];
 for(const bed of WEST_GROWTH_BEDS)for(let i=0;i<bed.count;i++){const x=bed.x0+rnd()*(bed.x1-bed.x0),z=bed.z0+rnd()*(bed.z1-bed.z0),h=.28+rnd()*.43;if(w.solids.some(p=>Math.abs(x-p.x)<p.w/2+.28&&Math.abs(z-p.z)<p.d/2+.28))continue;positions.push({x,z,h,turn:rnd()*6.28});}
 const foliageMesh=new T.InstancedMesh(new T.PlaneGeometry(1,1),foliage,positions.length*3),dummy=new T.Object3D();positions.forEach((p,i)=>{for(let j=0;j<3;j++){dummy.position.set(p.x,.03+p.h/2,p.z);dummy.rotation.set(-.10,p.turn+j*Math.PI/3,0);dummy.scale.set(.60,p.h,1);dummy.updateMatrix();foliageMesh.setMatrixAt(i*3+j,dummy.matrix);}});foliageMesh.userData.decorative=true;foliageMesh.name='west-understory';foliageMesh.castShadow=false;g.add(foliageMesh);
 const leafMat=a.plain(0x655b3e);for(let i=0;i<65;i++){const x=-21.5+rnd()*10,z=-4+rnd()*22;if(w.solids.some(p=>Math.abs(x-p.x)<p.w/2+.05&&Math.abs(z-p.z)<p.d/2+.05))continue;const m=b(x,.025,z,.035+rnd()*.08,.004,.08+rnd()*.07,leafMat);m.rotation.y=rnd()*6.28;m.userData.decorative=true;}
 // A few maintenance details by the rear wall stay outside the loading lane.
 for(const x of[-1.7,8.7]){b(x,.10,19.78,.70,.16,.60,brick);b(x,.82,19.78,.62,1.30,.54,paint);w.solids.push({x,z:19.78,w:.74,d:.62,fixture:'rear-service-box'});for(let i=0;i<7;i++)b(x,.43+i*.10,20.06,.48,.025,.025,dark);}
 for(const root of[g,car,w.groundsDetail])root?.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh)o.userData.westExterior=true;});
 w.surroundingsInfo={westFixtures:SURROUNDING_FIXTURES.length,understoryClumps:positions.length,forms:['scored-maintenance-walk','parking-bay','payphone','meters','gutter-downpipes','condenser-fans','drain-grates','picnic-shelter','recycling-screen','water-stand','understory','rear-service-boxes'],freightApronUnchanged:true};
}
