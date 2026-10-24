import {damagePlayer,tickCabinetSearch} from './survival.js';
import {freightReady} from './freight-flow.js';
import {storyAvailable} from './story-flow.js';
import {SITE} from './site-layout.js';
import {counterPlayer,CHECKOUT_LINE} from './counter-layout.js';
import {person,liveActors,openConversationModes} from './night-data.js';
import {SCAN_SECONDS,SCAN_COOLDOWN,scanReading,scannerReady} from './inspection.js';
import {CUSTOMERS,DOORS,SHELVES,SPOTS,SPILLS} from './data.js';
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const clone=v=>JSON.parse(JSON.stringify(v));
export function fresh(){return {schema:1,scannerOwned:false,securityOpen:false,binocularOwned:false,doorKeyOwned:false,scannerActive:false,scanProgress:0,scanTargetId:null,scanCooldown:0,scans:{},time:0,phase:'briefing',paused:true,player:counterPlayer({x:-8.3,z:-.45,yaw:.918,pitch:-.273}),doors:Object.fromEntries(Object.keys(DOORS).map(k=>[k,!['front','loading','rear'].includes(k)])),briefed:false,manual:false,torchOwned:false,torch:false,gunOwned:false,gunDrawn:false,ammo:8,ammoCapacity:8,carry:null,manifest:false,crates:Array.from({length:6},(_,i)=>({id:i,shelf:i%3,x:-6+(i%2)*.75-.35,z:21.5+Math.floor(i/2)*.90,place:'truck',received:false})),clean:[],queue:0,nextIn:0,actor:null,departing:null,bodies:[],served:[],denied:[],mistakes:0,revenue:0,evidence:{},checked:[],talked:[],ids:[],observed:[],pumpChecked:false,pumpDone:false,power:true,repair:false,phone:true,phoneMessage:'老板的交接电话',boardCarry:false,boards:6,barricades:{front:0,loading:0,window:0},trapCarry:false,traps:0,placed:{},dispatch:false,rescue:150,preparation:35,threats:[],spawnIn:15,heat:0,hidden:false,hideExposed:false,noise:0,crime:0,health:100,finished:false,outcome:'',log:[],subtitle:'',subtitleUntil:0,checkpointLabel:'开班前'};}
export function current(s){return s.actor?person(s,s.actor.id):null;}
export function stockCount(s){return s.crates.filter(c=>c.place==='shelf').length;}
export function openingDone(s){return stockCount(s)===(s.crates?.length||6)&&s.clean.length===SPILLS.length;}
export function available(s,t){
 if(s.finished||s.deathCinematic)return false;if(t.id==='restFood')return !s.narrative?.sequence&&!s.hidden&&!s.recovery&&s.health<100&&(s.restFood?.[t.key]||0)>0;const narrative=storyAvailable(s,t);if(narrative!==null)return narrative;
 if(s.finished)return false;if(t.id==='idTray')return false;if(t.id==='loadingSwitch')return !!s.power&&!s.loadingBroken&&(t.key==='open'?s.loadingLift<1||!s.loadingTarget:s.loadingLift>0||s.loadingTarget);if(t.id==='loadingChain')return !s.power&&!s.loadingBroken;if(t.id==='spinner')return true;if(t.id==='unbrace')return (s.barricades[t.key]||0)>0&&!s.boardCarry;if(t.id==='door'&&t.key==='loading')return false;if(t.id==='traps')return false;if(t.id==='securityDrawer')return true;if(t.id==='doorKey')return s.securityOpen&&!s.doorKeyOwned;if(t.id==='doorControl')return s.securityOpen;if(t.id==='scannerPickup')return !s.campaign&&!s.scannerOwned;if(t.id==='binocularPickup')return !s.binocularOwned;if(t.id==='coin')return s.coins?.some(c=>c.id===t.key);if(t.id==='litter')return s.litter?.some(c=>c.id===t.key);
 if(s.campaign){
  const danger=s.threats.some(t=>t.mode!=='dead');
  if(danger&&t.id==='boards')return s.boards>0&&!s.boardCarry;
  if(danger&&t.id==='traps')return s.traps>0&&!s.trapCarry;
  if(danger&&t.id==='hide')return true;
  if(danger&&t.id==='barricade')return !!(s.boardCarry&&['front','loading'].includes(t.key)&&s.barricades[t.key]<3||s.trapCarry&&['front','loading'].includes(t.key)&&!s.placed[t.key]);
  if(t.id==='radio'&&s.phase==='customers'&&danger)return !s.emergencyRemaining;
  if(t.id==='register')return ['change','receipt'].includes(s.transaction?.stage)&&s.power;
  if(t.id==='cashReset')return s.power&&['change','receipt'].includes(s.transaction?.stage)&&s.transaction.change>0;
  if(t.id==='idTray')return s.power&&!!(s.heldId||s.trayId);
  if(t.id==='storyItem')return (!t.key||Number(t.key)===s.night)&&s.incidentStep<2&&(s.night===1&&s.phase==='incident'||s.night===2&&s.phase==='incident'||s.night===3&&s.phase==='siege');
  if(t.id==='checkoutItem')return s.power&&s.transaction?.stage==='scan'&&!s.transaction.scanned.includes(Number(t.key));
  if(t.id==='tender')return s.power&&s.transaction?.stage==='cash';
  if(t.id==='drawer')return s.power&&['change','receipt'].includes(s.transaction?.stage);
  if(t.id==='cashNote')return s.drawerOpen&&s.transaction?.stage==='change';
  if(t.id==='changeConfirm')return s.drawerOpen&&s.transaction?.stage==='change';
  if(t.id==='receipt')return false;
  if(t.id==='radio')return s.night<3&&s.phase==='incident'||s.night===3&&s.phase==='siege'&&!s.dispatch;
  if(t.id==='pump')return s.actors.some(a=>person(s,a.id)?.pump&&a.mode==='wait')&&!s.pumpDone;
  if(t.id==='actor')return s.actors.some(a=>(!t.key||a.id===t.key)&&openConversationModes.includes(a.mode));
 }
 if(['manual','map','monitor'].includes(t.id))return true;
 if(t.id==='door'&&t.key==='front')return !s.frontLocked&&!s.barricades.front&&(!s.power||['outage','siege','incident','dawn'].includes(s.phase));
 if(t.id==='door')return !(t.key==='front'&&s.barricades.front||t.key==='loading'&&s.barricades.loading);
 if(t.id==='torch')return !s.torchOwned;
 if(t.id==='phone')return s.phone;
 if(t.id==='gun')return s.securityOpen&&!s.gunOwned;
 if(t.id==='manifest')return s.briefed&&!s.manifest&&freightReady(s);
 if(t.id==='crate')return s.manifest&&!s.carry&&!s.boardCarry&&!s.trapCarry&&!['shelf','carried'].includes(s.crates[t.key]?.place);
 if(t.id==='receiving')return !!s.carry&&s.carry.type==='crate'&&!s.crates[s.carry.id].received;
 if(t.id==='shelf')return !!s.carry&&s.carry.type==='crate'&&s.crates[s.carry.id].received;
 if(t.id==='clean')return s.briefed&&['opening','customers'].includes(s.phase)&&!s.clean.includes(t.key);
 if(t.id==='actor')return !!s.actor&&s.actor.mode!=='dead'&&s.actor.mode!=='leave';
 if(t.id==='terminal')return s.power;
 if(t.id==='pump')return !!current(s)?.pump&&!s.pumpDone&&s.actor.mode==='wait';
 if(t.id==='breaker')return s.phase==='outage'&&!s.power;
 if(t.id==='radio')return s.phase==='siege'&&!s.dispatch;
 if(t.id==='boards')return ['outage','siege'].includes(s.phase)&&s.boards>0&&!s.boardCarry;
 if(t.id==='traps')return ['outage','siege'].includes(s.phase)&&s.traps>0&&!s.trapCarry;
 if(t.id==='barricade')return ['outage','siege'].includes(s.phase)&&(s.boardCarry&&['front','loading'].includes(t.key)&&s.barricades[t.key]<3||s.trapCarry&&['front','loading'].includes(t.key)&&!s.placed[t.key]);
 if(t.id==='hide')return !s.hidden&&!s.carry&&!s.boardCarry&&!s.trapCarry;
 if(t.id==='finish')return s.phase==='dawn';
 return false;
}
export function task(s){
 if(s.finished)return {title:s.outcome,detail:'按 Esc 查看本夜记录，或读取阶段存档重试。'};
 if(s.hidden)return {title:'躲藏中',detail:s.campaign?'按 E 离开。先切断视线再藏身；看见你进入的敌人会搜查柜子。':'按 E 离开。保持安静；若被看见躲入，追踪者仍会找到这里。'};
 if(s.carry){const c=s.crates[s.carry.id];return c.received?{title:'上架 · '+SHELVES[c.shelf].name,detail:'拿着箱子靠近高亮货格，按 E。货架侧面也可操作；Q 可放下。'}:{title:'先验收这箱货',detail:'从后门进入仓库，门内左手边是验货台。将视线移到台面，按 E。'};}
 if(s.boardCarry)return {title:'加固入口',detail:'先关闭前门或卸货卷帘门，再对着门按住 E 约一秒；卷帘门木板卡入内侧固定槽。两扇外门各最多加固三块木板；Q 放回材料。'};
 if(s.phase==='briefing')return {title:'接听交接电话',detail:'座机就在柜台左端，正发出铃声。靠近并按 E。'};
 if(!s.manifest)return {title:'签收后门配送',detail:'穿过店后方「STOCK」门，对卷帘门旁绿色上升按钮按 E；配送单在门外货车尾部。'};
 if(s.phase==='opening'&&stockCount(s)<2)return {title:'先补上两箱货',detail:`已上架 ${stockCount(s)}/${s.crates.length}。车尾 → 门内验货台 → 对应货架；抱箱时可按 Shift 跑动。`};
 if(s.actor){const c=current(s),a=s.actor;if(a.mode==='arrive')return {title:c.rear?'后门有人敲门':c.pump?'三号泵呼叫店员':'有顾客到店',detail:c.rear?'去仓库后门内查看。先隔着门听来意，不必开门。':c.pump?'从前门到右侧三号泵。':!s.doors.front?'前门还关着，先打开它让顾客进店。':'对方正在走向柜台；可以先做剩余工作。'};return {title:c.rear?'核实临时工权限':c.pump?'处理三号泵订单':'接待 '+c.cn,detail:c.rear?'门外人员自称帮工。柜台电脑有今晚的当班名单。':c.pump?s.pumpChecked?'返回三号泵，核对尾号 '+(c.pumpOrder||'2305')+' 后恢复授权。':'先与司机交谈，再查柜台电脑的三号泵订单。':!s.talked.includes(c.id)?'走到顾客身旁按 E 面对面交谈；1/2 提问，Q 离开。随身扫描器用 X 拿出，按住 R 测量。':!s.ids.includes(c.id)?'查看证件。登记信息在柜台电脑。':'听陈述、查柜台电脑，并留意自然动作；X 拿出扫描器、按住 R 测量身体疑点。'};}
 if(s.departing&&!s.doors.front&&!CUSTOMERS.find(c=>c.id===s.departing.id)?.rear)return {title:'顾客在等你开门',detail:'前门关着。先打开店铺前门，让已处理的顾客离开。'};
 if(s.phase==='outage')return {title:'照明断电',detail:'拿好手电，从前门或仓库卸货门出去，沿右侧弱灯到红色电闸箱。'};
 if(s.phase==='siege')return !s.dispatch?{title:'向外界求援',detail:'员工室无线电恢复了。先发送求援；仓库右侧木板托架有木板，抱起后关门，按住 E 钉牢。'}:{title:'守到救援抵达',detail:`约 ${Math.ceil(s.rescue)} 秒。关闭外门，抱木板按住 E 钉牢；失去视线后可躲进员工室储物柜。`};
 if(s.phase==='dawn')return {title:'接收交班确认',detail:'救援车已到路口。回员工室无线电确认撤离，本夜记录会保留。'};
 if(s.queue>=CUSTOMERS.length&&!openingDone(s))return {title:'完成打烊前的工作',detail:`货物 ${stockCount(s)}/${s.crates.length} · 清洁 ${s.clean.length}/3。仓库里还有货，地面污渍用 E 清理。`};
 return {title:'维持营业',detail:`上架 ${stockCount(s)}/${s.crates.length} · 清洁 ${s.clean.length}/3。门铃响起再接待；剩余工作可以现在完成。`};
}
export class Game{
 constructor({notice=()=>{},sound=()=>{},checkpoint=()=>{},dialogue=()=>{},nav=null,canSee=null,canDrop=()=>true,canScan=null}={}){this.notice=notice;this.sound=sound;this.checkpoint=checkpoint;this.dialogue=dialogue;this.nav=nav;this.canSee=canSee;this.canDrop=canDrop;this.canScan=canScan;this.s=fresh();}
 say(text,options){this.s.subtitle=text;this.s.subtitleUntil=this.s.time+Math.max(10,text.length*.16);this.s.log.unshift(text);this.s.log=this.s.log.slice(0,50);this.dialogue(text,options);}
 save(label){this.s.checkpointLabel=label;this.checkpoint(clone({...this.s,paused:true,hidden:false}));}
 start(){this.s.paused=false;}
 note(key,text){if(!this.s.evidence[key]){this.s.evidence[key]=text;this.notice('笔记已更新：'+text);}}
 hands(){if(this.s.carry||this.s.boardCarry||this.s.trapCarry){this.notice('先按 Q 放下手中的东西。');return false;}return true;}
 act(id,key){const s=this.s;if(!available(s,{id,key}))return false;if(!['door','shelf','receiving','crate','manual','map','barricade'].includes(id)&&!this.hands())return false;
  if(id==='securityDrawer'){s.securityOpen=!s.securityOpen;this.sound(s.securityOpen?'drawerOpen':'drawerClose');}
  if(id==='scannerPickup')s.scannerOwned=true;
  if(id==='binocularPickup')s.binocularOwned=true;
  if(id==='doorKey')s.doorKeyOwned=true;
  if(id==='phone'){s.phone=false;s.briefed=true;s.phase='opening';this.say('老板：先签后门的配送单，六箱货都要验收再上架。两箱补完就开门接客。柜台电脑查资料，手册贴在柜台后的公告板。今晚只有你一个人值班。县里封了旧支线，不要让人借后门抄近路。');this.sound('phoneOff');this.save('交接完成');}
  if(id==='manual')s.manual=true;
  if(id==='torch'){s.torchOwned=true;s.torch=true;this.notice('手电已拿起 · F 开关');}
  if(id==='gun'){s.gunOwned=true;this.notice('应急手枪已拿取 · G 收起/拔出 · 八发子弹');}
  if(id==='manifest'){s.manifest=true;this.say('配送单：Hale Logistics，六箱。站点编号一栏，旧的「8」被盖上了「9」。司机备注：钥匙交回柜台了；今晚不再有其他员工。');}
  if(id==='crate'){s.carry={type:'crate',id:key};s.crates[key].place='carried';s.gunDrawn=false;s.scannerActive=false;this.sound('boxLift',{pos:s.crates[key]});}
  if(id==='receiving'){const c=s.crates[s.carry.id];c.received=true;c.place='warehouse';c.x=-6.9+(c.id%2)*.9;c.z=14+Math.floor(c.id/2)*1.1;s.carry=null;this.sound('boxLand',{pos:{x:-8.5,z:16.3}});this.notice('验收完成，箱子已放在台旁。再次抱起，可直接去货架。');}
  if(id==='shelf'){const c=s.crates[s.carry.id];if(c.shelf!==key){this.notice('这是'+SHELVES[key].name+'货架；手里是'+SHELVES[c.shelf].name+'。');return false;}c.place='shelf';s.carry=null;this.sound('shelfStock',{pos:SHELVES[key],surface:key});if(stockCount(s)===2&&s.phase==='opening'){s.phase='customers';s.nextIn=8;this.say('第一排货补齐了。前门可以营业，继续整理，留意门铃。');this.save('营业开始');}}
  if(id==='clean'){s.clean.push(key);this.sound('wipe');this.notice('地面已清理。');}
  if(id==='door'){if(s.hidden)return false;if(key==='front'){s.frontManual=!s.frontManual;return true;}s.doors[key]=!s.doors[key];this.sound(key==='loading'?(s.doors[key]?'rearOpen':'rearClose'):(s.doors[key]?'doorOpen':'doorClose'),{pos:DOORS[key],surface:key});}
  if(id==='breaker'){s.power=true;s.repair=true;s.phase='siege';s.preparation=35;this.say('无线电里传来陌生的声音：「别数窗外的人。」员工室的呼叫灯亮了；现在可以发送求援。');this.sound('power');this.save('供电恢复 · 求援前');}
  if(id==='radio'){s.dispatch=true;this.say('县调度：旧支线不该还有营业站。我们收到两次你的求救，但你说话的声音来自两个地方。救援车约两分半抵达。留在室内，不要回应模仿你声音的呼叫。');this.sound('radio');}
  if(id==='boards'){s.scannerActive=false;s.boardCarry=true;s.boards--;s.gunDrawn=false;}
  if(id==='barricade'){if(s.boardCarry){if(key!=='window'&&s.doors[key]){this.notice('先关上这扇门，才能钉木板。');return false;}s.barricades[key]++;s.boardCarry=false;this.sound('hammer');}}
  if(id==='hide'){s.hidden=true;s.scannerActive=false;s.torch=false;s.gunDrawn=false;s.hideExposed=s.threats.some(t=>t.mode==='chase'&&distance(t,s.player)<9&&(this.canSee?this.canSee(t,s.player,s):true));s.heat=0;this.say(s.hideExposed?'你在它的视线里钻进了柜子。它知道你在哪里。':'你合上柜门，压住呼吸。');}
  if(id==='finish'){s.finished=true;s.outcome=s.mistakes?'撤离成功 · 留有事故记录':'第一夜完成 · 安全撤离';this.say('县调度：看到你了。现在离开那扇窗。第九出口已停止营业。');}
  return true;
 }
 drop(){const s=this.s;if(s.carry){const c=s.crates[s.carry.id],angles=[0,Math.PI/2,-Math.PI/2,Math.PI],spots=angles.map(a=>({x:s.player.x-Math.sin(s.player.yaw+a)*.85,z:s.player.z-Math.cos(s.player.yaw+a)*.85}));const spot=spots.find(p=>this.canDrop(p,s));if(!spot){this.notice('附近没有放箱空间，请后退一点再按 Q。');return false;}c.place='floor';c.x=spot.x;c.z=spot.z;s.carry=null;this.sound('boxLand',{pos:spot});}if(s.boardCarry){s.boards++;s.boardCarry=false;this.notice('木板已放回材料堆。');}if(s.trapCarry){s.traps=0;s.trapCarry=false;}}
 toggleScanner(){const s=this.s;if(!scannerReady(s)){this.notice('先放下手中的东西并离开躲藏处，再使用扫描器。');return false;}s.scannerActive=!s.scannerActive;s.binocularActive=false;s.scanProgress=0;s.scanTargetId=null;if(s.scannerActive){s.gunDrawn=false;this.notice('回波扫描器 · 对准近处人物，按住 R 扫描；X 收起。需无遮挡，不能隔门扫描。');}return true;}
 scan(dt,id){const s=this.s,c=current(s);if(!s.scannerActive||!scannerReady(s)||s.scanCooldown>0||!c||s.actor.mode!=='wait'||id!==c.id||distance(s.player,s.actor)>3.2||(this.canScan&&!this.canScan(id,s))){s.scanProgress=0;s.scanTargetId=null;return false;}if(s.scanTargetId!==id)s.scanProgress=0;s.scanTargetId=id;s.scanProgress+=Math.max(0,Math.min(dt,.1));if(s.scanProgress<SCAN_SECONDS)return false;s.scans??={};s.scans[id]=scanReading(c);this.note(id+':scan',c.cn+' · '+s.scans[id]);s.scanProgress=0;s.scanCooldown=SCAN_COOLDOWN;this.sound('pump');return true;}
 query(kind){const s=this.s,c=current(s);if(!c||s.actor.mode!=='wait')return false;if(kind==='talk'){if(!s.talked.includes(c.id))s.talked.push(c.id);this.say(c.cn+'：'+c.talk);}if(kind==='id'){if(!s.ids.includes(c.id))s.ids.push(c.id);this.note(c.id+':id',c.name+' / '+c.badge+' / '+c.address);}return true;}
 lookup(id){const s=this.s,c=CUSTOMERS.find(c=>c.id===id);if(!c||!s.power)return false;if(!s.checked.includes(id))s.checked.push(id);this.note(id+':registry',c.registry);if(c.pump&&current(s)?.id===id){s.pumpChecked=true;}return true;}
 decide(choice){const s=this.s,c=current(s);if(!c||s.actor.mode!=='wait'||!this.hands())return false;
  if(choice==='sale'&&c.pump&&!s.pumpDone){this.notice('订单尚未恢复：先查终端，再到三号泵确认。');return false;}
  if(choice==='sale'&&!s.talked.includes(c.id)){this.notice('先听听对方要什么。');return false;}
  if(choice==='sale'&&c.rear){this.notice('对方没有购物，正在请求后仓通行权限。');return false;}
  if(choice==='allow'&&!c.rear)return false;
  if(c.human){if(choice==='sale'){s.served.push(c.id);s.revenue+=c.sale;this.say(c.cn+'：谢谢。路上见。');}else{s.denied.push(c.id);s.mistakes++;this.say(c.cn+'：好吧，我去下一个出口。');}}
  else if(choice==='sale'||choice==='allow'){s.mistakes++;s.heat++;this.say(c.cn+'：你做了个很好的选择。');}else this.say(c.cn+'没有争辩。他转身走向了灯照不到的地方。');
  this.depart();return true;
 }
 helpPump(){const s=this.s;if(!available(s,{id:'pump'})||!s.pumpChecked||!s.talked.includes('leon')){this.notice('先听司机说明，再到柜台电脑核对三号泵订单。');return false;}s.pumpDone=true;this.sound('pump');this.note('pump','三号泵订单 2305 已恢复，出油记录正常。');this.say('里昂：现在开始走数了。谢谢，我可以继续赶路了。');s.served.push('leon');s.revenue+=24.6;this.depart();return true;}
 depart(){const s=this.s;if(!s.actor)return;if(s.actor.mode==='dead'){s.bodies.push({...s.actor,deathYaw:s.actor.yaw});s.actor=null;s.queue++;s.nextIn=10;this.save('已处理 '+s.queue+' 位来客');return;}s.actor.mode='leave';s.actor.step=0;s.actor.route=null;s.departing=s.actor;s.actor=null;s.queue++;s.nextIn=10;this.save('已处理 '+s.queue+' 位来客');}
 finishError(text){this.s.finished=true;this.s.outcome=text;this.s.health=Math.max(0,this.s.health);this.say(text);}
 fire(hit){const s=this.s;if(!s.gunOwned||!s.gunDrawn||s.ammo<=0||s.hidden||!this.hands())return false;s.ammo--;s.noise=7;this.sound('shot');if(hit?.kind==='customer'&&s.actor){const c=current(s);if(c.human){s.crime=18;s.actor.mode='dead';s.mistakes++;this.say('无线电：第九出口监控报警，疑似伤害平民。巡逻车正在靠近。');}else{s.actor.mode='dead';this.say('衣服里传来一声不属于人的摩擦声。');this.depart();}}else if(hit?.kind==='threat'){const t=s.threats.find(v=>v.id===hit.id);if(t){t.hp--;t.stun=2;if(t.hp<=0){t.mode='dead';this.sound('collapse');}}}return true;}
 observe(visible){const s=this.s,c=current(s);if(c&&!c.human&&visible&&s.actor.animation&&s.actor.animation.t>2&&s.actor.animation.t<7&&!s.observed.includes(c.id)){s.observed.push(c.id);this.note(c.id+':body',c.normal);}}
 spawnCustomer(){const s=this.s,c=CUSTOMERS[s.queue];if(!c)return;s.actor={id:c.id,x:16,z:c.rear?19:-17,yaw:0,mode:'arrive',route:null,step:0,moving:false,wait:0,animation:null,gesture:8};this.say(c.rear?'后门响起敲击声。有人在卸货口说话。':c.pump?'室外传来呼叫：「三号泵，能来个人吗？」':'门外有车停下。门铃响了一声。');this.sound(c.rear?'knock':c.pump?'radio':'bell');}
 tick(dt){const s=this.s;if(s.paused||s.finished)return;s.time+=dt;s.scanCooldown=Math.max(0,(s.scanCooldown||0)-dt);if(!scannerReady(s))s.scannerActive=false;s.noise=Math.max(0,s.noise-dt);if(s.crime){s.crime-=dt;if(s.crime<=0){this.finishError('执法处置 · 误伤平民');return;}}
  if(s.phase==='customers'&&!s.actor&&!s.departing&&s.queue<CUSTOMERS.length){s.nextIn-=dt;if(s.nextIn<=0)this.spawnCustomer();}
  if(s.actor)this.moveCustomer(s.actor,dt);if(s.departing){this.moveCustomer(s.departing,dt);if(distance(s.departing,{x:16,z:s.departing.id==='rowan'?19:-17})<1)s.departing=null;}
  if(s.phase==='customers'&&s.queue>=CUSTOMERS.length&&!s.actor&&!s.departing&&openingDone(s)&&!s.crime){s.phase='outage';s.power=false;this.say('最后一辆车的灯消失后，整个站点同时熄灭。后墙的电闸跳了。手电按 F，路线图按 M。');this.sound('blackout');this.save('停电 · 检修前');}
  if(s.phase==='siege')this.siege(dt);
 }
 moveCustomer(a,dt){const s=this.s,c=CUSTOMERS.find(c=>c.id===a.id);if(a.mode==='dead')return;const dest=c.rear?{x:-6,z:17.6}:c.pump?{x:8.4,z:-9.3}:CHECKOUT_LINE[0];let goals=a.mode==='leave'?(c.rear?[{x:-6,z:18.2},{x:16,z:19}]:c.pump?[{x:16,z:-17}]:[{x:DOORS.front.x,z:-3.2},{x:DOORS.front.x,z:-6.5},{x:16,z:-17}]):c.rear?[{x:-6,z:18.2},dest]:c.pump?[dest]:[{x:DOORS.front.x,z:-6.5},{x:DOORS.front.x,z:-3.2},dest];if(a.mode==='leave'){a.exitTime=(a.exitTime||0)+dt;}if(a.mode!=='wait'){
   const goal=goals[a.step||0]||goals.at(-1);if(distance(a,goal)<.35){a.step=(a.step||0)+1;a.route=null;if(a.step>=goals.length){if(a.mode==='arrive'){a.mode='wait';a.wait=0;this.sound(c.rear?'knock':'foot');}return;}}
   if(!c.rear&&!c.pump&&!s.doors.front&&((a.mode==='arrive'&&a.step===1)||(a.mode==='leave'&&a.step===1))){a.moving=false;return;}const g=goals[Math.min(a.step||0,goals.length-1)];this.walk(a,g,dt,1.65);if(a.mode==='arrive'&&distance(a,dest)<.4){a.mode='wait';a.route=null;}
  }else{a.moving=false;a.wait+=dt;a.gesture-=dt;if(a.gesture<0&&!a.animation){a.animation={t:0};a.gesture=15+(s.queue%3)*2;}if(a.animation){a.animation.t+=dt;if(a.animation.t>9)a.animation=null;}if(a.wait>240){this.say(c.cn+'等得太久，留下货物后离开了。');this.decide('deny');}}
 }
 walk(a,goal,dt,speed){if(!a.route||!a.route.length||a.repath<=0){a.route=this.nav?this.nav(a,goal,this.s):[{...goal}];a.repath=2;}a.repath-=dt;if(!a.route?.length){a.moving=false;a.blocked=true;return;}a.blocked=false;const before={x:a.x,z:a.z};let budget=speed*dt,limit=0;while(a.route.length&&budget>0&&limit++<12){const p=a.route[0],d=distance(a,p);if(d<.0025){a.route.shift();continue;}const amount=Math.min(budget,d);a.x+=(p.x-a.x)/d*amount;a.z+=(p.z-a.z)/d*amount;budget-=amount;if(amount>=d-.00001)a.route.shift();}a.moving=distance(before,a)>.00001;if(a.moving)a.yaw=Math.atan2(a.x-before.x,a.z-before.z);}

 siege(dt){const s=this.s;s.preparation-=dt;if(s.dispatch)s.rescue=Math.max(0,s.rescue-dt);s.spawnIn-=dt;if(s.preparation<=0&&s.spawnIn<=0&&s.threats.filter(t=>t.mode!=='dead').length<Math.min(3,1+s.mistakes)){const id='t'+s.threats.length,sides=['front','loading'];const side=sides[s.threats.length%2],pos=side==='front'?{x:DOORS.front.x,z:-8}:{x:-6,z:20.7};s.threats.push({id,...pos,yaw:0,hp:2,mode:'outside',side,stun:0,bash:0,route:null,repath:0,search:0});s.spawnIn=38;this.sound('growl');this.say(side==='front'?'前门外响起拖行的脚步。':'卸货门外，有人用你的声音喊了一声。');}
  for(const t of s.threats){if(t.mode==='dead'||t.mode==='retreat')continue;if(t.stun>0){t.stun-=dt;continue;}if(t.mode==='outside'){const side=t.side;if(!s.doors[side]){t.bash+=dt;if(t.bash>=6){t.bash=0;if(s.barricades[side]>0){s.barricades[side]--;this.notice('一块加固木板被撞断。');this.sound('hammer');}else{s.doors[side]=true;if(side==='loading'){s.loadingBroken=true;s.loadingLift=1;s.loadingTarget=true;}if(side==='front'){s.frontLocked=false;s.frontManual=true;s.frontSlide=1;}this.sound('break');this.say('外门被撞开了。先拉开距离、切断视线，再躲进员工室柜子；被看见入柜仍会被搜查。');}}continue;}t.mode='search';t.route=null;}
   const sees=!s.hidden&&(this.canSee?this.canSee(t,s.player,s):distance(t,s.player)<10);if(sees){t.mode='chase';t.last={x:s.player.x,z:s.player.z};t.search=18;}else if(s.noise>0&&distance(t,s.player)<13){t.last={x:s.player.x,z:s.player.z};t.search=12;}else if(t.mode==='chase')t.mode='search';
   if(s.campaign){tickCabinetSearch(this,t,dt);if(s.deathCinematic)return;}else if(s.hidden&&s.hideExposed){t.last={...SITE.hide};if(distance(t,t.last)<1.5){this.finishError('追踪者找到了储物柜');return;}}
   let goal=t.last;if(goal&&distance(t,goal)<.6){t.search-=dt;if(t.search<=0){t.last=null;goal=null;}}
   if(!goal){const patrol=[{x:-7,z:.5},{x:0,z:7.5},{x:-6,z:12},{x:8.5,z:13}];goal=patrol[(Math.floor(s.time/14)+s.threats.indexOf(t))%patrol.length];}
   this.walk(t,goal,dt,t.mode==='chase'?2.8:1.45);if(t.blocked){const closed=['stock','stockRight','office'].filter(k=>!s.doors[k]).sort((a,b)=>distance(t,DOORS[a])-distance(t,DOORS[b]));const door=closed[0];if(door){const d=DOORS[door],q=d.w>d.d?{x:d.x,z:d.z+(t.z<d.z?-.8:.8)}:{x:d.x+(t.x<d.x?-.8:.8),z:d.z};this.walk(t,q,dt,1.5);if(distance(t,q)<1){t.innerBash=(t.innerBash||0)+dt;if(t.innerBash>5){s.doors[door]=true;t.innerBash=0;t.route=null;this.sound('break');this.say(DOORS[door].name+'外传来撞击。门锁被撬开了。');}}}}if(!s.hidden&&distance(t,s.player)<.9&&(this.canSee?this.canSee(t,s.player,s):true)){damagePlayer(this,t);if(s.health<=0)return;}
  }
  if(s.dispatch&&s.rescue<=0&&!s.crime){s.phase='dawn';s.threats.forEach(t=>{t.mode='dead';});s.hidden=false;this.sound('rescue');this.say('两束车灯扫过窗户。县道路联络：接应车正在按约定路线接近，先确认车辆再离站。');this.save('救援抵达');}
 }
 load(snapshot){if(snapshot?.schema!==1||!snapshot.player||!snapshot.crates)return false;this.s={...fresh(),...clone(snapshot),scannerActive:false,scanProgress:0,scanTargetId:null};this.s.paused=true;return true;}
}
