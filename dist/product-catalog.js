import {displaySlots,spinnerBusy} from './shop-displays.js';
// Thirty-nine original products. Prices are integer cents; each department
// has thirteen silhouettes with a separately composed branded package.
export const CATALOG=[
 {id:'water',name:'松林水',brand:'PINE SPRING',price:150,shelf:0,shape:'waterBottle',h:.285,w:.096,d:.096,r:.046,grip:'round',colors:['#688e94','#d6ddbf'],art:'mountain'},
 {id:'coffee',name:'热咖啡',brand:'NIGHT ROAST',price:120,shelf:0,shape:'coffeeCup',h:.155,w:.09,d:.09,r:.044,grip:'round',colors:['#64503b','#dfcba0'],art:'coffee'},
 {id:'milk',name:'牛奶',brand:'DAIRY HILL',price:320,shelf:0,shape:'gableCarton',h:.265,w:.105,d:.09,grip:'box',colors:['#b9c5b1','#35596a'],art:'pasture'},
 {id:'cola',name:'樱桃可乐',brand:'CHERRY COLA',price:175,shelf:0,shape:'sodaCan',h:.205,w:.095,d:.095,r:.047,grip:'round',colors:['#9d3931','#dfc6a1'],art:'burst'},
 {id:'orangeJuice',name:'橙汁',brand:'GROVE ORANGE',price:280,shelf:0,shape:'juiceJug',h:.24,w:.135,d:.105,r:.057,grip:'round',colors:['#cd8a37','#e6c75e'],art:'orange'},
 {id:'lemonTea',name:'柠檬红茶',brand:'CEDAR TEA',price:190,shelf:0,shape:'teaBottle',h:.305,w:.082,d:.082,r:.040,grip:'round',colors:['#6d6740','#d7bf61'],art:'lemon'},
 {id:'energyDrink',name:'能量饮料',brand:'VOLT 96',price:360,shelf:0,shape:'energyCan',h:.265,w:.073,d:.073,r:.036,grip:'round',colors:['#283c44','#bbbc55'],art:'lightning'},
 {id:'sportsDrink',name:'电解质饮料',brand:'RIVER RUN',price:260,shelf:0,shape:'waistBottle',h:.27,w:.11,d:.10,r:.049,grip:'round',colors:['#447e7d','#c7c6aa'],art:'waves'},
 {id:'appleJuice',name:'苹果汁',brand:'ORCHARD PRESS',price:235,shelf:0,shape:'appleFlask',h:.23,w:.13,d:.085,r:.053,grip:'round',colors:['#6e7c45','#d0ba8a'],art:'apple'},
 {id:'creamSoda',name:'奶油汽水',brand:'OLD TRAIL',price:210,shelf:0,shape:'stubbyBottle',h:.235,w:.107,d:.107,r:.052,grip:'round',colors:['#6e4b31','#d9b974'],art:'ribbon'},
 {id:'chips',name:'玉米脆片',brand:'CORN FIELD',price:240,shelf:1,shape:'pillowBag',h:.24,w:.16,d:.075,grip:'box',colors:['#b27330','#e2bd72'],art:'corn'},
 {id:'bread',name:'黑麦面包',brand:'HALE BAKERY',price:280,shelf:1,shape:'breadBag',h:.205,w:.175,d:.105,grip:'box',colors:['#a48a58','#ddd0a6'],art:'loaf'},
 {id:'crackers',name:'咸味饼干',brand:'SALT RIDGE',price:260,shelf:1,shape:'crackerBox',h:.255,w:.105,d:.064,grip:'box',colors:['#b6a777','#6f503c'],art:'crackers'},
 {id:'cookieTin',name:'黄油曲奇',brand:'BUTTER HOUSE',price:410,shelf:1,shape:'cookieTin',h:.105,w:.165,d:.165,r:.080,grip:'round',colors:['#405d76','#d1bc8c'],art:'cookies'},
 {id:'chocolate',name:'黑巧克力',brand:'NORTH DARK',price:190,shelf:1,shape:'chocolateBar',h:.16,w:.075,d:.027,grip:'pinch',colors:['#503b35','#b79b64'],art:'chocolate'},
 {id:'peanuts',name:'烤花生',brand:'ROADSIDE NUTS',price:180,shelf:1,shape:'foldedPouch',h:.19,w:.12,d:.07,grip:'box',colors:['#9b5138','#d2ae75'],art:'peanuts'},
 {id:'pretzels',name:'蝴蝶脆饼',brand:'TWIST & SALT',price:235,shelf:1,shape:'pretzelTub',h:.185,w:.135,d:.135,r:.066,grip:'round',colors:['#776342','#ceb57a'],art:'pretzel'},
 {id:'popcorn',name:'焦糖爆米花',brand:'PICTURE POP',price:185,shelf:1,shape:'popcornCarton',h:.205,w:.145,d:.09,grip:'box',colors:['#8e3d35','#dfcaa0'],art:'popcorn'},
 {id:'donuts',name:'甜甜圈',brand:'DAWN RINGS',price:380,shelf:1,shape:'donutTray',h:.115,w:.185,d:.14,grip:'box',colors:['#9e7870','#e0c8a5'],art:'donut'},
 {id:'granola',name:'燕麦能量棒',brand:'TIMBER OATS',price:225,shelf:1,shape:'granolaWrap',h:.18,w:.067,d:.040,grip:'pinch',colors:['#5f6e42','#ccb78c'],art:'grain'},
 {id:'soup',name:'蔬菜罐头',brand:'MEADOW SOUP',price:330,shelf:2,shape:'soupCan',h:.205,w:.112,d:.112,r:.055,grip:'round',colors:['#7d844f','#d0c39e'],art:'soup'},
 {id:'beans',name:'焗豆罐头',brand:'CAMP BEANS',price:285,shelf:2,shape:'beanCan',h:.26,w:.10,d:.10,r:.049,grip:'round',colors:['#8c4b36','#d7b786'],art:'beans'},
 {id:'tuna',name:'金枪鱼罐头',brand:'BLUE COAST',price:310,shelf:2,shape:'tunaOval',h:.085,w:.16,d:.10,grip:'box',colors:['#3b6a7b','#d3c7a5'],art:'fish'},
 {id:'meatTin',name:'午餐肉罐头',brand:'COUNTY MEATS',price:395,shelf:2,shape:'meatTin',h:.13,w:.14,d:.09,grip:'box',colors:['#9c6f67','#c7b58c'],art:'meat'},
 {id:'pastaSauce',name:'番茄意面酱',brand:'VALLEY TOMATO',price:435,shelf:2,shape:'sauceJar',h:.235,w:.11,d:.11,r:.054,grip:'round',colors:['#9b4637','#b8b780'],art:'tomato'},
 {id:'oliveOil',name:'橄榄油',brand:'OLIVE GROVE',price:740,shelf:2,shape:'oilTin',h:.29,w:.105,d:.077,grip:'box',colors:['#526047','#c6b67d'],art:'olive'},
 {id:'noodleCup',name:'杯面',brand:'LAST STOP',price:240,shelf:2,shape:'noodleBowl',h:.135,w:.16,d:.16,r:.076,grip:'round',colors:['#b99b55','#7d3e2c'],art:'noodles'},
 {id:'teaTin',name:'红茶叶',brand:'BRIAR LEAF',price:620,shelf:2,shape:'hexTeaTin',h:.195,w:.125,d:.11,grip:'box',colors:['#4f6256','#baa66f'],art:'tea'},
 {id:'oats',name:'早餐燕麦',brand:'MILL OATS',price:470,shelf:2,shape:'oatDrum',h:.285,w:.135,d:.135,r:.066,grip:'round',colors:['#b1a080','#655340'],art:'oats'},
 {id:'batteries',name:'电池',brand:'NORTH CELL',price:650,shelf:2,shape:'batteryBlister',h:.17,w:.095,d:.035,grip:'pinch',colors:['#a27e42','#333f42'],art:'batteries'},
 {id:'juicePouch',name:'果汁吸嘴袋',brand:'TRAIL SIP',price:195,shelf:0,shape:'spoutPouch',h:.21,w:.13,d:.065,grip:'box',colors:['#9b623c','#d5bc72'],art:'orange'},
 {id:'glassSoda',name:'玻璃瓶苏打',brand:'NORTH FIZZ',price:230,shelf:0,shape:'glassBottle',h:.29,w:.076,d:.076,r:.038,grip:'round',colors:['#6c8972','#d9c38a'],art:'waves'},
 {id:'thermos',name:'旅行保温杯',brand:'ROAD KEEPER',price:890,shelf:0,shape:'travelFlask',h:.29,w:.10,d:.09,r:.045,grip:'round',colors:['#756653','#c8c0a2'],art:'mountain'},
 {id:'candyRoll',name:'水果糖卷',brand:'BELL SWEETS',price:125,shelf:1,shape:'candyRoll',h:.17,w:.045,d:.045,r:.023,grip:'round',colors:['#9b615e','#cdb66b'],art:'ribbon'},
 {id:'shortbread',name:'奶油饼干筒',brand:'MERCER BAKERY',price:275,shelf:1,shape:'crackerSleeve',h:.22,w:.085,d:.085,r:.043,grip:'round',colors:['#b99d66','#d8ceb3'],art:'cookies'},
 {id:'nutJar',name:'混合坚果罐',brand:'FOREST PICK',price:460,shelf:1,shape:'nutJar',h:.18,w:.12,d:.12,r:.06,grip:'round',colors:['#8b6f4f','#c3a564'],art:'peanuts'},
 {id:'coffeeTin',name:'研磨咖啡罐',brand:'COUNTY ROAST',price:530,shelf:2,shape:'coffeeTin',h:.20,w:.13,d:.09,grip:'box',colors:['#654a39','#c1b58e'],art:'coffee'},
 {id:'tissues',name:'抽纸盒',brand:'SOFT MILE',price:290,shelf:2,shape:'tissueBox',h:.095,w:.18,d:.11,grip:'box',colors:['#76908b','#c8c8ad'],art:'pasture'},
 {id:'bulb',name:'备用灯泡',brand:'NINE ELECTRIC',price:420,shelf:2,shape:'bulbPack',h:.18,w:.105,d:.075,grip:'box',colors:['#ad964c','#c6c2a4'],art:'lightning'}
];
export const PRODUCTS=Object.fromEntries(CATALOG.map(p=>[p.id,p]));
export const CATEGORY_NAMES=['饮料','零食','罐头与杂货'];
export const categoryProducts=shelf=>CATALOG.filter(p=>p.shelf===shelf);
export function productSlots(id){const p=PRODUCTS[id],i=categoryProducts(p.shelf).findIndex(v=>v.id===id),slots=[];for(let col=0;col<24;col++)if((6+col)%categoryProducts(p.shelf).length===i)for(let depth=0;depth<2;depth++){const half=Math.floor(col/12),n=col%12;slots.push({id,shelf:p.shelf,half,row:2,column:n,depth,key:`${p.shelf}:${half}:2:${n}:-1:${depth}`,x:[-2,2,6][p.shelf]-(depth?.23:.43),y:1.3175+p.h/2,z:.58+half*2.6+n*.205});}return slots;}
export function productSlot(id,ordinal=0){const slots=productSlots(id);return slots[ordinal%slots.length];}
export function selectProductSlot(s,id,actorId){const unavailable=new Set(s.removedShelfSlots||[]);for(const a of s.actors||[])if(a.id!==actorId&&a.mode==='browse'&&a.shoppingTarget)unavailable.add(a.shoppingTarget.key);const hash=[...actorId+id].reduce((n,c)=>n+c.charCodeAt(0),0)+(s.night||1),raw=displaySlots(id,s).filter(p=>!spinnerBusy(s,p.fixture)),offset=raw.length?(Math.floor(hash/3)+(s.night||1))%raw.length:0,extra=[...raw.slice(offset),...raw.slice(0,offset)],prefer=hash%3===0;const options=prefer?[...extra,...productSlots(id)]:[...productSlots(id),...extra];return options.sort((a,b)=>(a.depth||0)-(b.depth||0)).find(p=>!unavailable.has(p.key))||productSlot(id);}
export function shoppingApproach(id,c,order=1,slot=productSlot(id)){const scale=parseInt(c?.height||181.5)/181.5*1.05,width=({june:1.08,wade:.98,nora:.91,rowan:1.16,leon:1.11,milo:.91})[c?.id]||1,sign=c?.appearance==='cane'?-1:order%2?1:-1,angle=slot.yaw??Math.PI/2,lateral=sign*(.19*width-.03)*scale;return{x:slot.x-Math.sin(angle)*.56-Math.cos(angle)*lateral,z:slot.z-Math.cos(angle)*.56+Math.sin(angle)*lateral};}
