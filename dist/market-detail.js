import * as T from './vendor/three.module.js';
import {createProduct,productAsset} from './product-models.js';
import {PRODUCTS} from './product-catalog.js';
// Footprints are shared by meshes, player collision and NPC navigation.
export const MARKET_FIXTURES=[
 {id:'freezer-coffee',x:-9.95,z:3.7,w:1.25,d:1.7,kind:'freezer'},
 {id:'freezer-meals',x:-.4,z:8.32,w:2.1,d:.8,kind:'freezer'},
 {id:'freezer-ice',x:3.2,z:8.32,w:2.1,d:.8,kind:'freezer'},
 {id:'stock-front',x:-.4,z:10.4,w:3.6,d:.9,kind:'rack'},
 {id:'stock-east',x:10.1,z:16.2,w:1,d:2.4,kind:'rack'},
 {id:'stock-center',x:-.2,z:14.5,w:2.3,d:.85,kind:'rack'}
];
export function installMarketDetail(w){
 const a=w.a,batches=new Map(),steel=a.get('metal'),cream=a.get('paint',0x9b9e89),dark=a.plain(0x2b352e),paper=a.get('paper',0xa89b78);
 const product=(id,x,y,z,yaw=0)=>{const m=createProduct(a,id);m.position.set(x,y,z);m.rotation.y=yaw;m.updateMatrix();if(!batches.has(id))batches.set(id,[]);batches.get(id).push(m.matrix.clone());};
 for(const f of MARKET_FIXTURES){
  w.solids.push({x:f.x,z:f.z,w:f.w+.04,d:f.d+.04,fixture:f.id});
  const root=new T.Group();root.name=f.id;root.position.set(f.x,0,f.z);w.scene.add(root);
  const b=(x,y,z,sx,sy,sz,m)=>w.box(x,y,z,sx,sy,sz,m,false,root);
  if(f.kind==='freezer'){
   // Recessed food well, two sliding lids, gaskets, handles, feet and vents.
   b(0,.39,0,f.w,.58,f.d,cream);for(const side of[-1,1]){b(side*(f.w/2-.035),.83,0,.07,.38,f.d,cream);b(0,.83,side*(f.d/2-.035),f.w,.38,.07,cream);}for(const side of[-1,1]){b(side*(f.w/2-.035),1.035,0,.07,.06,f.d,steel);b(0,1.035,side*(f.d/2-.035),f.w,.06,.07,steel);}
   b(0,.69,0,f.w-.12,.018,f.d-.12,dark);
   const vertical=f.d>f.w,glass=new T.MeshStandardMaterial({color:0x879583,transparent:true,opacity:.13,roughness:.65,depthWrite:false});
   for(const side of[-1,1]){const x=vertical?0:side*f.w*.23,z=vertical?side*f.d*.23:0;b(x,1.084,z,vertical?f.w-.16:f.w*.44,.015,vertical?f.d*.44:f.d-.16,glass);b(x,1.10,z,vertical?.38:.035,.035,vertical?.035:.28,steel);}
   for(const x of[-f.w*.36,f.w*.36])for(const z of[-f.d*.32,f.d*.32])b(x,.13,z,.12,.12,.12,dark);
   for(let i=0;i<6;i++)b(-f.w*.28+i*f.w*.10,.35,-f.d/2-.008,f.w*.065,.022,.014,dark);
   const ids=f.id==='freezer-coffee'?['milk','orangeJuice','appleJuice','yogurt']:['donuts','meatTin','tuna','bread'];
   for(let i=0;i<12;i++){const id=PRODUCTS[ids[i%4]]?ids[i%4]:'milk',p=PRODUCTS[id],x=f.x+((i%4)-1.5)*(f.w-.3)/4,z=f.z+(Math.floor(i/4)-1)*(f.d-.24)/3;product(id,x,.86,z,i%2*Math.PI);}
   const label=w.sign(f.id==='freezer-ice'?['ICE / FROZEN','KEEP CLOSED']:['CHILLED FOOD','LOCAL DAIRY'],f.x,.65,f.z-f.d/2-.025,Math.min(1.4,f.w*.83),Math.PI,{aspect:4,bg:'#4e6159',fg:'#ded4b7'});label.name=f.id+'-label';
  }else{
   for(const x of[-f.w/2+.03,f.w/2-.03])for(const z of[-f.d/2+.03,f.d/2-.03])b(x,1.34,z,.065,2.5,.065,steel);
   for(const y of[.30,1.06,1.82]){
    b(0,y,0,f.w,.055,f.d,steel);b(0,y+.04,f.d/2,.99*f.w,.075,.025,dark);
    const count=f.w>2?5:2;
    for(let i=0;i<(y>1.8?0:count);i++){const bw=(f.w-.2)/count*.83,x=-f.w/2+.1+(i+.5)*(f.w-.2)/count,h=.30+(i%3)*.07;b(x,y+.03+h/2,0,bw,h,f.d*.70,paper);b(x,y+.035+h,0,.04,.008,f.d*.70,a.plain(0x75684d));b(x,y+.15,f.d*.356,bw*.45,.12,.008,a.plain(0xd0c6a6));}
   }
   for(let i=0;i<6;i++){const id=['soup','beans','coffeeTin','chips','crackers','nutJar'][i];product(id,f.x-f.w*.34+i*f.w*.135,1.85+PRODUCTS[id].h/2,f.z-f.d*.25);}
  }
 }
 for(const[id,matrices]of batches){const asset=productAsset(a,id),mesh=new T.InstancedMesh(asset.geometry,asset.material,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.name='market-stock-'+id;mesh.userData.decorative=true;mesh.castShadow=false;mesh.receiveShadow=true;w.scene.add(mesh);}
}
