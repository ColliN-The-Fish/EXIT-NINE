import * as T from './vendor/three.module.js';
import {PRODUCTS} from './product-catalog.js';
const caches=new WeakMap(),rect={body:[.005,.005,.735,.99],cap:[.77,.77,.21,.21],metal:[.77,.52,.21,.21],dark:[.77,.27,.21,.21],paper:[.77,.02,.21,.21]};
function packaging(p){const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d'),[base,ink]=p.colors;c.fillStyle=base;c.fillRect(0,0,256,256);c.save();c.beginPath();c.rect(0,0,190,256);c.clip();
 const seed=[...p.id].reduce((s,ch)=>s+ch.charCodeAt(0),0);let n=seed;const rnd=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};
 c.fillStyle=ink;c.globalAlpha=.17;const layout=seed%5;if(layout===0){for(let y=-80;y<300;y+=30){c.save();c.translate(95,y);c.rotate(-.3);c.fillRect(-160,0,320,9);c.restore();}}else if(layout===1){for(let y=6;y<250;y+=12)c.fillRect(0,y,190,2);}else if(layout===2){c.fillRect(10,0,7,256);c.fillRect(173,0,7,256);}else if(layout===3){for(let y=0;y<256;y+=22)for(let x=0;x<190;x+=22)if((x+y)%44===0)c.fillRect(x,y,18,18);}else{c.beginPath();c.ellipse(94,133,81,121,0,0,Math.PI*2);c.fill();}c.globalAlpha=1;
 c.fillStyle=ink;c.fillRect(10,13,170,47);c.fillStyle=base;c.textAlign='center';const words=p.brand.split(' ');c.font='bold 16px Georgia';if(words.join(' ').length<14)c.fillText(p.brand,95,43,160);else{c.font='bold 14px Georgia';c.fillText(words.slice(0,-1).join(' '),95,33,160);c.fillText(words.at(-1),95,51,160);}c.strokeStyle=ink;c.lineWidth=2;c.strokeRect(14,70,162,112);
 c.save();c.translate(95,126);c.fillStyle=ink;c.strokeStyle=ink;c.lineWidth=3;const ellipse=(x,y,rx,ry)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.283);c.fill();},line=(pts)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();},ring=(x,y,r)=>{c.beginPath();c.arc(x,y,r,0,6.283);c.stroke();};
 switch(p.art){
 case'mountain':c.beginPath();c.moveTo(-63,30);c.lineTo(-16,-35);c.lineTo(10,5);c.lineTo(31,-19);c.lineTo(64,30);c.fill();c.strokeStyle=base;line([[-25,-10],[-16,-24],[-5,-9]]);break;
 case'coffee':c.fillRect(-29,-17,57,43);ellipse(0,26,36,5);c.beginPath();c.arc(30,0,17,-1.5,1.5);c.stroke();for(const x of [-18,0,18])line([[x,-25],[x-4,-35],[x+2,-47]]);break;
 case'pasture':ellipse(2,5,39,20);ellipse(39,-5,15,14);c.fillRect(-26,17,6,22);c.fillRect(20,16,6,23);c.strokeStyle=base;line([[-17,-7],[-24,8],[-5,13]]);line([[12,-9],[3,3],[17,8]]);break;
 case'burst':c.beginPath();for(let i=0;i<20;i++){const r=i%2?26:50,a=i*Math.PI/10;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.fill();c.fillStyle=base;ellipse(-10,3,13,13);ellipse(13,8,13,13);c.strokeStyle=base;line([[-10,-10],[0,-29],[13,-5]]);break;
 case'orange':ellipse(0,4,35,35);c.strokeStyle=base;c.lineWidth=2;for(let i=0;i<8;i++)line([[0,4],[Math.cos(i*.785)*30,4+Math.sin(i*.785)*30]]);c.fillStyle=base;ellipse(0,4,5,5);break;
 case'lemon':c.save();c.rotate(-.4);ellipse(0,3,42,25);c.fillStyle=base;ellipse(0,3,34,18);c.restore();line([[-53,37],[53,37]]);break;
 case'lightning':c.beginPath();for(const [x,y]of [[-4,-48],[-35,7],[-5,7],[-15,48],[38,-17],[9,-17],[24,-48]])c.lineTo(x,y);c.fill();break;
 case'waves':for(let j=0;j<5;j++){const pts=[];for(let x=-65;x<=65;x+=5)pts.push([x,Math.sin(x*.08+j)*7+j*14-29]);line(pts);}break;
 case'apple':ellipse(-15,5,28,32);ellipse(16,5,28,32);c.fillStyle=base;ellipse(0,-32,9,10);c.fillStyle=ink;ellipse(18,-39,19,6);break;
 case'ribbon':c.beginPath();for(const [x,y]of [[-62,-20],[62,-20],[45,1],[62,20],[-62,20],[-45,0]])c.lineTo(x,y);c.fill();c.fillStyle=base;c.font='bold 24px Georgia';c.fillText('1896',0,8);break;
 case'corn':for(let i=0;i<5;i++){const x=(i%3)*31-39,y=Math.floor(i/3)*34-15;c.beginPath();c.moveTo(x,y-18);c.lineTo(x-18,y+18);c.lineTo(x+18,y+18);c.fill();}break;
 case'loaf':c.beginPath();c.roundRect(-53,-15,106,49,22);c.fill();c.strokeStyle=base;for(let x=-28;x<40;x+=23)line([[x,-8],[x-10,17]]);break;
 case'crackers':for(const x of [-27,27])for(const y of [-24,24]){c.fillRect(x-19,y-19,38,38);c.fillStyle=base;for(const dx of [-8,8])for(const dy of [-8,8])ellipse(x+dx,y+dy,2,2);c.fillStyle=ink;}break;
 case'cookies':for(const [x,y]of [[-26,-9],[24,13]]){ellipse(x,y,29,29);c.fillStyle=base;for(let i=0;i<8;i++)ellipse(x+Math.cos(i*2.4)*18,y+Math.sin(i*2.4)*18,3,3);c.fillStyle=ink;}break;
 case'chocolate':for(let x=-50;x<60;x+=34)for(let y=-32;y<30;y+=32)c.fillRect(x,y,29,27);break;
 case'peanuts':for(let i=0;i<4;i++){c.save();c.translate((i%2)*51-25,Math.floor(i/2)*41-23);c.rotate(i*.6);ellipse(0,-8,13,19);ellipse(0,13,14,18);c.restore();}break;
 case'pretzel':c.lineWidth=8;ring(-19,-6,21);ring(19,-6,21);line([[-32,8],[0,37],[32,8]]);break;
 case'popcorn':for(let i=0;i<9;i++){const x=(i%3)*33-33,y=Math.floor(i/3)*24-27;ellipse(x,y,16,13);ellipse(x-8,y-8,8,8);ellipse(x+7,y-8,8,8);}break;
 case'donut':ellipse(0,0,43,34);c.fillStyle=base;ellipse(0,0,14,11);c.strokeStyle=base;for(let i=0;i<15;i++){const a=i*2.4;line([[Math.cos(a)*27,Math.sin(a)*23],[Math.cos(a)*27+4,Math.sin(a)*23-3]]);}break;
 case'grain':for(let i=0;i<45;i++){c.save();c.translate((rnd()-.5)*110,(rnd()-.5)*65);c.rotate(rnd()*3);ellipse(0,0,6,3);c.restore();}break;
 case'soup':c.beginPath();c.arc(0,-5,46,0,Math.PI);c.fill();ellipse(0,-5,46,9);c.fillStyle=base;ellipse(-13,-5,7,4);ellipse(14,-6,6,4);for(const x of [-19,0,19])line([[x,-21],[x-4,-33],[x+3,-45]]);break;
 case'beans':for(let i=0;i<16;i++){c.save();c.translate((i%4)*27-40,Math.floor(i/4)*20-31);c.rotate(i*.6);ellipse(0,0,12,7);c.restore();}break;
 case'fish':ellipse(0,1,39,17);c.beginPath();c.moveTo(-32,0);c.lineTo(-61,-23);c.lineTo(-61,23);c.fill();c.fillStyle=base;ellipse(24,-4,3,3);break;
 case'meat':c.beginPath();c.roundRect(-45,-24,90,55,15);c.fill();c.strokeStyle=base;line([[-31,-10],[29,17]]);line([[-31,3],[13,23]]);break;
 case'tomato':ellipse(0,6,37,31);c.fillStyle=base;c.beginPath();for(let i=0;i<10;i++){const r=i%2?7:22,a=i*Math.PI/5;c.lineTo(Math.cos(a)*r,-19+Math.sin(a)*r);}c.fill();break;
 case'olive':line([[-47,35],[45,-35]]);for(let i=0;i<5;i++){ellipse(-30+i*15,18-i*14,12,5);ellipse(-17+i*15,19-i*14,6,10);}break;
 case'noodles':for(let j=0;j<6;j++){const pts=[];for(let x=-35;x<=35;x+=6)pts.push([x,Math.sin(x*.15+j)*6+j*6-24]);line(pts);}line([[-52,-15],[-29,35],[30,35],[52,-15]]);break;
 case'tea':for(const sign of [-1,1]){c.save();c.rotate(sign*.5);ellipse(sign*17,-2,15,39);c.restore();}c.strokeStyle=base;line([[0,33],[0,-25]]);break;
 case'oats':for(const x of [-25,0,25]){line([[x,39],[x,-41]]);for(let y=-31;y<24;y+=13){ellipse(x-7,y,8,4);ellipse(x+7,y+5,8,4);}}break;
 case'batteries':for(const x of [-22,22]){c.fillRect(x-12,-35,24,70);c.fillRect(x-6,-41,12,7);c.fillStyle=base;c.font='bold 20px sans-serif';c.fillText('+',x,-10);c.fillText('AA',x,20);c.fillStyle=ink;}break;
 }c.restore();c.fillStyle=ink;c.font='bold 12px monospace';c.fillText(p.id.replace(/([A-Z])/g,' $1').toUpperCase(),95,204,164);c.font='9px monospace';c.fillText('NET '+Math.round(p.h*1800)+' / EXIT NINE',95,221,165);c.fillRect(16,231,93,17);c.fillStyle=base;for(let i=0;i<32;i++)if((seed+i*13)%7<3)c.fillRect(18+i*2.75,232,1,15);c.fillStyle=ink;c.font='bold 12px monospace';c.fillText('USA',148,244);for(let i=0;i<1500;i++){c.globalAlpha=.03;c.fillStyle=i%2?'#fff':'#000';c.fillRect(rnd()*190,rnd()*256,1,1);}c.globalAlpha=1;c.restore();
 const swatches=[['cap',base],['metal','#a8a68b'],['dark','#373c34'],['paper',ink]];for(const [key,color]of swatches){const [x,y,w,h]=rect[key];c.fillStyle=color;c.fillRect(x*256,(1-y-h)*256,w*256,h*256);if(key==='metal'){c.strokeStyle='#6d756d';for(let n=0;n<8;n++)c.strokeRect(x*256+4+n*2,(1-y-h)*256+4+n*2,w*256-8-n*4,h*256-8-n*4);}}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.magFilter=T.NearestFilter;texture.minFilter=T.LinearMipmapLinearFilter;return texture;}
function loftBox(rings){const outline=[[-.72,-1],[.72,-1],[1,-.72],[1,.72],[.72,1],[-.72,1],[-1,.72],[-1,-.72]],v=[],uv=[],idx=[];for(let r=0;r<rings.length;r++){const[y,w,d]=rings[r];for(let k=0;k<=8;k++){const[x,z]=outline[k%8];v.push(x*w/2,y,z*d/2);uv.push(k/8,y/rings.at(-1)[0]);if(r<rings.length-1&&k<8){const b=r*9+k;idx.push(b,b+9,b+1,b+1,b+9,b+10);}}}for(const r of [0,rings.length-1]){const base=r*9,center=v.length/3;v.push(0,rings[r][0],0);uv.push(.5,r?1:0);for(let i=0;i<8;i++)idx.push(center,base+(r?i:i+1),base+(r?i+1:i));}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
function geometry(p){const parts=[],B=(w,h,d)=>new T.BoxGeometry(w,h,d),C=(rt,rb,h,n=12)=>new T.CylinderGeometry(rt,rb,h,n),L=profile=>new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),12),add=(geo,x=0,y=0,z=0,zone='body',sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{geo.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz)));const tex=geo.attributes.uv,q=rect[zone];for(let i=0;i<tex.count;i++)tex.setXY(i,q[0]+tex.getX(i)*q[2],q[1]+tex.getY(i)*q[3]);parts.push(geo.toNonIndexed());geo.dispose();},lid=(r,y,h=.012,zone='metal',n=12)=>add(C(r,r,h,n),0,y,0,zone),cap=(r,y,h=.025)=>lid(r,y,h,'cap'),h=p.h,w=p.w,d=p.d;
 switch(p.shape){
 case'waterBottle':add(L([[0,0],[.044,0],[.048,.018],[.046,.19],[.041,.215],[.025,.25],[.022,.263],[0,.263]]));cap(.025,.274,.022);for(const y of [.05,.075,.10])lid(.048,y,.004,'cap');break;
 case'coffeeCup':add(C(.043,.034,h-.015),0,(h-.015)/2);lid(.045,h-.010,.020,'dark');add(C(.009,.009,.003,8),.018,h+.001,0,'paper');break;
 case'gableCarton':add(B(w,h-.045,d),0,(h-.045)/2);add(loftBox([[0,w,d],[.037,.009,d]]),0,h-.045);add(B(.012,.008,d),0,h-.004,0,'paper');break;
 case'sodaCan':add(L([[0,0],[.041,0],[.047,.014],[.047,h-.014],[.041,h],[0,h]]));lid(.042,h-.002,.006);lid(.044,.004,.008);add(new T.TorusGeometry(.011,.003,4,8),.007,h+.002,0,'dark',1,1,1,Math.PI/2);break;
 case'juiceJug':add(L([[0,0],[.057,0],[.065,.025],[.060,.16],[.043,.18],[.028,.20],[.026,.22],[0,.22]]),-.012);cap(.028,.228,.024);add(new T.TorusGeometry(.039,.008,6,10),.055,.143,0,'cap',1,.95,1,0,Math.PI/2);break;
 case'teaBottle':add(L([[0,0],[.034,0],[.040,.02],[.038,.17],[.027,.195],[.017,.265],[.017,.287],[0,.287]]));lid(.02,.297,.016,'metal');break;
 case'energyCan':add(L([[0,0],[.032,0],[.036,.010],[.036,h-.01],[.030,h],[0,h]]));lid(.031,h,.004);lid(.033,.003,.006);add(new T.TorusGeometry(.008,.0025,4,8),0,h+.004,0,'dark',1,1,1,Math.PI/2);break;
 case'waistBottle':add(L([[0,0],[.043,0],[.051,.035],[.049,.075],[.035,.12],[.035,.15],[.052,.19],[.047,.22],[.027,.24],[0,.24]]));for(const y of [.04,.065,.18,.205])lid(y<.1?.052:.053,y,.007,'cap');cap(.030,.255,.03);break;
 case'appleFlask':add(loftBox([[0,w*.78,d*.8],[.025,w,d],[.16,w,d],[.19,.048,.05],[.205,.04,.04]]));cap(.027,.218,.025);add(new T.TorusGeometry(.032,.007,6,10),.061,.14,0,'dark',1,1,1,0,Math.PI/2);break;
 case'stubbyBottle':add(L([[0,0],[.045,0],[.052,.015],[.052,.13],[.046,.16],[.024,.19],[.022,.221],[0,.221]]));lid(.026,.227,.014,'metal',16);break;
 case'pillowBag':add(loftBox([[0,w*.85,.01],[.018,w*.97,d*.45],[.07,w,d],[.17,w*.97,d],[h-.02,w*.89,d*.4],[h,w*.85,.008]]));add(B(w*.9,.009,.012),0,h-.006,0,'paper');add(B(w*.9,.009,.012),0,.006,0,'paper');break;
 case'breadBag':add(loftBox([[0,w*.8,d*.8],[.025,w,d],[.10,w,d],[.15,w*.8,d*.9],[.18,w*.26,d*.25],[h,w*.35,.012]]));add(B(w*.24,.011,.025),0,.181,0,'dark');break;
 case'crackerBox':add(B(w,h-.008,d),0,(h-.008)/2);add(B(w+.002,.008,d*.85),0,h-.004,d*.03,'paper');add(B(.025,.003,.02),.025,h+.001,.012,'cap');break;
 case'cookieTin':add(C(.080,.075,.09,16),0,.045);lid(.083,.098,.014,'cap',16);add(new T.TorusGeometry(.078,.0025,4,16),0,.103,0,'metal',1,1,1,Math.PI/2);break;
 case'chocolateBar':add(B(w,h,d*.75),0,h/2);for(let x=0;x<2;x++)for(let y=0;y<4;y++)add(B(w*.43,h*.20,d*.28),(x-.5)*w*.47,h*.13+y*h*.235,d*.48,'dark');break;
 case'foldedPouch':add(loftBox([[0,w*.8,d*.8],[.025,w,d],[.13,w*.92,d],[.165,w*.82,.016],[h,w*.83,.009]]));add(B(w*.86,.014,.02),0,h-.012,0,'paper');break;
 case'pretzelTub':add(C(.065,.054,h-.02,12),0,(h-.02)/2);lid(.068,h-.01,.02,'cap');add(new T.TorusGeometry(.060,.002,4,12),0,.03,0,'paper',1,1,1,Math.PI/2);break;
 case'popcornCarton':add(loftBox([[0,w*.65,d*.72],[h-.012,w,d],[h,w,.008]]));add(B(w,.015,.018),0,h-.007,0,'paper');break;
 case'donutTray':add(B(w,.028,d),0,.014,0,'paper');add(loftBox([[0,w,d],[.065,w*.97,d*.96],[.084,w*.84,d*.8]]),0,.028);for(const x of [-w*.22,w*.22])add(new T.TorusGeometry(.027,.009,6,12),x,.101,0,'cap',1,1,1,Math.PI/2);break;
 case'granolaWrap':add(loftBox([[0,w,.006],[.015,w*.95,d],[h-.015,w*.95,d],[h,w,.006]]));for(const y of [.005,h-.005])add(B(w*1.05,.010,.012),0,y,0,'paper');break;
 case'soupCan':add(C(.054,.054,h-.008),0,h/2);for(const y of [.006,h-.004])lid(.056,y,.009);add(new T.TorusGeometry(.012,.003,4,10),.018,h+.003,0,'dark',1,1,1,Math.PI/2);break;
 case'beanCan':add(C(.048,.048,h-.01,16),0,h/2);for(const y of [.006,h-.004])lid(.050,y,.01);for(const y of [.045,.065,h-.06,h-.04])lid(.049,y,.003,'dark',16);break;
 case'tunaOval':add(C(.075,.073,h-.012,16),0,h/2,0,'body',1,1,.63);add(C(.078,.078,.012,16),0,h-.006,0,'metal',1,1,.65);add(new T.TorusGeometry(.013,.003,4,10),.030,h+.002,0,'dark',1,1,1,Math.PI/2);break;
 case'meatTin':add(loftBox([[0,w*.9,d*.92],[.012,w,d],[h-.01,w,d],[h,w*.92,d*.92]]));add(B(w*.92,.006,d*.93),0,h,0,'metal');add(new T.TorusGeometry(.014,.003,4,10),.028,h+.006,0,'dark',1,1,.8,Math.PI/2);break;
 case'sauceJar':add(L([[0,0],[.047,0],[.054,.017],[.054,.16],[.045,.185],[.043,.212],[0,.212]]));lid(.049,.223,.022,'cap',16);break;
 case'oilTin':add(B(w,h-.025,d),0,(h-.025)/2);add(B(w+.002,.008,d+.002),0,h-.025,0,'metal');cap(.017,h-.012,.022);add(new T.TorusGeometry(.022,.004,4,10),-.025,h-.007,0,'metal',1,.5,1,0,0,Math.PI/2);break;
 case'noodleBowl':add(C(.078,.052,h-.01,12),0,(h-.01)/2);lid(.080,h-.005,.01,'paper');add(B(.023,.002,.026),.065,h+.001,0,'cap');break;
 case'hexTeaTin':add(C(.061,.061,h-.012,6),0,h/2);lid(.064,h-.005,.01,'cap',6);lid(.063,.006,.01,'metal',6);break;
 case'oatDrum':add(C(.065,.065,h-.015,16),0,(h-.015)/2);lid(.068,h-.008,.016,'paper',16);add(new T.TorusGeometry(.061,.003,4,12),0,.014,0,'metal',1,1,1,Math.PI/2);break;
 case'spoutPouch':add(loftBox([[0,w*.65,d*.7],[h*.1,w,d],[h*.7,w*.93,d*.8],[h*.87,w*.55,d*.45]]),0,0,0);add(C(.015,.015,.035,8),.025,h*.88,0,'cap');lid(.019,h-.009,.018,'cap');break;
 case'glassBottle':add(L([[0,0],[.035,0],[.038,.02],[.037,.16],[.022,.20],[.015,.25],[.016,.28],[0,.28]]));cap(.018,.286,.008);break;
 case'travelFlask':add(C(.041,.045,h-.025,12),0,(h-.025)/2);cap(.048,h-.018,.036);add(new T.TorusGeometry(.029,.008,5,8),.048,.19,0,'dark',1,1,1,0,Math.PI/2);break;
 case'candyRoll':add(C(.020,.020,h-.018,10),0,h/2);for(const y of[.008,h-.008])add(new T.SphereGeometry(.025,6,4),0,y,0,'paper',1,.35,1);break;
 case'crackerSleeve':add(C(.042,.041,h-.018,10),0,h/2);for(const y of[.007,h-.007])lid(.044,y,.014,'paper',10);break;
 case'nutJar':add(L([[0,0],[.05,0],[.06,.025],[.06,.13],[.052,.15],[0,.15]]));cap(.059,.165,.026);break;
 case'coffeeTin':add(loftBox([[0,w*.9,d*.9],[.02,w,d],[h-.01,w,d]]));add(B(w+.005,.015,d+.005),0,h-.008,0,'metal');break;
 case'tissueBox':add(B(w,h,d),0,h/2);add(B(.08,.004,.035),0,h+.002,0,'dark');add(B(.055,.04,.002),.01,h+.023,0,'paper',1,1,1,0,0,.25);break;
 case'bulbPack':add(B(w,h,.025),0,h/2,-.025);add(new T.SphereGeometry(.035,10,6),0,.115,0,'paper',1,1.15,1);add(C(.018,.021,.035,10),0,.065,0,'metal');add(B(w,.03,d),0,.015,0,'cap');break;
 case'batteryBlister':add(B(w,h,.004),0,h/2,-.014);for(const x of [-.021,.021]){add(C(.014,.014,.115,10),x,.070,.005,'metal');add(C(.0145,.0145,.033,10),x,.115,.005,'dark');add(C(.006,.006,.004,8),x,.134,.005,'metal');}add(B(.035,.011,.004),0,h-.009,-.010,'dark');break;
 }
 const attrs={position:[],normal:[],uv:[]};for(const g of parts){for(const key of Object.keys(attrs))attrs[key].push(...g.attributes[key].array);g.dispose();}const g=new T.BufferGeometry();for(const [key,arr]of Object.entries(attrs))g.setAttribute(key,new T.Float32BufferAttribute(arr,key==='uv'?2:3));g.translate(0,-p.h/2,0);g.computeBoundingBox();g.userData.product=p.id;g.userData.shape=p.shape;return g;}
export function productAsset(art,id){let cache=caches.get(art);if(!cache){cache=new Map();caches.set(art,cache);}if(!cache.has(id)){const p=PRODUCTS[id];if(!p)throw Error('Unknown product '+id);const map=packaging(p),mat=new T.MeshStandardMaterial({map,roughness:.86,metalness:['sodaCan','energyCan','soupCan','beanCan','tunaOval','meatTin','oilTin','hexTeaTin','cookieTin'].includes(p.shape)?.18:0});cache.set(id,{geometry:geometry(p),material:mat,texture:map,product:p});}return cache.get(id);}
export function createProduct(art,id){const asset=productAsset(art,id),mesh=new T.Mesh(asset.geometry,asset.material);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.product=id;mesh.userData.productShared=true;return mesh;}
export function removeProduct(mesh){if(!mesh)return;if(!mesh.userData.productShared){mesh.geometry?.dispose();mesh.material?.dispose();}mesh.removeFromParent();}
