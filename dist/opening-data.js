export const OPENING_SECONDS=79.2;
export const OPENING_SHOTS=[
 {id:'slate',start:0,end:4.6,title:'末班车',caption:'',lens:'black'},
 {id:'bus',start:4.6,end:12.4,title:'23:55 · 末班车',caption:'',lens:'interior'},
 {id:'wide',start:12.4,end:17.2,title:'第九出口服务区',caption:'',lens:'wide'},
 {id:'brake',start:17.2,end:21.4,title:'靠站',caption:'',lens:'close'},
 {id:'steps',start:21.4,end:23.6,title:'下车',caption:'',lens:'feet'},
 {id:'sign',start:23.6,end:25.2,title:'第九出口',caption:'',lens:'insert'},
 {id:'forecourt',start:25.2,end:35,title:'上班之前',caption:'',lens:'first-person'},
 {id:'entry',start:35,end:38,title:'进入店面',caption:'',lens:'tracking'},
 {id:'staff',start:38,end:40.2,title:'员工区域',caption:'',lens:'tracking'},
 {id:'greeting-wide',start:40.2,end:43,title:'交班',caption:'',lens:'medium-wide'},
 {id:'greeting',start:43,end:46.3,title:'交班',caption:'',lens:'medium'},
 {id:'key-close',start:46.3,end:48.4,title:'接过储物柜钥匙',caption:'',lens:'detail'},
 {id:'uniform',start:48.4,end:53.2,title:'换上制服',caption:'',lens:'detail'},
 {id:'handoff',start:53.2,end:58.6,title:'交班',caption:'',lens:'medium'},
 {id:'reverse',start:58.6,end:62,title:'交班',caption:'',lens:'reverse'},
 {id:'ben-close',start:62,end:66.8,title:'交班',caption:'',lens:'close'},
 {id:'hands-reply',start:66.8,end:70,title:'交班',caption:'',lens:'detail'},
 {id:'farewell',start:70,end:74.3,title:'交班结束',caption:'',lens:'medium-wide'},
 {id:'counter',start:74.3,end:79.2,title:'00:08 · 开始值班',caption:'',lens:'first-person'}
];
export const OPENING_SLATE='1996年冬 · 23:55\n美国北部，第九出口服务区\n租房首付还差 $180 · 三个临时夜班';
export function openingSlate(time){return Array.from(OPENING_SLATE).slice(0,Math.max(0,Math.floor((time-.32)*17))).join('');}
export const OPENING_VOICES=[
 {id:'alex-bus',start:7,end:10.9,speaker:'亚历克斯 · 自言自语',text:'还差一百八。三班应该够了。',src:'assets/voice/v14/opening-alex-bus.wav'},
 {id:'driver',start:16.2,end:20.4,speaker:'司机 · 车内广播',text:'第九出口。最后一站，下车带好东西。',src:'assets/voice/v13/opening-driver.wav'},
 {id:'alex-sign',start:23.65,end:25.2,speaker:'亚历克斯',text:'第九出口。是这儿。',src:'assets/voice/v13/opening-alex-sign.wav'},
 {id:'alex-walk',start:28.2,end:31.8,speaker:'亚历克斯 · 自言自语',text:'灯还亮着。至少没来晚。',src:'assets/voice/v13/opening-alex-walk.wav'},
 {id:'ben-1',start:43.15,end:47.45,speaker:'本·卡特 · 上一班店员',text:'你就是亚历克斯？制服在里面。钥匙给你。',src:'assets/voice/v13/opening-ben-1.wav'},
 {id:'alex-uniform',start:49.8,end:52.9,speaker:'亚历克斯 · 自言自语',text:'尺寸正好。比想象中冷。',src:'assets/voice/v13/opening-alex-uniform.wav'},
 {id:'ben-2',start:53.35,end:58.5,speaker:'本·卡特',text:'我已经打卡了。后面的货车到了，老板一会儿会打电话。',src:'assets/voice/v13/opening-ben-2.wav'},
 {id:'alex-question',start:59,end:61.8,speaker:'亚历克斯',text:'夜里还会有很多客人吗？',src:'assets/voice/v13/opening-alex-question.wav'},
 {id:'ben-reply',start:62.2,end:66.6,speaker:'本·卡特',text:'后面的我来，你去忙。可惜今晚只有你。',src:'assets/voice/v14/opening-ben-reply.wav'},
 {id:'alex-reply',start:67,end:69.8,speaker:'亚历克斯',text:'好，你早点回去休息。',src:'assets/voice/v13/opening-alex-reply.wav'},
 {id:'ben-3',start:70.2,end:73.5,speaker:'本·卡特',text:'今晚只有你一个人。天亮见。',src:'assets/voice/v13/opening-ben-3.wav'},
 {id:'alex-counter',start:74.7,end:78.5,speaker:'亚历克斯 · 自言自语',text:'先接电话，挣够房钱就走。',src:'assets/voice/v14/opening-alex-counter.wav'}
];
const clamp=x=>Math.max(0,Math.min(1,x));
export function arrivalBusPose(time){
 let x,z,yaw=0;
 if(time<13){const u=clamp((time-4.6)/8.4);x=-58+26*u;z=-25;}
 else if(time<20.8){const v=clamp((time-13)/7.8),u=1-(1-v)**2,a=1-u;const p=[[-32,-25],[-26,-25],[-22,-18.3],[-16.5,-18.3]];x=a*a*a*p[0][0]+3*a*a*u*p[1][0]+3*a*u*u*p[2][0]+u*u*u*p[3][0];z=a*a*a*p[0][1]+3*a*a*u*p[1][1]+3*a*u*u*p[2][1]+u*u*u*p[3][1];const dx=3*a*a*(p[1][0]-p[0][0])+6*a*u*(p[2][0]-p[1][0])+3*u*u*(p[3][0]-p[2][0]),dz=3*a*a*(p[1][1]-p[0][1])+6*a*u*(p[2][1]-p[1][1])+3*u*u*(p[3][1]-p[2][1]);yaw=-Math.atan2(dz,dx);}
 else if(time<27.3){x=-16.5;z=-18.3;}
 else{const u=clamp((time-27.3)/10),a=u*u*(3-2*u);x=-16.5+72*a;z=-18.3;}
 return{x,z,yaw};
}
export function openingShot(time){const t=Math.max(0,Math.min(OPENING_SECONDS,time)),shot=OPENING_SHOTS.find(s=>t>=s.start&&t<s.end)||OPENING_SHOTS.at(-1),u=Math.max(0,Math.min(1,(t-shot.start)/(shot.end-shot.start)));return{...shot,u};}
export const openingVoice=time=>OPENING_VOICES.find(v=>time>=v.start&&time<v.end)||null;
