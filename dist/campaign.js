import {PERSON_CLEARANCE,clearRescueBusLane,looseCargoBoxes} from './collision-system.js';
import {admissionReady,browseDuration,deliveryManifest,rememberVisit,previousVisit,previousAnswers,heardAnswer,stockGoal} from './service-pacing.js';
import {recordBodyObservation,saleKnownUnsafe} from './observation-rules.js';
import {REAR_VISITOR_START} from './yard-layout.js';
import {initFreight,tickFreight,freightReady,FREIGHT_PARK} from './freight-flow.js';
import {initSurvival,useRestFood,tickRecovery,enterCabinet,leaveCabinet,tickSiegeWaves,PISTOL_CAPACITY} from './survival.js';
import {spinnerBusy} from './shop-displays.js';
import {advanceStoryClock} from './story-clock.js';
import {initStory,isNewStory,storyAct,tickStory,startClosing,storyTask,sequenceActive,beginSequence} from './story-flow.js';
import {guidanceSales,recordGuidanceSale} from './guidance.js';
import {requestLoading} from './loading-door.js';
import {beginRefusal,tickRefusal,settleRefusal} from './customer-service.js';
import {initUpgrades,tickUpgrades,buildProgress} from './upgrade-rules.js';
import {beginPumpVisit,tickVehicle} from './vehicle-flow.js';
import {frontOccupied} from './door-system.js';
import {SITE} from './site-layout.js';
import {shoppingApproach,productSlot,selectProductSlot} from './product-catalog.js';
import {CHECKOUT_LINE,counterXZ,counterPlayer} from './counter-layout.js';
import {gaitProfile,gaitKey,shoppingPose,damp} from './locomotion.js';
import {hasBodyLeak,perfectDisguise} from './mimicry.js';
import {DOORS,SPOTS} from './data.js';
import {doorWouldHit} from './spatial.js';
import {Game,fresh,stockCount,openingDone,distance,available} from './rules.js';

import {NIGHTS,nightCast,person,liveActors,openConversationModes,BUYABLES,PRODUCTS,money} from './night-data.js';
import {recallChange,deliverCash,newLedger,newTransaction,scanProduct,takeTender,selectCash,clearCash,handChange,finishReceipt,cancelCheckout,ledgerBalanced} from './checkout.js';
export const MAX_CUSTOMERS=3;
export function campaignState(night=1,carry=null){const s=fresh();if(night===2)s.crates=s.crates.slice(0,3);return initSurvival(initFreight(initStory(initUpgrades(Object.assign(s,{campaign:true,campaignVersion:14,guidance:{sales:carry?guidanceSales(carry):0},night,visitHistory:JSON.parse(JSON.stringify(carry?.visitHistory||[])),priorAnswers:carry?previousAnswers(carry):{},cast:nightCast(night),actors:[],admitted:0,completed:[],selectedId:null,ledger:newLedger(),transaction:null,drawerOpen:false,heldId:null,trayId:null,idScanned:null,idScanRemaining:0,idMarks:{},idScreenMessage:'拿着顾客证件，对电脑按 E 直接读取。',documentResults:{},questioned:{},incidentStep:0,incidentTime:0,eventFlags:{},pickedStock:{0:0,1:0,2:0},pickedProducts:{},removedShelfSlots:[],story:carry?.story||{},history:carry?.history||[],wallet:carry?.wallet??1500,purchases:{},upgrades:{...(carry?.upgrades||{circuit:false}),scanner:false},supplies:carry?.supplies||{boards:0,traps:0},dayFinished:false,campaignFinished:false,endingChoice:null,admissionClock:8,horrorClock:35,shadow:null})),carry)));}
const occupied=a=>!['leave','dead'].includes(a.mode);
const checkoutLine=s=>s.actors.filter(a=>['queue','wait'].includes(a.mode)&&!person(s,a.id).rear&&!person(s,a.id).pump).sort((a,b)=>a.lineOrder-b.lineOrder);
export class CampaignGame extends Game{
 constructor(hooks={}){super(hooks);this.s=campaignState();this.canOccupy=hooks.canOccupy||(()=>true);this.storyVoiceBusy=hooks.storyVoiceBusy||(()=>false);}
 focus(id){const a=this.s.actors.find(a=>a.id===id&&a.mode!=='leave'&&a.mode!=='dead');if(!a)return false;this.s.selectedId=id;this.s.actor=a;return true;}
 active(){const s=this.s;return s.actors.find(a=>a.id===s.selectedId&&occupied(a))||checkoutLine(s).find(a=>a.mode==='wait')||s.actors.find(occupied)||null;}
 save(label){this.s.checkpointLabel=label;this.checkpoint(JSON.parse(JSON.stringify({...this.s,paused:true})));}
 leaveHide(){return leaveCabinet(this);}
 finishError(text){const s=this.s;if(s.health<=0&&!s.deathCinematic){s.health=0;s.hidden=false;s.recovery=null;s.boardBuild=null;s.moving=false;s.deathCinematic={elapsed:0,duration:2.35,reason:text,attacker:s.lastAttacker||'milo'};s.phase='death';s.gunDrawn=false;this.onFatal?.();this.sound('deathSting');return;}if(s.deathCinematic)return;return super.finishError(text);}
 act(id,key){const s=this.s;if(id==='crate'&&!s.crates[key])return false;if(id==='hide'&&available(s,{id,key}))return enterCabinet(this,key||'staff');if(id==='restFood')return useRestFood(this,key);if(id==='manifest'&&!freightReady(s)){this.notice('等货车停稳并放下踏板后再签单。');return false;}const routed=storyAct(this,id,key);if(routed!==null)return routed;
  if(id==='receiving'&&available(s,{id,key})){
   const c=s.crates[s.carry.id],preferred={x:-6.9+(c.id%2)*.9,z:14+Math.floor(c.id/2)*1.1},spots=[preferred];
   for(const z of [14,15.1,16.2])for(const x of [-6.9,-6])spots.push({x,z});
   const spot=spots.find(p=>this.canDrop(p,s));if(!spot){this.notice('验货台旁没有空位，请退开或先搬走地上的箱子，再验收。');return false;}
   Object.assign(c,spot,{received:true,place:'warehouse'});s.carry=null;this.sound('boxLand',{pos:spot});this.notice('验收完成，箱子已放在台旁。再次抱起，可直接去货架。');return true;
  }
  if(id==='loadingSwitch')return requestLoading(this,key==='open');
  if(id==='loadingChain')return requestLoading(this,!s.loadingTarget,true);
  if(id==='unbrace'){if(!s.barricades[key]||!this.hands())return false;s.barricades[key]--;s.boards++;this.sound('metalKey');return true;}
  if(id==='spinner'){key=key||'spinner';if(!this.hands())return false;if(spinnerBusy(s,key)){this.notice('货架正在转动，稍等一下。');return false;}if(s.actors.some(a=>a.mode==='browse'&&a.shoppingTarget?.fixture===key)){this.notice('顾客正在选取这架商品，稍等再转动。');return false;}if(key==='spinner'){s.spinnerStep=(s.spinnerStep||0)+1;s.spinnerBusy=.7;}else{s.spinnerSteps??={};s.spinnerBusies??={};s.spinnerSteps[key]=(s.spinnerSteps[key]||0)+1;s.spinnerBusies[key]=.7;}this.sound('metalKey');return true;}
  if(id==='door'&&key==='loading')return requestLoading(this,!s.loadingTarget);
  if(id==='door'&&key!=='front'&&key!=='loading'&&DOORS[key]&&doorWouldHit(DOORS[key],!s.doors[key],[s.player,...s.actors.filter(a=>a.mode!=='dead'),...s.threats.filter(a=>a.mode!=='dead'),...looseCargoBoxes(s).map(c=>({...c,radius:.46}))])){this.notice('门扇旁有人或货箱，先清空再开关门。');return false;}
  if(id==='securityDrawer'){if(!this.hands())return false;s.securityOpen=!s.securityOpen;this.sound(s.securityOpen?'drawerOpen':'drawerClose');return true;}
  if(id==='doorKey'){if(!s.securityOpen||s.doorKeyOwned)return false;s.doorKeyOwned=true;this.notice('门控钥匙已拿起。抽屉旁的固定按钮现在可切换门锁。');this.sound('metalKey');return true;}
  if(id==='doorControl'){if(!s.doorKeyOwned){this.notice('先取同一抽屉里的门控钥匙。');return false;}if(!s.frontLocked&&!s.power&&s.frontBatteryUsed&&s.frontSlide>.04){this.notice('备用电已用过；先到门边手动合门，再用按钮锁闭。');return false;}if(!s.frontLocked&&frontOccupied(s)){this.notice('门缝里有人或货箱；先清空再锁门。');return false;}s.frontLocked=!s.frontLocked;s.frontManual=false;this.notice(s.frontLocked?'前门感应已停用，电锁锁闭。':'前门已解锁。营业时恢复感应；停电时到门边手动推开。');this.sound('doorLatch');return true;}
  if(id==='scannerPickup')return false;
  if(id==='binocularPickup'){if(s.binocularOwned||!this.hands())return false;s.binocularOwned=true;this.notice('望远镜已拿起 · B 举起，滚轮在 1—3 倍之间调节。');return true;}
  if(id==='coin'){const i=s.coins.findIndex(c=>c.id===key);if(i<0||!this.hands())return false;const c=s.coins.splice(i,1)[0];s.wallet+=c.value;s.coinIncome+=c.value;this.notice('拾到 '+money(c.value)+' · 已加入可支配余额');this.sound('coin');return true;}
  if(id==='litter'){const i=s.litter.findIndex(c=>c.id===key);if(i<0||!this.hands())return false;s.litter.splice(i,1);this.sound('wipe');return true;}
  if(id==='barricade'){if(!s.boardCarry||!['front','loading'].includes(key)||s.barricades[key]>=3)return false;if(s.doors[key]||(key==='loading'&&(s.loadingLift||0)>.02)||(key==='front'&&s.frontSlide>.04)){this.notice('先关闭这扇门，再按住 E 钉木板。');return false;}s.boardBuild={key,time:0,grace:.24,x:s.player.x,z:s.player.z};return true;}
  if(id==='phone'&&s.phone){s.phone=false;s.briefed=true;s.phase='opening';this.say(NIGHTS[s.night].phone);this.sound('phoneOff');this.save('第 '+s.night+' 晚交接');return true;}
  if(id==='manifest'&&s.briefed&&!s.manifest){s.manifest=true;this.say(deliveryManifest(s,NIGHTS[s.night].manifest));this.sound('paper',{pos:SPOTS.manifest});this.note('night'+s.night+':delivery',deliveryManifest(s,NIGHTS[s.night].manifest));return true;}
  if(id==='idTray')return this.placeDocument();
  if(id==='storyItem')return this.takeStory();
  if(id==='checkoutItem')return this.scanItem(key);
  if(id==='tender')return this.receiveMoney();
  if(id==='drawer')return this.openDrawer();
  if(id==='receipt')return this.receipt();
  if(id==='cashReset')return this.resetMoney();
  if(id==='cashNote')return this.deliverMoney(Number(key));
  if(id==='changeConfirm')return this.giveChange();
  if(id==='idReturn')return this.returnDocument();
  if(id==='radio'){
   if(s.phase==='customers'&&s.threats.some(t=>t.mode!=='dead')&&!s.emergencyRemaining){s.emergencyRemaining=45;this.say('县调度：停下营业，别再开门。巡逻车四十五秒后经过路口。先切断视线、用门和材料防守，躲进员工室等候。');this.sound('radio');return true;}
  }
  if(id==='finish'&&s.phase==='dawn')return this.closeNight();
  return super.act(id,key);
 }
 spawnCustomer(){const s=this.s;if(s.admitted>=s.cast.length||s.actors.filter(a=>a.mode!=='dead').length>=MAX_CUSTOMERS)return false;const c=s.cast[s.admitted++];const a={id:c.id,x:c.rear?REAR_VISITOR_START.x:16,z:c.rear?REAR_VISITOR_START.z:-17,yaw:0,mode:'arrive',step:0,route:null,repath:0,moving:false,wait:0,animation:null,gesture:22+s.admitted*3,browseIndex:0,browseTime:0,basketReady:false,lineOrder:0,spawnOrder:s.admitted,pausedByTalk:false};if(c.pump){beginPumpVisit(s,a);this.sound('engineStart',{pos:a});}s.actors.push(a);if(!s.actor)s.actor=a;this.sound(c.rear?'knock':c.pump?'engineStart':'bell',{pos:c.rear?{x:-6,z:16}:c.pump?{x:7,z:-11}:{x:DOORS.front.x,z:-5}});if(c.rear)this.say(c.rear?'后门有人自称来接班。可以隔门询问，不要为核验先开门。':'三号泵的司机呼叫店员。拿证件到柜台电脑核对工单，还证后恢复授权。');return true;}
 tick(dt){const s=this.s;if(s.paused||s.finished)return;s.time+=dt;if(s.hidden)s.hideExposed=s.threats.some(t=>t.hp>0&&t.cabinetMemory&&t.cabinetMemory.key===s.hideCabinet&&s.time-(t.cabinetMemory.lastSeenAt??t.cabinetMemory.knownAt)<24);if(s.deathCinematic){s.deathCinematic.elapsed+=dt;if(s.deathCinematic.elapsed>=s.deathCinematic.duration){s.finished=true;s.outcome=s.deathCinematic.reason;}return;}tickRecovery(this,dt);tickFreight(this,dt);advanceStoryClock(s,dt);if(sequenceActive(s)){tickStory(this,dt);return;}if(s.transaction?.stage==='receipt'&&!s.refusal)this.finishSale();tickUpgrades(this,dt);if(tickStory(this,dt))return;s.noise=Math.max(0,s.noise-dt);
  if(s.crime){s.crime-=dt;if(s.crime<=0){this.finishError('执法处置 · 误伤平民');return;}}
  if(s.idScanRemaining>0){s.idScanRemaining=Math.max(0,s.idScanRemaining-dt);if(s.idScanRemaining===0){s.idScanned=s.trayId;s.idMarks={};s.idScreenMessage='证件已读取。逐项比较两列，标记一致或疑点，再提交。';this.sound('idReady',{pos:counterXZ({x:-5.55,z:-1.52})});}}
  if(s.phase==='customers'&&!s.threats.some(t=>t.mode!=='dead')){s.admissionClock-=dt;if(s.admissionClock<=0&&admissionReady(s)&&this.spawnCustomer())s.admissionClock=12;}
  for(const a of [...s.actors])this.moveCustomer(a,dt);
  s.actors=s.actors.filter(a=>!a.exited);const selected=s.actors.find(a=>a.id===s.selectedId&&occupied(a));s.actor=selected||this.active();s.selectedId=s.actor?.id||null;
  if(s.phase==='customers'&&s.admitted===s.cast.length&&!s.actors.some(occupied)&&!s.actors.some(a=>a.mode==='leave')&&openingDone(s)&&!s.crime){startClosing(this);}
  if(['incident','outage','siege'].includes(s.phase))s.incidentTime+=dt;
  if(s.stalkerDelay>0){s.stalkerDelay-=dt;if(s.stalkerDelay<=0)this.spawnIntruder('front',s.stalkerSource);}
  if(s.phase==='siege')this.siege(dt);else if(s.threats.some(t=>t.mode!=='dead')){const old={preparation:s.preparation,spawnIn:s.spawnIn,dispatch:s.dispatch,rescue:s.rescue};s.preparation=9999;s.spawnIn=9999;s.dispatch=false;super.siege(dt);Object.assign(s,old);}
  if(s.deathCinematic)return;
  if(s.emergencyRemaining>0){s.emergencyRemaining=Math.max(0,s.emergencyRemaining-dt);if(s.emergencyRemaining===0){s.threats=s.threats.filter(t=>t.mode==='dead');s.admissionClock=8;this.say('巡逻车的探照灯扫过站点。门外的东西退回树林，限流闸重新开放。顾客的紧急撤离不会扣你的工资。');this.sound('rescue');}}
  this.horror(dt);
 }
 walk(a,goal,dt,speed){
  const before={x:a.x,z:a.z};a.avoiding=false;const visitor=a.id&&this.s.actors.includes(a);let pace=speed;if(visitor){const distanceLeft=distance(a,goal),target=speed*gaitProfile(gaitKey(a,person(this.s,a.id))).pace*Math.min(1,.28+distanceLeft/.9);a.travelSpeed=damp(a.travelSpeed||0,target,5,dt);pace=a.travelSpeed;}super.walk(a,goal,dt,pace);
  if(!this.canOccupy(a,this.s)){Object.assign(a,before,{moving:false,blocked:true,route:null,repath:0});return;}
  const playerBlock=(visitor||this.s.threats.includes(a))&&!this.s.hidden&&distance(a,this.s.player)<PERSON_CLEARANCE&&distance(a,this.s.player)<distance(before,this.s.player);
  const block=playerBlock?this.s.player:this.s.actors.find(b=>b!==a&&b.mode!=='dead'&&distance(a,b)<.50&&distance(a,b)<distance(before,b)&&((b.spawnOrder||0)<(a.spawnOrder||0)||['wait','browse','queue'].includes(b.mode)));
  if(!block){a.crowdWait=Math.max(0,(a.crowdWait||0)-dt*.25);return;}Object.assign(a,before,{moving:false});a.crowdWait=(a.crowdWait||0)+dt;
  if(a.crowdWait>.35){const sign=1,step=Math.min(.075,dt*.7);for(const side of [sign,-sign]){const q={x:before.x+Math.cos(a.yaw)*step*side,z:before.z-Math.sin(a.yaw)*step*side};if(this.canOccupy(q,this.s)&&(!visitor||this.s.hidden||distance(q,this.s.player)>=PERSON_CLEARANCE)&&!this.s.actors.some(b=>b!==a&&b.mode!=='dead'&&distance(q,b)<.48)){a.x=q.x;a.z=q.z;a.moving=true;a.avoiding=true;a.route=null;a.repath=0;break;}}}
 }
 moveCustomer(a,dt){const s=this.s,c=person(s,a.id);if(a.mode==='dead'||a.scripted)return;if(tickRefusal(this,a,dt))return;if(tickVehicle(this,a,dt))return;
  const moveTo=(goal,speed=1.55,tolerance=.20)=>{if(distance(a,goal)<tolerance){a.moving=false;a.travelSpeed=0;a.route=null;return true;}this.walk(a,goal,dt,speed);return false;};
  const exit=c.rear?[{x:-6,z:20.7},{...REAR_VISITOR_START}]:c.pump?[{x:16,z:-17}]:[{x:DOORS.front.x,z:-3.2},{x:DOORS.front.x,z:-6.5},{x:16,z:-17}];
  if(a.mode==='leave'){if(!c.rear&&!c.pump&&!s.doors.front&&(a.step||0)===1){a.moving=false;return;}if(moveTo(exit[a.step||0]||exit.at(-1),1.8)){a.step=(a.step||0)+1;if(a.step>=exit.length)a.exited=true;}return;}
  if(a.mode==='arrive'){
   const goals=c.rear?[{x:-6,z:20.7},{x:-6,z:20.25}]:c.pump?[{x:8.4,z:-9.3}]:[{x:DOORS.front.x,z:-6.5},{x:DOORS.front.x,z:-3.2},{x:[-2,2,6][PRODUCTS[c.basket[0]]?.shelf||0]-1.1,z:1.1}];
   if(!c.rear&&!c.pump&&!s.doors.front&&(a.step||0)===1){a.moving=false;return;}
   if(moveTo(goals[a.step||0]||goals.at(-1))){a.step=(a.step||0)+1;if(a.step>=goals.length){a.mode=c.rear||c.pump?'wait':'browse';a.browseTime=0;a.step=0;}}
   return;
  }
  if(a.mode==='browse'){
   const productId=c.basket[a.browseIndex];if(!a.shoppingTarget||a.shoppingTarget.id!==productId||a.shoppingTarget.browseIndex!==a.browseIndex)a.shoppingTarget={...selectProductSlot(s,productId,a.id),browseIndex:a.browseIndex};const goal=shoppingApproach(productId,c,a.spawnOrder,a.shoppingTarget);
   if(!a.pausedByTalk&&moveTo(goal,1.55,.035)){a.browseTime+=dt;a.shoppingPose=true;a.shoppingDuration=browseDuration(a);a.shoppingAction=shoppingPose(a.browseTime,a.shoppingDuration);a.yaw=a.shoppingTarget?.yaw??Math.PI/2;if(a.browseTime>a.shoppingDuration){a.browseTime=0;const productId=c.basket[a.browseIndex],category=PRODUCTS[productId].shelf;s.pickedProducts??={};s.pickedProducts[productId]=(s.pickedProducts[productId]||0)+1;s.removedShelfSlots??=[];if(a.shoppingTarget&&!s.removedShelfSlots.includes(a.shoppingTarget.key))s.removedShelfSlots.push(a.shoppingTarget.key);s.pickedStock[category]=(s.pickedStock[category]||0)+1;a.browseIndex++;a.shoppingPose=false;a.shoppingAction=null;if(a.browseIndex>=c.basket.length){a.mode='queue';a.basketReady=true;a.lineOrder=s.time;a.route=null;a.gesture=Math.min(a.gesture,2.5);}}}else if(a.pausedByTalk){a.moving=false;a.shoppingPose=a.browseTime>0;}
  }
  if(['queue','wait'].includes(a.mode)&&!c.rear&&!c.pump){if(a.pausedByTalk){a.moving=false;a.travelSpeed=0;}else{const line=checkoutLine(s),index=Math.max(0,line.indexOf(a)),goal=CHECKOUT_LINE[Math.min(index,2)];if(moveTo(goal)){a.mode=index===0?'wait':'queue';if(index===0&&!s.transaction)s.transaction=newTransaction(c);}else a.mode='queue';}}
  if(['wait','queue','browse'].includes(a.mode)){a.wait+=a.pausedByTalk?0:dt;a.gesture-=dt;if(a.gesture<=0&&!a.animation&&!a.shoppingPose&&!a.moving){a.animation={t:0};a.gesture=18+a.spawnOrder%4*3;}if(a.animation){a.animation.t+=dt;if(a.animation.t>2.2)a.animation=null;}const ownsTurn=a.mode==='wait'&&(c.rear||c.pump||s.transaction?.id===a.id);if(ownsTurn&&!a.pausedByTalk&&!s.heldId&&!s.carry&&!this.dialogueCaption?.())a.serviceWait=(a.serviceWait||0)+dt;if(a.serviceWait>420&&!a.pausedByTalk){const prev=s.actor;s.actor=a;this.decide('deny');s.actor=prev===a?null:prev;}}
 }
 query(kind){const s=this.s,c=person(s,s.actor?.id);if(!c||!openConversationModes.includes(s.actor.mode))return false;
  if(kind==='talk'){if(!s.talked.includes(c.id))s.talked.push(c.id);this.say(c.cn+'：'+c.talk);return true;}
  if(kind==='id'){if(s.heldId&&s.heldId!==c.id||s.trayId&&s.trayId!==c.id){this.notice('先把上一位顾客的证件交还。');return false;}if(!s.ids.includes(c.id))s.ids.push(c.id);s.heldId=c.id;s.trayId=null;s.idScanned=null;this.sound('paper',{pos:s.actor});this.note(c.id+':id','已接过 '+c.name+' 的证件：'+c.badge);return true;}
  return false;
 }
 ask(index){const s=this.s,c=person(s,s.actor?.id),q=c?.questions[index];if(!q||!openConversationModes.includes(s.actor.mode))return false;s.questioned[c.id]??=[];if(!s.questioned[c.id].includes(index))s.questioned[c.id].push(index);this.say(c.cn+'：'+q[1]);this.note(c.id+':q'+index,q[0]+' / '+q[1]);return q[1];}
 placeDocument(){const s=this.s;if(!s.power){this.notice('扫描座需要主电源。');return false;}if(!s.heldId){if(s.trayId){s.heldId=s.trayId;s.trayId=null;s.idScanned=null;s.idScanRemaining=0;this.sound('paper');return true;}this.notice('先面对顾客接过证件，再拿到扫描座。');return false;}if(s.trayId&&s.trayId!==s.heldId)return false;s.trayId=s.heldId;s.heldId=null;s.idScanned=null;s.idScanRemaining=2.2;s.idScreenMessage='扫描中，请稍候。';this.sound('idScan',{pos:counterXZ({x:-5.55,z:-1.52})});return true;}
 markDocument(field,mark){const s=this.s;if(!s.idScanned||!['name','birth','address','plate'].includes(field)||!['match','doubt'].includes(mark))return false;s.idMarks[field]=mark;this.sound('keyboard',{pos:counterXZ({x:-5.65,z:-1.9})});return true;}
 verifyDocument(){const s=this.s,c=person(s,s.idScanned);if(!c||!s.power||['name','birth','address','plate'].some(key=>!s.idMarks[key])){this.notice('请逐项标记姓名、生日、住址与车辆，再提交。');return false;}s.documentResults[c.id]={...s.idMarks};if(!s.checked.includes(c.id))s.checked.push(c.id);if(c.pump)s.pumpChecked=true;this.note(c.id+':registry',c.registry+' / 人工比对：'+Object.values(s.idMarks).map(m=>m==='match'?'一致':'疑点').join('、'));s.idScreenMessage='比对已保存；按 Q 离开电脑，到扫描座取回证件，交还顾客。';this.sound('idReady',{pos:{x:9.3,z:12}});return true;}
 readIdentity(){const s=this.s,id=s.heldId||s.idScanned,c=person(s,id);if(!s.power||!c){this.notice('先接过顾客的身份证，再对电脑按 E。');return false;}s.idScanned=c.id;s.idScanRemaining=0;s.idMarks={};s.checked=[...new Set([...s.checked,c.id])];if(c.pump)s.pumpChecked=true;this.note(c.id+':registry',c.registry+previousVisit(s,c));s.idScreenMessage='资料已读取；查看头像、身份资料、权限与工单，离开后面对本人 Q 还证。';this.sound('idScan',{pos:counterXZ({x:-5.65,z:-1.9})});return true;}
 lookup(){return this.readIdentity();}
 returnDocument(){const s=this.s,c=person(s,s.actor?.id);if(!c||s.heldId!==c.id){this.notice('先面对这位顾客接过他的证件。');return false;}s.heldId=null;s.idScanned=null;this.sound('paper',{pos:s.actor});this.notice('证件已交还 '+c.cn+'。');return true;}
 scanItem(index){const s=this.s,t=s.transaction;if(!s.power||!t||!s.actors.some(a=>a.id===t.id&&a.mode==='wait')||!this.hands())return false;if(!scanProduct(t,Number(index)))return false;this.sound('barcode',{pos:counterXZ({x:-7.4,z:-1.5})});s.scanItemTime=s.time;s.scanItemIndex=Number(index);if(t.stage==='cash'){const a=s.actors.find(a=>a.id===t.id);if(a)a.payStartedAt=s.time;}this.notice(PRODUCTS[t.items[index]].name+' · '+money(PRODUCTS[t.items[index]].price));return true;}
 receiveMoney(){const s=this.s;if(!s.power||!this.hands()||!takeTender(s.transaction,s.ledger))return false;this.sound('cashPaper',{pos:counterXZ({x:-8,z:-1})});const t=s.transaction;this.notice('收到 '+money(t.tender)+'。应找 '+money(t.tender-t.total)+'；找齐自动结账，未找齐可 Backspace 撤回。');if(t.tender===t.total){handChange(t,s.ledger);this.finishSale();}return true;}
 openDrawer(){const s=this.s;if(!s.power||!s.transaction||s.transaction.stage!=='change'){this.notice('先逐件扫描商品，并收下顾客的付款。');return false;}s.drawerOpen=true;this.sound('drawerOpen',{pos:counterXZ({x:-8.3,z:-1})});return true;}
 pickMoney(value,remove=false){const s=this.s;if(!s.drawerOpen||!selectCash(s.transaction,s.ledger,value,remove)){this.notice('钱箱尚未打开，或该面额现金不足。');return false;}this.sound(value<100?'coin':'cashPaper',{pos:counterXZ({x:-8.3,z:-1})});return true;}
 deliverMoney(value){const s=this.s;if(!s.power||!s.drawerOpen)return false;const result=deliverCash(s.transaction,s.ledger,value);if(!result.ok){if(result.reason==='excess'){this.notice(s.transaction.message);}else this.notice('这个面额已经用完。请选择其他面额。');return false;}this.sound(value<100?'coin':'cashPaper',{pos:counterXZ({x:-8.75,z:-1.3})});s.changeFlight={value,time:s.time};if(result.complete)this.finishSale();return true;}
 resetMoney(){const s=this.s;if(!s.power||!recallChange(s.transaction,s.ledger))return false;s.drawerOpen=true;s.changeFlight=null;this.sound('coin');this.notice(s.transaction.message);return true;}
 giveChange(){const s=this.s;if(!s.drawerOpen)return false;const ok=handChange(s.transaction,s.ledger);if(!ok){if(s.transaction.change>s.transaction.tender-s.transaction.total)this.notice(s.transaction.message);else this.say(person(s,s.transaction.id).cn+'：'+s.transaction.message.replace('顾客：',''));return false;}return this.finishSale();}
 finishSale(){const s=this.s,t=s.transaction;if(!t||t.stage!=='receipt')return false;const actor=s.actors.find(a=>a.id===t.id),c=person(s,t.id);if(!actor||!c||!finishReceipt(t,s.ledger))return false;recordGuidanceSale(s);s.lastSale={id:t.id,time:s.time,total:t.total,tender:t.tender,change:t.change};if(s.heldId===t.id||s.trayId===t.id){s.saleHandover={id:t.id,time:s.time,duration:.6};if(s.heldId===t.id)s.heldId=null;if(s.trayId===t.id)s.trayId=null;this.sound('paper',{pos:actor});}if(s.idScanned===t.id)s.idScanned=null;s.actor=actor;s.selectedId=t.id;s.revenue=(s.ledger.sales+(s.pumpRevenue||0))/100;if(!s.served.includes(c.id))s.served.push(c.id);rememberVisit(s,c,'sale');if(saleKnownUnsafe(s,c)){s.mistakes++;s.heat++;this.note(c.id+':unsafeSale','已记录明确的身体异常，仍继续接待，计入安全事故。');if(!s.eventFlags.stalkerSale){s.eventFlags.stalkerSale=true;s.stalkerDelay=20;s.stalkerSource=c.id;}this.say(c.cn+'：我们明晚还会见面。');}else this.say(c.cn+'：谢谢，路上小心。');s.drawerOpen=false;this.sound('drawerClose',{pos:counterXZ({x:-8.3,z:-1})});this.depart();this.notice('本单已结清 · 应收 '+money(t.total)+' · 实收 '+money(t.tender)+' · 已找 '+money(t.change)+(saleKnownUnsafe(s,c)?' · 安全事故：已记录身体异常，仍继续接待。':''));return true;}
 // Compatibility for pre-v11 saves and test tools; no receipt interaction is offered.
 receipt(){return this.finishSale();}

 decide(choice){const s=this.s,c=person(s,s.actor?.id);if(!c||!openConversationModes.includes(s.actor.mode)||!this.hands())return false;
  if(choice==='sale'){this.notice('请在实体收银台逐件扫码、收款并找零；金额正确会自动结账。');return false;}
  if(!['allow','deny'].includes(choice)||choice==='allow'&&!c.rear)return false;
  if(choice==='deny')return beginRefusal(this);
  if(s.heldId===c.id||s.trayId===c.id){this.notice('先交还证件，再允许进入。');return false;}
  if(c.rear&&choice==='allow'){s.mistakes++;s.heat+=2;this.say(c.cn+'：他把手从纸箱下面抽出来，箱子没有落下。你听见员工室里也有人在呼吸。');this.sound('rearScratch',{pos:{x:-6,z:16}});requestLoading(this,true);s.actor.revealed=true;this.spawnIntruder('loading',c.id);}else if(choice==='deny'){s.denied.push(c.id);if(c.human)s.mistakes++;this.say(c.cn+'：'+(c.human?'好吧，我去下一个站。':'你还会需要我的。'));}else return false;this.depart();return true;
 }
 helpPump(){const s=this.s,c=person(s,s.actor?.id);if(!c?.pump||s.actor.mode!=='wait'||s.pumpDone){this.notice('当前没有待处理的三号泵订单。');return false;}if(!s.power){this.notice('主电源中断，恢复供电后再授权。');return false;}if(!s.pumpChecked){this.notice('先接过司机证件，对柜台电脑按 E 查看身份与三号泵工单。');return false;}if(s.heldId===c.id||s.trayId===c.id){this.notice('先面对司机按 Q 归还证件，再恢复油泵。');return false;}s.pumpDone=true;s.served.push(c.id);rememberVisit(s,c,'pump');s.pumpRevenue=(s.pumpRevenue||0)+2460;s.revenue=(s.ledger.sales+s.pumpRevenue)/100;this.sound('pump');this.say('里昂：现在走数了。谢谢，我得趁道路还通着赶回去。');this.note('road-warning','北段降雪、部分路面结冰。留意县道路频道。');this.depart();return true;}
 depart(){const s=this.s,a=s.actor;if(!a)return;settleRefusal(s,a.id);rememberVisit(s,person(s,a.id),'depart');if(!s.completed.includes(a.id))s.completed.push(a.id);if(s.transaction?.id===a.id){if(a.mode==='dead'){if(s.transaction.stage==='receipt')finishReceipt(s.transaction,s.ledger);else cancelCheckout(s.transaction,s.ledger);s.revenue=(s.ledger.sales+(s.pumpRevenue||0))/100;}s.transaction=null;s.drawerOpen=false;}if(a.mode==='dead'){if(s.heldId===a.id)s.heldId=null;if(s.trayId===a.id)s.trayId=null;if(s.idScanned===a.id)s.idScanned=null;}a.pausedByTalk=false;if(a.revealed){s.actors=s.actors.filter(v=>v!==a);}else if(a.mode==='dead'){s.bodies.push({...a,deathYaw:a.yaw});s.actors=s.actors.filter(v=>v!==a);}else{a.mode='leave';a.step=0;a.route=null;}s.actor=null;s.selectedId=null;s.queue=s.completed.length;this.save('第 '+s.night+' 晚已接待 '+s.queue+' 人');}
 fire(hit){if(sequenceActive(this.s))return false;const s=this.s;if(hit?.kind==='customer')this.focus(hit.id);return super.fire(hit);}
 toggleScanner(){this.s.scannerActive=false;return false;}
 scan(){return false;}
 observe(visible){return recordBodyObservation(this,visible);}
 takeStory(){return false;}
 chooseEnding(){return false;}
 bookIncome(){const s=this.s;if(s.dayFinished)return s.history.at(-1);const sales=s.ledger.sales+(s.pumpRevenue||0),income=(s.night===3?6500:5000)+Math.round(sales*.35),penalty=Math.min(income,s.mistakes*250+s.ledger.cashErrors*25),net=income-penalty;const storeCredit=s.night===3?0:Math.round(sales*.30);s.rentFund+=net;s.wallet+=storeCredit;const ending=s.night===3?(s.rentFund>=s.rentTarget?'安全离站 · 新住处':'安全离站 · 换个地方挣'):NIGHTS[s.night].ending;const entry={night:s.night,title:NIGHTS[s.night].title,sales,income,penalty,net,storeCredit,rentFund:s.rentFund,mistakes:s.mistakes,cashErrors:s.ledger.cashErrors,ending,clue:NIGHTS[s.night].clue};s.history.push(entry);s.dayFinished=true;return entry;}
 closeNight(){const s=this.s;if(s.phase!=='dawn'||!ledgerBalanced(s.ledger)||s.dayFinished)return false;this.bookIncome();s.phase='settlement';s.campaignFinished=false;s.outcome=s.history.at(-1).ending;this.sound('receipt');this.save('第 '+s.night+' 晚结算');return true;}
 retire(){const s=this.s;if(s.night!==1||s.phase!=='settlement'||!s.dayFinished)return false;s.campaignFinished=true;s.finished=true;s.outcome='提前离职 · 换个地方挣';s.history.at(-1).ending=s.outcome;this.save('提前离职');return true;}
 siege(dt){const s=this.s;if(!isNewStory(s))return super.siege(dt);const active=s.dispatch;tickSiegeWaves(this,dt);const priorSpawn=s.spawnIn;s.spawnIn=9999;s.dispatch=false;super.siege(dt);s.spawnIn=priorSpawn;s.dispatch=active;if(s.finished||s.deathCinematic)return;if(active)s.rescue=Math.max(0,s.rescue-dt);if(active&&s.rescue<=0){s.narrative.flags.withdrawnThreats=s.threats.filter(t=>t.hp>0).length;s.threats=s.threats.filter(t=>t.hp<=0);s.phase='evacuation';if(s.hidden)this.leaveHide();s.narrative.stage='arrival';this.sound('rescue');beginSequence(this,'arrival');}}
 buy(id){const s=this.s,p=BUYABLES.find(p=>p.id===id);if(s.phase!=='settlement'||s.campaignFinished||!p||(s.purchases[id]||0)>=p.max||s.wallet<p.cost)return false;if(['circuit','scanner'].includes(id)&&s.upgrades[id])return false;s.wallet-=p.cost;s.purchases[id]=(s.purchases[id]||0)+1;if(id==='boards')s.supplies.boards+=2;else if(id==='traps')s.supplies.traps++;else s.upgrades[id]=true;this.sound('keyboard');this.save('夜间补给已购买');return true;}
 nextNight(){const old=this.s;if(old.phase!=='settlement'||old.campaignFinished)return false;this.s=campaignState(old.night+1,old);this.s.boards+=this.s.supplies.boards+Math.max(0,old.boards-6);this.s.traps=0;this.s.supplies={boards:0,traps:0};this.s.scannerOwned=false;this.s.binocularOwned=old.binocularOwned;this.s.doorKeyOwned=old.doorKeyOwned;this.s.torchOwned=true;this.s.torch=true;this.s.gunOwned=old.gunOwned;this.s.ammo=old.ammo;this.s.debugUsed=old.debugUsed;this.s.paused=true;if(this.s.night===3){this.s.player={x:15.1,z:13.7,yaw:-Math.PI/2,pitch:0};this.s.phone=true;this.s.checkpointLabel='白天轮休后 · 等候安全离站';}beginSequence(this,this.s.night===2?'transition2':'transition3');this.save('第 '+this.s.night+' 晚开班');return true;}
 evacuateCustomers(){const s=this.s;for(const a of [...s.actors]){const c=person(s,a.id);if(!c.human||!occupied(a))continue;settleRefusal(s,a.id);if(s.transaction?.id===a.id){if(s.transaction.stage==='receipt')finishReceipt(s.transaction,s.ledger);else cancelCheckout(s.transaction,s.ledger);s.transaction=null;s.drawerOpen=false;}if(s.heldId===a.id)s.heldId=null;if(s.trayId===a.id){s.trayId=null;s.idScanned=null;s.idScanRemaining=0;}if(!s.completed.includes(a.id))s.completed.push(a.id);a.pausedByTalk=false;a.mode='leave';a.step=0;a.route=null;a.emergencyExit=true;}s.queue=s.completed.length;}
 spawnIntruder(side,sourceId=null){const s=this.s;if(s.threats.some(t=>t.mode!=='dead'))return;const pos=side==='loading'?{x:-6,z:20.7}:{x:DOORS.front.x,z:-8};this.evacuateCustomers();s.threats.push({id:'intruder-'+s.night+'-'+s.threats.length,sourceId:sourceId||(side==='loading'?'rowan':'wade'),...pos,yaw:0,hp:2,mode:'outside',side,stun:0,bash:0,route:null,repath:0,search:0});this.say(side==='loading'?'后门的人抬起头。现在先甩开它，利用门、木板或武器；完成当晚报告后调度会介入。':'前门外传来与刚才那位顾客完全相同的脚步声。门在摇晃。');this.sound('growl',{pos});}
 horror(dt){const s=this.s;if(!['customers','incident','outage','siege'].includes(s.phase))return;s.horrorClock-=dt;if(s.shadow&&s.time>s.shadow.until)s.shadow=null;if(s.horrorClock>0)return;const count=Object.keys(s.eventFlags).length,key='h'+count;s.eventFlags[key]=true;s.horrorClock=(s.upgrades.circuit?55:38)+(count%3)*8;
  const events=[()=>{this.sound('distantStep',{pos:{x:-6,z:14}});this.notice('后仓传来两步脚声，随后停住。');},()=>{s.shadow={x:8,z:-7,until:s.time+1.8};this.sound('canopyCreak',{pos:{x:8,z:-9}});},()=>{s.flickerUntil=s.time+.7;this.sound('lightFlicker',{pos:{x:0,z:4}});},()=>{this.sound('radioWhisper',{pos:SITE.radio});this.notice(s.night===1?'无线电杂讯里，有人轻敲了两下话筒。':s.night===2?'道路广播：北段降雪，注意路面结冰；不要跟随没有核实身份的人员进入后方。':'无线电里传来与你呼吸同拍的气流声，话筒没有被按下。');}];events[(count+s.night-1)%events.length]();
 }
 buildBoard(dt,held){return buildProgress(this,dt,held);}
 load(snapshot){if(snapshot?.schema!==1||!snapshot.player||!snapshot.crates)return false;if(snapshot.storyVersion!==14){this.notice('这是旧剧情存档，仍已保留。新版请从第一晚开始，避免混入旧主线。');return false;}const defaults=campaignState(snapshot.night||1);this.s={...defaults,...JSON.parse(JSON.stringify(snapshot)),paused:true,scannerActive:false,scanProgress:0};this.s.cast=nightCast(this.s.night);if(!snapshot.freight)this.s.freight={...FREIGHT_PARK,phase:this.s.night===3?'gone':'ready',time:0,open:1};this.s.ammoCapacity=PISTOL_CAPACITY;if(snapshot.ammoCapacity==null)this.s.ammo=Math.min(PISTOL_CAPACITY,(snapshot.ammo??4)+4);this.s.restFood??={water:2,snack:2};this.s.campaignVersion=14;this.s.scannerOwned=false;this.s.scannerActive=false;this.s.scanProgress=0;this.s.scans={};this.s.sensorPulseSeen={};for(const key of Object.keys(this.s.evidence||{}))if(key.endsWith(':scan'))delete this.s.evidence[key];if(this.s.upgrades)this.s.upgrades.scanner=false;if(this.s.campaignFinished)this.s.finished=true;if(this.s.night===3&&this.s.phase==='evacuation')this.s.threats=this.s.threats.filter(t=>t.hp<=0);this.s.history.forEach(h=>{if(h.night===2&&/模仿自己的脸/.test(h.clue||''))h.clue=NIGHTS[2].clue;});this.s.doors.stockRight??=true;if(snapshot.loadingLift==null){this.s.loadingLift=this.s.doors.loading?1:0;this.s.loadingTarget=!!this.s.doors.loading;}if(this.s.trayId){this.s.heldId=this.s.trayId;this.s.trayId=null;this.s.idScanned=null;}this.s.actors.forEach(a=>{a.pausedByTalk=false;a.shoppingAction=null;});this.s.actor=this.s.actors.find(a=>a.id===this.s.selectedId)||null;this.s._lastPower=this.s.power;if(this.s.narrative.sequence){const q=this.s.narrative.sequence;if(snapshot.sessionResume&&q.index>=0){q.resumeLine=true;q.elapsed=0;}else{q.index=-1;q.elapsed=0;q.total=0;}}if(this.s.narrative.sequence?.key==='arrival')clearRescueBusLane(this.s);delete this.s.sessionResume;return true;}

}
export function campaignTask(s){
 const narrative=storyTask(s);if(narrative)return narrative;
 if(s.briefed&&!s.manifest&&!freightReady(s))return{title:'配送车正在入位',detail:'等货车停稳、尾门和踏板放下。随后到卸货口右侧签收配送单 E；请勿站在车道或车尾。'};
 if(s.phase==='settlement')return{title:'第 '+s.night+' 晚结束',detail:'工资已存入租房基金；店铺资金可购买补给，再继续下一段剧情。'};
 if(s.refusal)return{title:'结束接待',detail:'正在归还证件与付款，随后顾客会离开。'};
 if(s.hidden||s.carry||s.boardCarry||s.trapCarry)return null;
 if(s.heldId)return{title:'拿着 '+person(s,s.heldId).cn+' 的证件',detail:s.checked.includes(s.heldId)?'把证件交还本人：面对本人按 Q 直接归还。':'拿着证件，对收银台电脑按 E 读取；直接查看头像、身份、权限与工单。看完按 Q 离开电脑，面对本人按 Q 还证。'};
 if(s.trayId)return{title:'核验证件',detail:'对收银台电脑按 E 读取资料；看完面对本人按 Q 归还证件。'};
 if(s.phase==='customers'&&s.threats.some(t=>t.mode!=='dead'))return{title:'暂停营业 · 脱离追踪',detail:s.emergencyRemaining?'巡逻车约 '+Math.ceil(s.emergencyRemaining)+' 秒后到路口。利用门、木板切断视线；先切断敌人视线再躲柜；被看见进入的柜子会被搜查。':'先去员工室无线电按 E 报警。停止接客，取仓库防守材料；枪只用于迫近的攻击。'};
 const focus=person(s,s.actor?.id);
 if(s.actor?.pausedByTalk&&focus)return{title:focus.rear?'核实后门来客 · '+focus.cn:focus.pump?'核实三号泵 · '+focus.cn:'与'+focus.cn+'交谈',detail:focus.rear?'核对今晚名单与派工安排；1 听来意，3 追问，Q 结束。不要为核验先开门。':focus.pump?'2 接过证件，到柜台电脑核对工单；面对司机 Q 还证后，到三号泵按 E 恢复授权。听来意与追问可选。':'1 听来意，2 证件，3 追问。观察自然动作；Q 结束交谈后再操作收银。'};
 if(focus?.pump&&s.actor?.mode==='wait')return{title:s.pumpChecked?'恢复三号泵授权':'核对三号泵订单',detail:s.pumpChecked?'证件已核验并归还。到店外右侧标有 3 的油泵屏幕按 E，核对订单再按 E 恢复授权。':'面对司机按 E，选择「请出示证件」；带到收银台电脑按 E 核对身份与三号泵工单。'};
 if(s.phase==='outage')return{title:'照明断电',detail:'F 打开手电。从玻璃前门出去，沿建筑右侧微弱路灯到红色电闸箱按 E。后方卸货院不可通往电闸。'};
 const t=s.transaction;if(t&&s.phase==='customers')return{title:'收银 · '+person(s,t.id).cn,detail:t.stage==='scan'?`柜台商品 ${t.scanned.length}/${t.items.length} 已扫描。逐件瞄准商品按 E，自动移过实体扫描器。`:t.stage==='cash'?'商品已扫描，收下柜台上的现金 E。':t.stage==='change'?`打开收银机 E 进入固定视角，鼠标点击钱箱直接交付。应收 ${money(t.total)}，实收 ${money(t.tender)}，应找 ${money(t.tender-t.total)}，已找 ${money(t.change)}；找齐自动离场，未找齐时 Q 可退出。`:'金额已正确，交易正在自动结束。'};
 if(s.phase==='customers'&&s.frontLocked&&s.actors.some(a=>a.mode==='leave'&&!person(s,a.id)?.rear&&!person(s,a.id)?.pump))return{title:'顾客在等你开门离开',detail:'前门仍锁着。威胁解除后用柜台按钮解锁前门，让已结账或紧急撤离的顾客离场，限流闸才会放行下一批。'};
 if(s.phase==='customers'&&s.frontLocked&&s.actors.some(a=>a.mode==='arrive'&&!person(s,a.id)?.rear&&!person(s,a.id)?.pump))return{title:'打开前门接待',detail:'顾客正在店门外等待。拉开柜台安全抽屉，拿门控钥匙并用按钮解锁；三人限流控制后续来客。'};
 if(s.phase==='customers'&&['arrive','exit','enter','depart'].includes(s.visitCar?.phase))return{title:s.visitCar.blocked?'让开车辆行驶路线':s.visitCar.phase==='arrive'?'车辆正在驶入':s.visitCar.phase==='exit'?'司机正在下车':'司机正在离站',detail:'等车辆停稳、司机下车呼叫后再去帮忙；可以先做店内工作。'};
 const received=s.crates.find(c=>c.received&&['warehouse','floor'].includes(c.place));
 if(received&&['opening','customers'].includes(s.phase)&&!s.transaction)return{title:'抱起已验收货箱',detail:'验好的箱子在验货台旁地面。对箱子按 E 再抱起，拿到对应的高亮货格按 E 上架；无需重复验收。'};
 if(s.phase==='customers'&&s.completed.length===s.cast.length)return !openingDone(s)?{title:'完成打烊前的工作',detail:`货物 ${stockCount(s)}/${stockGoal(s)} · 清洁 ${s.clean.length}/3。补齐剩余货箱，清理营业区三处污渍，才能结束当班。`}:{title:'等候最后的来客离站',detail:'本晚接待与整理已完成。保持前门畅通，让客人和车辆离开；随后按新的交接提示操作。'};
 if(s.phase==='customers')return{title:'第 '+s.night+' 晚 · '+NIGHTS[s.night].title,detail:`接待 ${s.completed.length}/${s.cast.length} · 站点同时最多三位。顾客会挑选再排队；可在等待时询问、拿证件核验和继续补货。上架 ${stockCount(s)}/${stockGoal(s)}，清洁 ${s.clean.length}/3。`};
 return null;
}
