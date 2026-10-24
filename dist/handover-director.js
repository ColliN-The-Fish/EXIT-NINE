import {counterPoint} from './counter-layout.js';
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function isHandover(q){return ['transition2','transition3'].includes(q?.key);}
export function handoverPlan(q){const i=Math.max(0,q.index),t=q.elapsed,u=ease(t/6.2),pay=counterPoint(-8.9,1.14,-1.3);
 if(q.key==='transition2'){
  if(i===0&&t<4.3)return{from:[pay.x-.56,1.60,pay.z+.28],to:[pay.x,1.01,pay.z],fov:43,label:'第一班之后 · 工资到账',cut:4.3};
  if(i===0)return{from:[-16.8+ease((t-4.3)/4.9)*1.1,2.1,-18.7],to:[-1.5,1.55,-3],fov:61,label:'天亮离站 · 还差一点',cut:4.3};
  if(i===1)return{from:[-.3,1.69,-10.0+u*2.5],to:[.5,1.45,-4.1],fov:65,label:'第二晚 · 再回来做一班'};
  return{pov:true,label:'第二晚 · 回到柜台'};
 }
 if(i===0&&t<5.6)return{from:[-1.35,1.65,-3.8],to:[-1,1.45,-14.2],fov:49,label:'关店之后 · 雪还没停',cut:5.6};
 if(i===0)return{from:[16.1,1.7,11.4],to:[17.83,2.30,11.1],fov:40,label:'员工室 · 等待白天过去',cut:5.6};
 if(i===1)return{from:[-7.2-u*.35,1.6,5.6-u*.6],to:[-9,1.35,-1.3],fov:56,label:'第三晚 · 不再营业'};
 return{pov:true,label:'第三晚 · 守着原道路频道'};
}
export function handoverFade(q,hold){const i=Math.max(0,q.index),t=q.elapsed,cut=q.key==='transition2'?4.3:5.6;let opacity=i===0?1-ease((t-.85)/.75):1-ease(t/.48);if(i===0)opacity=Math.max(opacity,1-ease(Math.abs(t-cut)/.18));if(i<2)opacity=Math.max(opacity,ease((t-(hold-.38))/.38));return opacity;}
export function handoverDaylight(q){if(q.index>0)return 0;return q.key==='transition2'?.17+.07*ease(q.elapsed/9.2):.23;}
