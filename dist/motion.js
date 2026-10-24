const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
// Signs preserve the manual's evidence, but each has its own anticipation,
// unnatural event and recovery, rather than the same lifted-arm loop.
export function anomalyPose(type,t,variant=0){const peak=smooth((t-.66)/.07)*(1-smooth((t-.88)/.16)),p={arm:0,elbow:-.12,elbowZ:0,hand:0,headX:0,headY:0,headZ:0,headLift:0,itemGap:0,torsoZ:0};if(type==='joint'){p.arm=-.5*smooth(t/.55);p.elbow=-.12-.65*smooth(t/.55)*(1-peak);p.elbowZ=-1.65*peak;p.hand=.85*peak;p.headY=-.17*peak;}
 else if(type==='gap'){p.arm=-.62*smooth(t/.55);p.elbow=-.6;p.itemGap=-.29*peak;p.hand=-.5*peak;p.headX=.20*peak;p.torsoZ=-.06*peak;}
 else if(type==='neck'){p.headLift=.15*peak;p.headZ=(variant%2?-.61:.69)*peak;p.headY=-.58*peak;p.headX=.10*peak;p.torsoZ=-.08*peak;}
 const end=1-smooth((t-1.2)/.7);for(const k of Object.keys(p))if(k!=='elbow')p[k]*=end;p.elbow=-.12+(p.elbow+.12)*end;return p;}
