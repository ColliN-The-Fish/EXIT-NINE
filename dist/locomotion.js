import {truckRise} from './site-layout.js';
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const GAITS={
 edith:{label:'拄杖缓行',stride:1.01,pace:.80,arm:.055,bob:.009,sway:.014,lean:.075,stance:.12,phase:.6,breath:.8,leftLift:.055,rightLift:.035,lift:.05,armBias:[-.28,.08],elbow:-.40,headPitch:.045,toe:.11},
 owen:{label:'骑行者前倾轻步',stride:1.52,pace:1.08,arm:.30,bob:.021,sway:.012,lean:.095,stance:.085,phase:1.8,breath:1.4,lift:.115,elbow:-.65,armBias:[-.15,.025],shoulderRoll:.018,twist:.13,toe:-.035},
 ruth:{label:'调度员稳步',stride:1.25,pace:.94,arm:.12,bob:.012,sway:.012,lean:.012,stance:.09,phase:2.8,breath:1.2,lift:.075,armBias:[-.13,.04],elbow:-.30,twist:.045,toe:.04},
 cal:{label:'检修工偏重沉步',stride:1.18,pace:.89,arm:.055,bob:.034,sway:.039,lean:-.012,stance:.17,phase:3.8,breath:.9,lift:.045,leftLift:.027,rightLift:.075,elbow:-.55,armBias:[-.10,-.42],shoulderRoll:.06,twist:-.035,armLag:.42,heel:.20,toeOff:.15,toe:.22},
 june:{stride:1.30,pace:.92,arm:.22,bob:.018,sway:.023,lean:.025,stance:.112,phase:.2,breath:1.1,lift:.080,toe:.13,shoulderRoll:.034,twist:.065,armLag:.24,elbow:-.17},
 wade:{stride:1.42,pace:.98,arm:.075,bob:.010,sway:.007,lean:.008,stance:.115,phase:1.3,breath:.9,lift:.075,toe:.06,heel:.15,toeOff:.25,twist:.018,elbow:-.10},
 nora:{stride:1.36,pace:1.04,arm:.20,bob:.020,sway:.009,lean:.045,stance:.073,phase:2.1,breath:1.4,lift:.115,toe:.012,shoulderRoll:.012,twist:.075,elbow:-.36,armLag:-.18},
 rowan:{stride:1.46,pace:.94,arm:.11,bob:.023,sway:.026,lean:.085,stance:.155,phase:3.4,breath:1.0,lift:.068,toe:.11,shoulderRoll:.042,twist:.045,armBias:[-.20,-.35],elbow:-.42,heel:.12},
 leon:{stride:1.12,pace:.90,arm:.10,bob:.013,sway:.018,lean:.095,stance:.112,phase:4.2,breath:1.2,lift:.064,leftLift:.045,rightLift:.075,toe:.09,armBias:[.035,-.11],headPitch:.07,shoulderRoll:.021,twist:.025,elbow:-.20},
 milo:{stride:1.65,pace:1.02,arm:.13,bob:.006,sway:.004,lean:.005,stance:.078,phase:5.1,breath:1.3,lift:.070,toe:-.015,twist:.035,elbow:-.18,armLag:.11},
 deliberate:{label:"谨慎短步",stride:1.10,pace:.84,arm:.08,bob:.008,sway:.008,lean:.028,stance:.10,phase:.7,breath:.8,lift:.058,armBias:[-.08,-.05],toe:.025},
 hurried:{label:"轻快赶路",stride:1.60,pace:1.12,arm:.32,bob:.021,sway:.011,lean:.08,stance:.088,phase:1.9,breath:1.6,twist:.145,shoulderRoll:.03,armLag:-.2,lift:.125,armBias:[.045,-.12],elbow:-.55,toe:.01},
 weary:{label:"疲倦拖步",stride:1.18,pace:.85,arm:.065,bob:.011,sway:.018,lean:.075,stance:.115,phase:2.7,breath:.75,headPitch:.14,shoulderRoll:.035,armLag:.4,lift:.047,armBias:[.045,-.04],toe:.085},
 burdened:{label:"抱物负重",stride:1.19,pace:.88,arm:.045,bob:.014,sway:.019,lean:-.025,stance:.122,phase:3.9,breath:1.25,shoulderRoll:.045,twist:.015,lift:.064,armBias:[-.48,-.48],elbow:-.7,toe:.065},
 prowling:{label:"收敛长步",stride:1.80,pace:1.03,arm:.06,bob:.007,sway:.004,lean:.045,stance:.072,phase:4.7,breath:.95,lift:.09,armBias:[-.06,-.13],elbow:-.33,headPitch:-.04,twist:.06,toe:-.015},
 guarded:{label:"护侧探步",stride:1.24,pace:.91,arm:.09,bob:.014,sway:.009,lean:.03,stance:.108,phase:5.8,breath:1.2,lift:.073,armBias:[-.58,.06],elbow:-.40,toe:.06,twist:.065,headPitch:-.025,leftLift:.055,rightLift:.088}
};
export const GAIT_LABELS={june:'琼 · 松弛外摆',wade:'韦德 · 稳重落脚',nora:'诺拉 · 轻盈窄步',rowan:'罗文 · 宽肩沉步',leon:'里昂 · 稳缓短步',milo:'迈洛 · 平稳长步',...Object.fromEntries(Object.entries(GAITS).filter(([,v])=>v.label).map(([k,v])=>[k,v.label]))};
export function gaitKey(actor,character){if(actor?.gaitId&&GAITS[actor.gaitId])return actor.gaitId;const n=character?.night||1,id=actor?.id||character?.id;if(n===2)return({june:'deliberate',nora:'hurried',leon:'weary',rowan:'burdened'})[id]||id;if(n===3)return({milo:'prowling',wade:'guarded'})[id]||id;return id;}
export const gaitProfile=id=>GAITS[id]||GAITS.wade;
export const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
export const damp=(a,b,rate,dt)=>a+(b-a)*(1-Math.exp(-rate*Math.max(0,dt)));
export function angleDelta(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a));}
export function stepMotion(previous,actor,dt,profile=gaitProfile(actor.id)){
 const first=!previous||previous.actor!==actor,old=first?{x:actor.x,z:actor.z,phase:profile.phase,speed:0,blend:0,turn:0,yaw:actor.yaw||0}:previous;
 const distance=Math.hypot(actor.x-old.x,actor.z-old.z),teleport=distance>1.5,elapsed=clamp(dt,0,.12),speed=elapsed>0&&!teleport?distance/elapsed:old.speed;
 const smoothed=damp(old.speed,clamp(speed,0,5),9,elapsed),blend=damp(old.blend,actor.moving&&smoothed>.03?clamp(smoothed/1.25,0,1):0,actor.moving?9:7,elapsed),target=actor.yaw??old.yaw,delta=angleDelta(old.yaw,target),yaw=old.yaw+clamp(delta,-elapsed*2.7,elapsed*2.7),turn=damp(old.turn,elapsed?clamp(delta/elapsed,-3,3):0,8,elapsed);
 return{actor,x:actor.x,z:actor.z,phase:old.phase+(!teleport?distance:0)/(profile.stride*.9)*TAU,speed:smoothed,blend,yaw,turn,distance:teleport?0:distance};
}
// Grounded foot arc: slow stance along the floor, a short lifted return, with
// heel/toe roll. Phase advances from actual travelled distance, never wall time.
export function footArc(phase,stride,blend=1,liftHeight=.085,heel=.10,toeOff=.20){let u=((phase/TAU)%1+1)%1,z,lift=0,roll=0;if(u<.5){const t=u/.5;z=stride*.25*(1-2*t);roll=(t<.18?-heel*(1-smooth(t/.18)):t>.82?toeOff*smooth((t-.82)/.18):0);}else{const t=(u-.5)/.5;z=stride*.25*(-8*t*t*t+12*t*t-2*t-1);lift=Math.sin(t*Math.PI)**2*liftHeight;roll=toeOff-(toeOff+heel)*smooth(t)-.05*Math.sin(t*Math.PI)**2;}return{z:z*blend,lift:lift*blend,roll:roll*blend};}
export function solveLeg(y,z,L1=.40,L2=.43){const d=clamp(Math.hypot(y,z),.10,L1+L2-.001),knee=Math.acos(clamp((d*d-L1*L1-L2*L2)/(2*L1*L2),-1,1)),hip=Math.atan2(-z,-y)-Math.atan2(L2*Math.sin(knee),L1+L2*Math.cos(knee));return{hip,knee,ankle:-(hip+knee)};}
export function shoppingPose(elapsed,duration){const u=clamp(elapsed/Math.max(.1,duration),0,1);return{u,contact:smooth((u-.35)/.075),release:smooth((u-.84)/.12),look:smooth(u/.20)*(1-smooth((u-.88)/.12)),reach:smooth((u-.18)/.22)*(1-smooth((u-.72)/.22)),grip:smooth((u-.42)/.12)*(1-smooth((u-.76)/.16)),take:smooth((u-.58)/.20)};}
// Store/stock concrete, the slightly raised staff floor and exterior asphalt.
// Blend at thresholds so ankles step across them rather than float outside.
export function groundLevel(x,z,s=null){const ramp=truckRise({x,z},s);if(ramp>0)return .02+ramp;if(x>=11&&x<=18&&z>=9&&z<=17)return .11;if(x>=-11&&x<=11&&z>=9&&z<=19)return .09;if(x< -11||x>11||z< -5.2||z>19.2)return .02;const edge=Math.min(smooth((z+5.15)/.3),1-smooth((z-18.85)/.3)),office=smooth((x-3.9)/.2)*smooth((z-19.9)/.2);return .02+edge*(.07+office*.02);}

// Two-bone arm solution uses a negative elbow bend, matching a human elbow.
export function solveArm(y,z,L1=.27,L2=.313){const d=clamp(Math.hypot(y,z),.08,L1+L2-.001),k=Math.acos(clamp((d*d-L1*L1-L2*L2)/(2*L1*L2),-1,1));return{shoulder:Math.atan2(-z,-y)+Math.atan2(L2*Math.sin(k),L1+L2*Math.cos(k)),elbow:-k};}
export function graspPose(u,style=0){u=clamp(u,0,1);const reach=smooth((u-.17)/.22),contact=smooth((u-.39)/.055),close=smooth((u-.445)/.105),pull=smooth((u-.57)/.19),stow=smooth((u-.90)/.06);return{u,reach,contact,close,pull,stow,attached:u>=.445&&u<.96,spread:(1-close)*reach,style};}
