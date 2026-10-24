import {CUSTOMERS} from './data.js';
import {PRODUCTS} from './product-catalog.js';
export {PRODUCTS} from './product-catalog.js';
export const money=c=>'$'+(c/100).toFixed(2);
export const DENOMINATIONS=[2000,1000,500,100,25,10,5,1];
export const initialTill=()=>({'2000':2,'1000':4,'500':4,'100':25,'25':30,'10':30,'5':20,'1':100});
export const tillValue=t=>Object.entries(t).reduce((sum,[value,count])=>sum+Number(value)*count,0);
export const BASKETS={june:['coffee','water','water'],wade:['soup','soup','chips'],nora:['milk','bread','water'],rowan:[],leon:[],milo:['batteries','coffee']};
export {STORY_NIGHTS as NIGHTS} from './story-data.js';
const dialogues={
 june:[['哪条路过来的？','西桥养护通道。今晚在检查结冰情况。'],['和谁一起工作？','县养护队。我已经下班，没有进你们仓库的工作安排。'],['昨晚路况怎么样？','昨晚雾大，路还通着。现在已经下雪，桥面会更滑。']],
 wade:[['车停在哪里？','后门外。别看前面的车，那不是我开的。'],['冷库今晚开工吗？','一直开着。里面不需要开灯，东西也不会坏。'],['为什么要走后门？','从你们这里穿过去更近。你不会让我绕路吧。']],
 nora:[['从医院过来？','县医院东楼。我的换证申请也在那里盖过章。'],['有没有同行的人？','只有我。返程路上开始结冰，我想买点热的。'],['为什么提醒我杯子？','热饮别放在电器旁边。我们那边有人因此烫伤过手。']],
 rowan:[['谁安排你来的？','老板。我们刚通完电话，你不会连他的声音都听不出来吧。'],['你的员工编号？','EMP-091。资料是真的，你尽管拿去查。'],['今晚应该有几位员工？','你一个人。所以我才来替你，你把门开开。']],
 leon:[['付款有没有重复？','没有，只付了一次，尾号 2305，卡也是这张。'],['路上看见过谁？','路边有个人向车招手，我没停。这里的灯比路上可靠。'],['天气预报怎么说？','北面有雪，公路还在通行。要变天了，别往高速上走。']],
 milo:[['是谁报的修？','调度员。她说你会需要我，时间不会错。'],['准备修什么？','无线电。先让我进去，不用再核实。'],['你来过几次？','我一直在等这里缺人。你一个人工作，不累吗？']],
 edith:[['为什么晚上出门？','接孙女回家，路上买些茶和饼干。'],['拐杖用了多久？','膝盖旧伤，走急了不行。我慢慢挑就好。'],['今晚谁和你同行？','只有我。别着急，我把零钱数清楚。']],
 owen:[['帽子哪里买的？','骑行协会发的，帽檐正好能挡点风雪。'],['见过送货车吗？','车在后面，司机已经卸好待签收的货了。'],['以前来过这里吗？','昨天路过。今天第一次停下来买东西。']],
 ruth:[['今天下班了吗？','下班了，现在只是买东西，没有给你派工。'],['天气会影响通行吗？','北段在结冰，返程班车可能停。按县道路频道的通行通知走，别跟陌生车抄近路。'],['怎么确认你的身份？','查今晚的轮值登记。证件也不代表能进后仓。']],
 cal:[['是谁报修的？','老板刚叫我的。你不用再打电话。'],['员工室在什么位置？','上面。你刚才在那里看着我。'],['有检修工单吗？','先让我进去。单子明天补给你。']]
};
export function nightCast(night=1){
 if(night===3)return [];
 const order=night===2?['nora','ruth','june','rowan','cal','wade','leon','milo']:['june','wade','edith','nora','owen','rowan','leon','milo'];
 return order.map(id=>{
  const base=CUSTOMERS.find(c=>c.id===id),c={...base,questions:dialogues[id].map(q=>[...q]),basket:[...(BASKETS[id]||base.basket)],cash:({june:1000,wade:1000,nora:1000,milo:2000})[id]||base.cash||0};
  const talks={june:'西桥刚收工。手冻得有点抖，让我把硬币数清楚。',wade:'门口的路我走不惯。别担心，资料都是真的。你可以查。',nora:'我的证件浸过水，换证申请可以查。还有，热饮别放在电器旁边。',rowan:'我知道你今晚一个人。让我进去，剩下的我来做。',leon:'我没再按第二次付款。订单还是待处理，尾号 2305。',milo:'你还没有报修？那是我来早了。先让我看看无线电。',edith:'走得慢，零钱也数得慢。你刚上班吧？别紧张，我不催。',owen:'骑到这里才发现水快喝完了。广告牌边有人招手，我以为是你们员工。',ruth:'今晚没有临时派工。外面要变天了，先留意道路通知。',cal:'上面还有一间员工室，门没关。我在窗户外看见你了。'};
  c.talk=talks[id];if(!c.rear&&!c.pump)c.want='我先看看货架，挑好了再结账。';
  if(night===2&&id==='june'){c.human=false;c.anomaly='neck';c.talk='昨天？昨天我没来过。我一直在桥上。';c.questions[1][1]='我今晚还要回东桥，东桥养护组的人都在等我。';c.registry+=' 今晚养护安排：西桥组已下班，东桥因结冰暂停夜间作业。';c.normal='颈部在低头时短暂拉长，头部先动、衣领后动。';}
  if(night===2&&id==='nora')c.talk='又见面了。外面的雪积起来了，回程比昨晚难走。我买点吃的就回去。';
  if(night===2&&id==='wade'){c.questions[0][1]='还是后面。你的门昨天没有开，今天总该开了。';c.registry+=' 备注：登记住址已拆除，无内部权限。';}
  if(night===2&&id==='rowan')c.talk='你昨晚不是叫人提前来换班吗？我来了。让我进去。';
  if(id==='leon'){c.pumpOrder=night===1?'2305':'2406';c.talk=c.talk.replaceAll('2305',c.pumpOrder);c.questions=c.questions.map(q=>q.map(t=>t.replaceAll('2305',c.pumpOrder)));c.registry=c.registry.replaceAll('2305',c.pumpOrder);}
  const baskets={nora:['appleJuice','cookieTin','granola'],june:['lemonTea','crackers','peanuts'],wade:['cola','beans','tuna'],milo:['teaTin','energyDrink','pretzels']};
  if(night===2&&baskets[id]){c.basket=[...baskets[id]];c.cash=c.basket.reduce((n,id)=>n+PRODUCTS[id].price,0)<=1000?1000:2000;}
  c.gender=base.gender||(['june','nora'].includes(id)?'女':'男');c.night=night;c.camouflage=c.human?'human':id==='milo'?'perfect':'leaky';c.revealStyle=id==='wade'||night===2&&id==='june'?'flesh':'intact';
  c.card={gender:c.gender,name:c.name,birth:c.birth,address:c.address,plate:c.plate,badge:c.badge};c.record={...c.card};if(night===2&&id==='wade')c.record.address='东码头街 12 号（已拆除）';return c;
 });
}
export const person=(s,id)=>s.scriptCast?.find(c=>c.id===id)||s.cast?.find(c=>c.id===id)||CUSTOMERS.find(c=>c.id===id);
export const liveActors=s=>s.campaign?[...(s.actors||[]),...(s.narrative?.worker&&!s.narrative.worker.exited?[s.narrative.worker]:[])]:[s.actor,s.departing].filter(Boolean);
export const openConversationModes=['browse','queue','wait'];
export const BUYABLES=[{id:'boards',name:'两块加固木板',cost:800,max:2},{id:'circuit',name:'检修后仓照明回路',cost:1200,max:1}];
