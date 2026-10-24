import {clearRescueBusLane} from './collision-system.js';
import {STORY_VERSION,STORY_SCRIPTS,STORY_POINTS,storySpeaker,RENT_START,RENT_TARGET} from './story-data.js';
import {SITE} from './site-layout.js';
import {DOORS} from './data.js';
import {startBlackout} from './door-system.js';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const isNewStory=s=>s?.storyVersion===STORY_VERSION;
export function initStory(s,carry){
 s.storyVersion=STORY_VERSION;s.rentFund=carry?.rentFund??RENT_START;s.rentTarget=RENT_TARGET;
 s.narrative={stage:s.night===3?'waitingBrief':'working',clockMinutes:s.night===3?1335:8,sequence:null,clock:0,flags:{},savedPlayer:null};
 s.scriptCast=[];s.businessClosed=s.night===3;
 if(s.night===3){s.cast=[];s.crates.forEach(c=>{c.received=true;c.place='shelf';});s.clean=[0,1,2];s.manifest=true;s.incidentStep=2;s.story.night3='暂停营业 / 接应需通过原道路频道核实';}
 return s;
}
export function sequenceActive(s){return !!s.narrative?.sequence;}
export function beginSequence(g,key){
 const s=g.s,n=s.narrative;if(n.sequence)return false;if(s.hidden&&g.leaveHide)g.leaveHide();
 if(key==='arrival')clearRescueBusLane(s);g.onSequenceStart?.();n.sequence={key,index:-1,elapsed:0,total:0};n.savedPlayer={...s.player};
 s.scannerActive=false;s.binocularActive=false;s.gunDrawn=false;s.moving=false;s.boardBuild=null;
 s.hidden=false;s.hideExposed=false;if(key==='arrival'){n.flags.busArrivalAt=s.time;g.sound('engineStart',{pos:STORY_POINTS.stop});}g.save('剧情 · '+key);return true;
}
function marker(g,text){g.note('story:'+g.s.night+':'+g.s.narrative.stage,text);}
function stepSequence(g,dt){
 const s=g.s,n=s.narrative,q=n.sequence,steps=STORY_SCRIPTS[q.key];if(!steps){n.sequence=null;return;}
 if(q.index<0||q.resumeLine){q.index=Math.max(0,Math.min(steps.length-1,q.index));q.elapsed=0;delete q.resumeLine;const l=steps[q.index];g.say(storySpeaker(l)+'：'+l.text,{actorId:l.actor,scope:'story'});}
 q.elapsed+=dt;q.total+=dt;const l=steps[q.index];
 if(q.key==='encounter'){
  const worker=n.worker;
  if(l.shot==='transform'&&worker){worker.revealed=true;worker.shoppingPose=false;n.flags.transform=true;}
  if(l.shot==='escape'){
   if(!n.flags.frontBreached){n.flags.frontBreached=true;s.frontLocked=false;s.frontManual=true;s.frontSlide=1;s.doors.front=true;s.barricades.front=0;g.sound('break',{pos:DOORS.front});}
   if(worker){worker.moving=true;worker.travelSpeed=9;const points=[{x:-3.35,z:5.8},{x:-3.35,z:-3.1},{x:.5,z:-3.1},{x:.5,z:-7.8}],lengths=points.slice(1).map((p,i)=>dist(p,points[i])),total=lengths.reduce((a,b)=>a+b,0);let d=Math.min(total,q.elapsed/2.15*total),i=0;while(i<lengths.length-1&&d>lengths[i]){d-=lengths[i++];}const a=points[i],b=points[i+1],u=Math.min(1,d/lengths[i]);worker.x=a.x+(b.x-a.x)*u;worker.z=a.z+(b.z-a.z)*u;worker.yaw=Math.atan2(b.x-a.x,b.z-a.z);if(q.elapsed>2.2)worker.exited=true;}
  }
 }
 const min=l.hold||Math.max(2.7,l.text.length*.22+.9);
 if(q.elapsed<min||g.storyVoiceBusy?.())return;
 q.index++;q.elapsed=0;
 if(q.index<steps.length){const next=steps[q.index];g.say(storySpeaker(next)+'：'+next.text,{actorId:next.actor,scope:'story'});return;}
 const key=q.key;n.sequence=null;s.subtitleUntil=s.time;
 if(n.savedPlayer){s.player={...n.savedPlayer};n.savedPlayer=null;}
 finishSequence(g,key);
}
function finishSequence(g,key){
 const s=g.s,n=s.narrative;
 switch(key){
  case 'callback':n.stage='review1';s.phone=false;break;
  case 'review1':n.stage='report1';s.story.night1='假调班电话 / 柜台电话录像';marker(g,s.story.night1);break;
  case 'report1':s.phase='dawn';n.stage='settle';s.threats.forEach(t=>t.mode='dead');break;
  case 'encounter':n.worker=null;n.stage='restorePower';s.phase='outage';s.frontManual=false;s.frontSlide=0;s.doors.front=false;s.frontLocked=false;g.say('亚历克斯：它出去了……先把灯弄回来。',{actorId:'alex',scope:'story'});g.save('第二晚 · 演出结束，现在可拉闸');break;
  case 'report2':n.stage='review2';break;
  case 'review2':s.story.night2='员工服人影 / 学来的声音 / 它在模仿亚历克斯';marker(g,s.story.night2);s.phase='dawn';n.stage='settle';s.threats.forEach(t=>t.mode='dead');break;
  case 'briefing3':n.stage='prepare3';s.phase='preparation';s.briefed=true;s.phone=false;s.frontLocked=true;s.frontManual=false;marker(g,'接应：N9，从店前公路左侧来，停原公交站。未到站前须在原频道确认。');break;
  case 'falseBen':n.stage='checkFront';break;
  case 'pickup':n.stage='verifyPickup';marker(g,'作业服来客催促去后方，与店前公交站的约定矛盾。先到电台回拨原道路频道。');break;
  case 'verify':n.stage='confrontPickup';n.clock=0;n.flags.pickupVerified=true;break;
  case 'exposed':n.stage='survive';s.phase='siege';s.dispatch=true;s.rescue=210;s.preparation=22;s.spawnIn=18;s.actors=s.actors.filter(a=>!a.scripted);s.actor=null;s.selectedId=null;g.save('第三晚 · 识破假接应，等候真实车辆');break;
  case 'arrival':n.stage='checkArrival';s.phase='evacuation';s.threats.forEach(t=>t.mode='dead');s.hidden=false;n.flags.busArrived=true;break;
  case 'epilogueHome':case 'epilogueRoom':n.stage='coda';beginSequence(g,'coda');break;
  case 'coda':n.stage='complete';s.phase='settlement';s.campaignFinished=true;s.finished=true;s.dayFinished=true;s.outcome=s.history.at(-1)?.ending||'安全离站';g.save('新版三晚完成');break;
 }
 g.save('剧情节点 · '+n.stage);
}
export function startClosing(g){
 const s=g.s,n=s.narrative;s.businessClosed=true;s.actors=[];s.actor=null;s.selectedId=null;s.threats.forEach(t=>t.mode='dead');s.incidentTime=0;
 if(s.night===1){s.phase='callback';n.stage='callback';s.phone=true;g.say('收尾时，柜台电话响了。来电是本，先接听再交班。');g.sound('ring');}
 else{
  const shutterWasOpen=(s.loadingLift||0)>.5;
  s.phase='investigate';startBlackout(s);s._lastPower=false;n.stage='findWorker';n.clock=0;
  // The pre-existing shutter is forced up; no geometry or collision layout changes.
  s.loadingLift=1;s.loadingTarget=true;s.loadingBroken=false;s.doors.loading=true;
  n.worker={id:'story-worker',x:STORY_POINTS.worker.x,z:STORY_POINTS.worker.z,yaw:Math.PI/2,mode:'story',scripted:true,shoppingPose:true,browseTime:0,shoppingDuration:5.1,spawnOrder:2,moving:false};
  s.scriptCast=[{id:'story-worker',human:false,cn:'员工服人影',height:'181 cm',camouflage:'perfect',anomaly:'joint',night:2,revealStyle:'flesh'}];
  marker(g,(shutterWasOpen?'卸货门还敞着，后仓传来拖箱声。':'后门传来金属撞击，卸货门被外力顶起。')+'最后一位顾客已离开，店里没有第二位员工。');
  g.sound('rearScratch',{pos:SITE.loading});g.sound('blackout');g.say('营业区还有摆货声。先打开手电，确认货架之间的人影，再处理供电。');
 }
 g.save('第 '+s.night+' 晚 · 收尾事件');
}
export function storyAvailable(s,t){
 if(!isNewStory(s))return null;const n=s.narrative;
 if(n.sequence)return false;
 if(t.id==='storyItem')return false;
 if(t.id==='coin'&&s.businessClosed)return false;
 if(t.id==='breaker')return s.night===2&&n.stage==='restorePower'&&!s.power;
 if(t.id==='actor'&&t.key==='story-worker')return n.stage==='findWorker';
 if(t.id==='actor'&&t.key==='cal'&&s.night===3)return n.stage==='pickup';
 if(s.night===3&&['manifest','crate','receiving','shelf','clean','pump','checkoutItem','tender','drawer','cashNote','register'].includes(t.id))return false;
 if(t.id==='phone')return s.phone;
 if(t.id==='finish')return s.night<3&&s.phase==='dawn';
 if(t.id==='evacuate')return s.night===3&&n.stage==='boardBus'&&!!n.flags.busConfirmed;
 if(t.id==='radio')return ['report1','report2','prepare3','verifyPickup','confrontPickup'].includes(n.stage)||s.phase==='customers'&&s.threats.some(a=>a.mode!=='dead')&&!s.emergencyRemaining;
 if(['boards','barricade','hide'].includes(t.id)&&s.night===3)return t.id==='boards'?s.boards>0&&!s.boardCarry:t.id==='hide'?true:!!s.boardCarry&&['front','loading'].includes(t.key)&&s.barricades[t.key]<3;
 if(t.id==='door'&&t.key==='front'&&['preparation','pickup','evacuation'].includes(s.phase))return !s.frontLocked&&!s.barricades.front;
 return null;
}
export function storyAct(g,id,key){
 const s=g.s;if(!isNewStory(s))return null;const n=s.narrative;
 if(n.sequence)return false;
 if(['phone','monitor','radio'].includes(id)&&(s.carry||s.boardCarry||s.trapCarry)){g.hands();return false;}
 if(id==='storyItem')return false;
 if(id==='phone'&&s.phone){
  if(s.night===1&&n.stage==='working')n.flags.moneyMutterAt=s.time+45;
  if(n.stage==='callback'){s.phone=false;g.sound('phoneOff');return beginSequence(g,'callback');}
  if(s.night===3){s.phone=false;g.sound('phoneOff');return beginSequence(g,'briefing3');}
 }
 if(id==='monitor'){
  if(n.stage==='review1')return beginSequence(g,'review1');
  if(n.stage==='review2')return beginSequence(g,'review2');
  if(n.stage==='checkFront'){
   n.stage='pickup';s.phase='pickup';s.scriptCast=[{id:'cal',cn:'作业服来客',human:false,height:'187 cm',night:3,camouflage:'perfect',anomaly:'joint',revealStyle:'flesh'}];
   s.actors=[{id:'cal',...STORY_POINTS.impostor,yaw:0,mode:'story',scripted:true,spawnOrder:1,moving:false}];return beginSequence(g,'pickup');
  }
  if(n.stage==='checkArrival'){n.flags.busConfirmed=true;n.stage='boardBus';marker(g,'前场监控已看见车号 N9，停在原公交站，与电台到站确认一致。到站牌旁按 E 上车。');g.say('亚历克斯：看见车号了。就在原公交站，走前面。',{actorId:'alex',scope:'story'});g.save('真实接应已核实');return false;}
 }
 if(id==='actor'&&key==='story-worker'&&n.stage==='findWorker')return beginSequence(g,'encounter');
 if(id==='actor'&&key==='cal'&&s.night===3&&n.stage==='pickup')return beginSequence(g,'pickup');
 if(id==='breaker'){
  if(n.stage!=='restorePower')return false;
  s.power=true;s.repair=true;s.phase='incident';n.stage='report2';s.loadingBroken=false;
  g.sound('power',{pos:SITE.breaker});g.say('亚历克斯：灯亮了。回员工室联系老板，我要离开。',{actorId:'alex',scope:'story'});g.save('第二晚 · 供电恢复，停止营业');return true;
 }
 if(id==='radio'){
  const route={report1:'report1',report2:'report2',prepare3:'falseBen',verifyPickup:'verify',confrontPickup:'exposed'};
  if(route[n.stage])return beginSequence(g,route[n.stage]);
 }
 if(id==='evacuate'){
  if(n.stage!=='boardBus'||!n.flags.busConfirmed||dist(s.player,STORY_POINTS.stop)>3.1)return false;
  if(s.carry||s.boardCarry||s.trapCarry){g.notice('先按 Q 放下手里的东西，再上车。');return false;}
  g.bookIncome();n.stage='epilogue';return beginSequence(g,s.rentFund>=s.rentTarget?'epilogueHome':'epilogueRoom');
 }
 return null;
}
export function tickStory(g,dt){
 const s=g.s;if(!isNewStory(s))return false;const n=s.narrative;
 if(n.sequence){stepSequence(g,dt);return true;}
 if(s.night===1&&['opening','customers'].includes(s.phase)&&n.flags.moneyMutterAt!=null&&!n.flags.moneyMutter&&s.time>=n.flags.moneyMutterAt&&!g.storyVoiceBusy?.()){n.flags.moneyMutter=true;g.say('亚历克斯：还差一点。三班应该够了。',{actorId:'alex',scope:'story'});}
 if(s.night===2&&n.stage==='findWorker'){
  n.clock+=dt;const a=n.worker;if(a){a.browseTime=n.clock%5.1;}
  if(Math.floor(n.clock/4)!==n.lastWorkSound){n.lastWorkSound=Math.floor(n.clock/4);g.sound(n.lastWorkSound%3===0?'boxLift':n.lastWorkSound%3===1?'shelfStock':'foot',{pos:STORY_POINTS.worker,surface:0});}
  if(a&&dist(s.player,a)<3.4){const dx=a.x-s.player.x,dz=a.z-s.player.z,len=Math.hypot(dx,dz),dot=(-Math.sin(s.player.yaw)*dx-Math.cos(s.player.yaw)*dz)/len;if(dot>.73&&(g.canSee?g.canSee(s.player,a,s):true)){beginSequence(g,'encounter');}}
  return true;
 }
 if(s.night===3&&n.stage==='confrontPickup'){n.clock+=dt;if(n.clock>3)beginSequence(g,'exposed');return true;}
 if(s.night===3&&['preparation','pickup','evacuation','epilogue'].includes(s.phase))return true;
 if(['callback'].includes(s.phase))return true;
 return false;
}
export function storyTask(s){
 if(!isNewStory(s))return null;const n=s.narrative;
 if(n.sequence)return {title:n.sequence.key==='encounter'?'谁还在上班':'第 '+s.night+' 晚 · 剧情',detail:'固定镜头演出中；Esc 可暂停。字幕与对白逐句播放，演出结束恢复操作。'};
 if(s.night===3&&n.stage==='waitingBrief')return {title:'接听接应安排',detail:'你仍在员工室。穿过仓库回营业区，接听收银台响铃的电话 E，确认接应车辆与核实频道。商店保持停业。'};
 const rows={callback:['接听本的电话','收尾电话在收银台。靠近响铃的座机按 E。'],review1:['查看柜台录像','去营业区左墙监控屏按 E，确认假调班电话是谁拨出的。'],report1:['报告假调班','到右侧员工室，对无线电按 E，核实本的班次。'],findWorker:['营业区还有声音','F 打开手电，沿拖箱与摆货声查看饮料货架旁的人影。靠近货架，先确认是谁在里面。'],restorePower:['恢复供电','它已逃出前门。F 打开手电，从前门出去，沿建筑右侧弱灯到红色电闸按 E；停电前门可手动推开。'],report2:['我要离开这里','供电恢复。沿来路回到店前，从玻璃正门进店，再穿过仓库右侧门到员工室，用无线电联系老板，请求离站。后方卸货院有围栏，不可穿行。'],review2:['确认后门是否还有人','回营业区左墙监控屏按 E，查看入店前的后门录像。'],prepare3:['暂停营业 · 准备离站','拿取工具、检查门锁；木板在后仓右侧，可加固两扇外门。准备好后到员工室电台 E 确认接应进展。'],checkFront:['先确认门外是谁','本没有安排前来。到营业区监控屏 E 查看前场，不要直接开门。'],pickup:['隔门核实来客','作业服来客声称车在后面。不要跟随，先听完再回拨原道路频道。'],verifyPickup:['回拨核实接应','去右侧员工室电台 E。约定接应在店前公交站，而他说在后面。'],confrontPickup:['等待原频道确认','保持门锁，听县道路联络核实；不要跟来客去后方。'],checkArrival:['确认真实接应车辆','县道路频道已确认车辆到站。去营业区左墙监控屏 E，核对原公交站的位置与车号 N9。'],boardBus:['到原公交站上车','真实车辆已核实。放下木板、收起设备；需要时拆下前门木板、用柜台按钮解锁，从店前去左侧原公交站，对车辆按 E 上车。'],complete:['安全离站','查看三晚工资与租房基金结算。']};
 if(n.stage==='boardBus'){
  if(s.hidden)return {title:'离开躲藏处，准备上车',detail:'真实接应已核实。先按 E 离开储物柜，再检查前门通路。'};
  if(s.boardCarry||s.carry)return {title:'准备上车 · 放下手中材料',detail:'Q 放下货箱或把木板放回材料堆。离站不需要带货，随后检查前门通路。'};
  if(s.barricades.front)return {title:'拆下前门加固木板',detail:`接应已核实。到玻璃正门内侧，对木板按 E 逐块拆下（还剩 ${s.barricades.front} 块），然后解锁前门。`};
  if(s.frontLocked)return {title:'解锁前门，准备离站',detail:!s.securityOpen?'回柜台下的安全抽屉，按 E 拉开；'+(s.doorKeyOwned?'再对抽屉旁固定门控按钮按 E 解锁。':'取出门控钥匙，再对旁边固定按钮按 E 解锁。'):!s.doorKeyOwned?'从打开的安全抽屉取门控钥匙，再对旁边固定按钮按 E 解锁。':'对安全抽屉旁的门控按钮按 E 解锁。'};
  if(!s.doors.front)return {title:'打开前门离站',detail:'走到店铺玻璃正门，对门按 E 开启。这时感应已停用；出去后到左侧原公交站，面对 N9 按 E 上车。'};
 }
 if(s.hidden&&s.night===3&&s.phase==='siege'&&s.hideExposed)return {title:'它记住了这个柜子',detail:'追踪者看见你进入了这里，会靠近搜查。E 立即离开，利用门和拐角切断视线后再躲藏。'};
 if(s.hidden&&s.night===3&&s.phase==='siege')return {title:'躲藏中 · 等候接应',detail:'保持安静。通路恢复预计还需 '+Math.ceil(s.rescue)+' 秒；E 可以离开躲藏处。等八频道确认真实车辆到站，再核实并离站。'};
 if(s.boardCarry||s.carry||s.hidden)return null;
 if(rows[n.stage])return {title:rows[n.stage][0],detail:rows[n.stage][1]};
 if(s.phase==='siege')return {title:'守到通路恢复',detail:'约 '+Math.ceil(s.rescue)+' 秒。用门、木板与躲藏自保，手枪留作紧急处置。等八频道确认 N9 到站，再到监控屏核实。'};
 if(s.phase==='dawn')return {title:s.night===1?'第一晚结束':'白天暂歇 · 等待通路恢复',detail:'回员工室无线电按 E 结算。个人工资存入租房基金，店铺资金单独用于补给。'};
 return null;
}
