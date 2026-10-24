import * as T from './vendor/three.module.js';
import {categoryProducts,productSlot} from './product-catalog.js';
import {productAsset} from './product-models.js';
export function buildShelfStock(art,parent,shelf,x){
 const products=categoryProducts(shelf);
 for(let half=0;half<2;half++){const chunk=new T.Group();parent.add(chunk);const bins=new Map();
  // Top-row, left-facing stock comes first, so early/low stock still has an
  // accessible copy of each product. Lower rows and rear facings fill later.
  for(const row of [2,1,0])for(const side of [-1,1])for(const depth of [0,1])for(let n=0;n<12;n++){const p=products[(row*3+n+half*12)%products.length],slot={key:`${shelf}:${half}:${row}:${n}:${side}:${depth}`,x:x+side*(depth?.23:.43),y:[.2775,.7975,1.3175][row],z:.58+half*2.6+n*.205,side};if(!bins.has(p.id))bins.set(p.id,[]);bins.get(p.id).push(slot);}
  for(const[id,slots]of bins){const asset=productAsset(art,id),mesh=new T.InstancedMesh(asset.geometry,asset.material,slots.length);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.target={id:'shelf',key:shelf};mesh.userData.product=id;mesh.userData.slots=slots;mesh.userData.baseCount=slots.length;mesh.userData.matrices=[];for(let i=0;i<slots.length;i++){const q=slots[i],matrix=new T.Matrix4().compose(new T.Vector3(q.x,q.y+asset.product.h/2,q.z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),q.side*Math.PI/2),new T.Vector3(1,1,1));mesh.setMatrixAt(i,matrix);mesh.userData.matrices.push(matrix);}chunk.add(mesh);}
 }
}
export function updateShelfStock(w,s){
 const held=new Set(s.removedShelfSlots||[]);for(const a of s.actors||[]){if(!a.shoppingPose)continue;const u=(a.browseTime||0)/(a.shoppingDuration||6);if(u>=.445){const c=s.cast?.find(c=>c.id===a.id),id=c?.basket?.[a.browseIndex];if(id)held.add((a.shoppingTarget||productSlot(id)).key);}}
 const stamp=JSON.stringify([s.crates.map(c=>c.place),s.removedShelfSlots,[...held].sort()]);if(w.stockStamp===stamp)return;w.stockStamp=stamp;
 w.stock.forEach((g,shelf)=>{const filled=s.crates.filter(c=>c.place==='shelf'&&c.shelf===shelf).length;g.children.forEach((chunk,half)=>{chunk.visible=!!s.campaign||half<filled;for(const mesh of chunk.children){const base=mesh.userData.baseCount,count=Math.max(0,Math.min(base,Math.ceil(base*(filled>=2?1:filled===1?.80:.60))));mesh.count=count;for(let i=0;i<count;i++){const q=mesh.userData.slots[i],matrix=held.has(q.key)?new T.Matrix4().makeScale(0,0,0):mesh.userData.matrices[i];mesh.setMatrixAt(i,matrix);}mesh.instanceMatrix.needsUpdate=true;}});});
}
