import {animateGrasp} from './grasp-animation.js';
import {COUNTER} from './counter-layout.js';
import * as T from './vendor/three.module.js';
import {person,PRODUCTS} from './night-data.js';
import {gaitProfile,gaitKey,graspPose,solveArm,stepMotion,footArc,solveLeg,damp,angleDelta,smooth,shoppingPose,groundLevel} from './locomotion.js';
import {anomalyPose} from './motion.js';
import {hasBodyLeak} from './mimicry.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function approach(object,key,value,rate,dt,snap){object[key]=snap?value:damp(object[key],value,rate,dt);}
export function groundedBodyHeight(m,phase,blend,profile,baseY){
 if(blend<.03)return baseY;let height=baseY;for(let i=0;i<2;i++){const arc=footArc(phase+i*Math.PI,profile.stride*.9/(m.g.scale.z||1),blend,(i?profile.rightLift:profile.leftLift)||profile.lift||.085,profile.heel,profile.toeOff),down=Math.sqrt(Math.max(.01,.819*.819-arc.z*arc.z));height=Math.min(height,(m.groundY??.09)+.064+m.g.scale.y*arc.lift-m.g.scale.y*(.89-down));}return height;
}
export function setLegPose(m,phase,blend,bodyY,profile,dt,snap=false){
 const scale=m.g.scale.y;for(let i=0;i<2;i++){const limb=m.legs[i],arc=footArc(phase+i*Math.PI,profile.stride*.9/(m.g.scale.z||1),blend,(i?profile.rightLift:profile.leftLift)||profile.lift||.085,profile.heel,profile.toeOff),soleMin=-.0585*Math.cos(arc.roll)-(arc.roll>0?.172:-.092)*Math.sin(arc.roll),soleLift=Math.max(0,-.064-soleMin*scale),ankleY=((m.groundY??.09)+.064+soleLift-bodyY)/scale,goalY=ankleY-.89+arc.lift,ik=solveLeg(goalY,arc.z);
  // Exact IK on a smooth foot trajectory prevents a filtered ankle from sliding
  // along the floor. Upper-body and action transitions are blended separately.
  limb.leg.rotation.x=ik.hip;limb.knee.rotation.x=ik.knee;limb.ankle.rotation.x=ik.ankle+arc.roll;limb.ankle.rotation.y=(i?1:-1)*(profile.toe||.035);
  limb.leg.position.x=(i?1:-1)*profile.stance;approach(limb.leg.rotation,'z',Math.sin(phase)*.012*blend,12,dt,snap);
 }

}
export function animateHuman(m,a,s,dt){
 const dead=a.mode==='dead',c=person(s,a.id),profile=gaitProfile(gaitKey(a,c)),snap=!m.motion||m.motion.actor!==a,elapsed=s.paused?0:Math.min(.10,Math.max(0,dt)),time=s.time+profile.phase;
 if(dead){if(!m.deadPose){m.deadPose=true;m.g.position.set(a.x,.20,a.z);m.g.rotation.set(Math.PI/2,a.deathYaw??a.yaw,.16);m.item.visible=false;if(m.shopItem)m.shopItem.visible=false;}return;}
 m.deadPose=false;m.groundY=groundLevel(a.x,a.z,s);m.motion=stepMotion(m.motion,a,elapsed,profile);const move=m.motion,blend=move.blend,phase=move.phase;
 const shop=a.shoppingPose?(a.shoppingAction||shoppingPose(a.browseTime||0,a.shoppingDuration||6)):null;
 let facing=a.yaw||0;if(a.pausedByTalk&&!shop)facing=Math.atan2(s.player.x-a.x,s.player.z-a.z);else if(a.mode==='wait'||a.mode==='queue')facing=c?.rear?Math.PI:c?.pump?a.yaw:COUNTER.angle;
 const turn=angleDelta(m.g.rotation.y,facing),turnStep=!snap&&!blend?Math.min(.30,Math.abs(turn)*.3):0;
 if(turnStep&&elapsed)move.phase+=Math.abs(turn)*elapsed*2;
 m.g.rotation.y=snap?facing:m.g.rotation.y+clamp(turn,-elapsed*2.8,elapsed*2.8);m.g.rotation.x=0;m.g.rotation.z=0;
 const weight=Math.sin(phase)*profile.sway*blend,idle=Math.sin(time*.65)*.003*(1-blend),bodyY=groundedBodyHeight(m,phase,blend,profile,m.groundY-.075*blend+Math.sin(phase*2)*profile.bob*.5*blend);
 m.g.position.set(a.x,bodyY,a.z);m.upper.position.x=weight+idle;m.upper.position.y=1.10;
 const pose={headX:.012*Math.sin(time*.73)+(profile.headPitch||0)*blend,headY:Math.sin(time*.31)*.08*(1-blend),headZ:Math.sin(time*.45)*.012,headLift:0,chestX:profile.lean*blend,chestY:-Math.sin(phase)*(profile.twist||.035)*blend,chestZ:-weight*.8+Math.sin(phase)*(profile.shoulderRoll||0)*blend,arm0X:-Math.sin(phase)*profile.arm*blend+(profile.armBias?.[0]||0)*blend,arm1X:Math.sin(phase-(profile.armLag??.10))*profile.arm*blend+(profile.armBias?.[1]||0)*blend,elbow0X:(profile.elbow||-.13)-Math.max(0,Math.sin(phase))*.08*blend,elbow1X:(profile.elbow||-.13)-Math.max(0,-Math.sin(phase))*.08*blend,elbow0Z:0,hand0X:0,gap:0,grip:.12};
 if(a.mode==='queue'&&!a.pausedByTalk){pose.headY+=Math.sin(time*.38)*.12;pose.chestZ+=Math.sin(time*.7)*.008;}
 if(a.avoiding){pose.chestY+=.12;pose.headY+=.23;}
 if(a.pausedByTalk){pose.headY=clamp(angleDelta(m.g.rotation.y,Math.atan2(s.player.x-a.x,s.player.z-a.z)),-.5,.5);pose.headX=clamp(Math.atan2((1.7-(1.67*m.g.scale.y+bodyY)),Math.hypot(s.player.x-a.x,s.player.z-a.z)),-.16,.16);}
 // Small asymmetrical speech beats and anticipatory head turns; feet stay grounded.
 if(m.speaking&&!shop&&!c?.rear){const beat=Math.sin(time*2.4+profile.phase)*.5+.5,envelope=.5+.5*Math.sin(time*.83);pose.headX+=Math.sin(time*2.4)*.018;pose.headZ+=Math.sin(time*1.2)*.009;pose.chestY+=Math.sin(time*.7)*.015;pose.arm0X-=.10*beat*envelope;pose.elbow0X-=.22*beat*envelope;pose.hand0X-=.055*beat;pose.grip=.09+.07*beat;}
 if(blend>.1&&!shop&&!a.pausedByTalk)pose.headY+=clamp(turn*.65,-.3,.3); 
 if(shop){if(!a.pausedByTalk){pose.headX+=.12*shop.look;pose.headY-=.09*shop.look;}pose.chestX+=.045*shop.reach;}
 const payAge=s.time-(a.payStartedAt??-99),pay=payAge>=0&&payAge<3.2?Math.sin(payAge/3.2*Math.PI):0;
 if(pay){pose.arm1X-=.65*pay;pose.elbow1X-=.38*pay;pose.headX+=.12*pay;}
 if(s.changeFlight&&s.transaction?.id===a.id){const age=s.time-s.changeFlight.time,receive=age>=0&&age<1?Math.sin(age*Math.PI):0;pose.arm1X-=.45*receive;pose.elbow1X-=.45*receive;}
 if(c?.appearance==='cane'&&!shop){pose.arm1X=-.06;pose.elbow1X=-.13;}
 if(c?.rear&&!shop){pose.arm0X=-.55;pose.elbow0X=-.7;pose.arm1X=-.65;pose.elbow1X=-.75;pose.grip=.7;}
 if(hasBodyLeak(c)&&!shop){const grade=c.id==='cal'?1.0:c.id==='wade'?.6:.35,cycle=(s.time+(a.spawnOrder||0)*.73)%9,pulse=Math.exp(-(((cycle-.15)/.035)**2))-.5*Math.exp(-(((cycle-.25)/.05)**2));pose.headZ+=pulse*.18*grade;pose.headY+=pulse*.10*grade;}
 if(s.refusal?.id===a.id){const v=Math.sin(Math.min(1,s.refusal.time/s.refusal.duration)*Math.PI);pose.arm0X-=.75*v;pose.elbow0X-=.55*v;pose.headX+=.10*v;}
 if(a.animation&&!shop){const t=a.animation.t;if(hasBodyLeak(c)){const v=anomalyPose(c.anomaly,t,Math.round(profile.phase));pose.arm0X+=v.arm;pose.elbow0X=v.elbow;pose.elbow0Z=v.elbowZ;pose.hand0X=v.hand;pose.headX+=v.headX;pose.headY+=v.headY;pose.headZ+=v.headZ;pose.headLift=v.headLift;pose.chestZ+=v.torsoZ;pose.gap=v.itemGap;}
  else{const v=Math.sin(Math.min(1,t/9)*Math.PI),style=Math.floor(profile.phase)%3;if(style===0){pose.headX+=.15*v;pose.elbow1X-=.35*v;}else if(style===1){pose.arm0X-=.24*v;pose.elbow0X-=.4*v;pose.hand0X=-.1*v;}else{pose.headY+=.16*v;pose.chestZ+=.012*v;}}}
 const bodyRate=hasBodyLeak(c)&&a.animation?.t>2&&a.animation?.t<2.4?24:12;
 approach(m.upper.rotation,'x',pose.chestX,9,elapsed,snap);approach(m.upper.rotation,'y',pose.chestY,9,elapsed,snap);approach(m.upper.rotation,'z',pose.chestZ,9,elapsed,snap);
 approach(m.head.rotation,'x',pose.headX,bodyRate,elapsed,snap);approach(m.head.rotation,'y',pose.headY,bodyRate,elapsed,snap);approach(m.head.rotation,'z',pose.headZ,bodyRate,elapsed,snap);approach(m.head.position,'y',m.headRest+pose.headLift,bodyRate,elapsed,snap);
 approach(m.neck.scale,'y',1+pose.headLift/.1,bodyRate,elapsed,snap);approach(m.neck.position,'y',m.neckRest+pose.headLift/2,bodyRate,elapsed,snap);
 m.torso.scale.y=1+Math.sin(time*profile.breath)*.005;m.hips.rotation.z=-weight*.5;m.hips.rotation.y=Math.sin(phase)*(profile.twist||.035)*.35*blend;
 const grasp=shop?graspPose(shop.u??a.browseTime/(a.shoppingDuration||6),a.spawnOrder%2):null;
 m.arms.forEach(({arm,elbow,hand,fingers,thumb},i)=>{if(grasp&&i===(c?.appearance==='cane'?0:(a.spawnOrder||0)%2))return;approach(arm.rotation,'x',i?pose.arm1X:pose.arm0X,12,elapsed,snap);approach(arm.rotation,'z',(c?.rear?(i?-.45:.15):(i?-.035:.035))+Math.sin(time*.65+i)*.006,9,elapsed,snap);approach(arm.rotation,'y',i?-.025:.025,9,elapsed,snap);approach(elbow.rotation,'x',i?pose.elbow1X:pose.elbow0X,bodyRate,elapsed,snap);approach(elbow.rotation,'z',i?0:pose.elbow0Z,bodyRate,elapsed,snap);approach(hand.rotation,'x',i?-.045:pose.hand0X,bodyRate,elapsed,snap);approach(hand.rotation,'z',0,12,elapsed,snap);approach(hand.rotation,'y',0,12,elapsed,snap);hand.scale.set(1,1,1);fingers?.forEach(({joint,tip,distal},j)=>{approach(joint.rotation,'x',-pose.grip-(j%2)*.05,12,elapsed,snap);approach(tip.rotation,'x',-.25-pose.grip*.5,12,elapsed,snap);if(distal)approach(distal.rotation,'x',-.12-pose.grip*.5,12,elapsed,snap);});if(thumb){approach(thumb.rotation,'x',-.18-pose.grip*.3,10,elapsed,snap);approach(thumb.position,'y',.008,10,elapsed,snap);}});
 setLegPose(m,phase,Math.max(blend,turnStep),bodyY,profile,elapsed,snap);
 m.item.visible=!!c?.rear||hasBodyLeak(c)&&a.id==='wade'&&!!a.animation||hasBodyLeak(c)&&c.anomaly==='gap'&&!!a.animation;
 if(['nora','leon'].includes(a.id)&&(s.heldId===a.id||s.trayId===a.id))m.item.visible=false;
 m.item.position.set(m.itemRest[0]+pose.gap,m.itemRest[1],m.itemRest[2]);
 animateGrasp(m,a,c,grasp,elapsed,snap);
 const blinkCycle=(time%(4.5+(profile.phase%2)))/(4.5+(profile.phase%2)),blink=Math.exp(-(((blinkCycle-.97)/.011)**2));m.eyes.visible=blink>.08;m.eyes.children.forEach(lid=>lid.scale.y=.12+blink*.78);
 if(m.cane){m.g.updateMatrixWorld(true);m.cane.quaternion.copy(m.arms[1].hand.getWorldQuaternion(new T.Quaternion()).invert().multiply(m.g.getWorldQuaternion(new T.Quaternion())));const handY=m.arms[1].hand.getWorldPosition(new T.Vector3()).y;m.cane.scale.y=Math.max(.8,Math.min(1.18,(handY-m.groundY)/(.80*m.g.scale.y)));}
 const seated=a.vehiclePose||0;m.upper.scale.y=1-.20*seated;if(seated){m.g.position.y-=.25*seated;m.upper.rotation.x+=.50*seated;m.arms.forEach(l=>{l.arm.rotation.x=-.85*seated;l.elbow.rotation.x=-.9*seated;l.hand.rotation.x=.1*seated;});m.legs.forEach(l=>{l.leg.rotation.x=-1.50*seated;l.knee.rotation.x=1.70*seated;l.ankle.rotation.x=-.20*seated;});}
 m.horror.visible=false;m.sockets.visible=false;
}
