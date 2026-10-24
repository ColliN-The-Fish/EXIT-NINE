// Layered local synthesis: mechanical transients, resonances, room reflections,
// spatial attenuation and varied surfaces. No network audio dependency.
export const SOUND_EVENTS=['deathSting','drink','snack','cabinet','truckAir','busBrake','busDoor','cloth','slidingDoor','doorLatch','metalKey','binRattle','engineStart','carDoor','highwayPass','doorOpen','doorClose','rearOpen','rearClose','boxLift','boxLand','shelfStock','cctvOn','cctvSwitch','cctvOff','drawerOpen','drawerClose','cashPaper','coin','barcode','receipt','idScan','idReady','keyboard','paper','foot','distantStep','rain','canopyCreak','rearScratch','radioWhisper','lightFlicker','tape','printerGhost','bell','ring','phoneOff','shot','growl','break','trap','collapse','blackout','power','rescue','radio','knock','hammer','hurt','wipe','pump','pumpCall','scanComplete','dispute'];
export class Soundscape{
 constructor(context=null){this.context=context;this.volume=.45;this.events=[];this.serial=0;this.last={};this.state=null;this.ambient=null;}
 init(){if(this.master)return;const c=this.context||(this.context=new(window.AudioContext||window.webkitAudioContext)());this.master=c.createGain();this.master.gain.value=this.volume;this.master.connect(c.destination);this.room=c.createConvolver();const b=c.createBuffer(2,Math.floor(c.sampleRate*.7),c.sampleRate);for(let ch=0;ch<2;ch++){const v=b.getChannelData(ch);for(let i=0;i<v.length;i++)v[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*.12))*.21;}this.room.buffer=b;const wet=c.createGain();wet.gain.value=.22;this.room.connect(wet);wet.connect(this.master);}
 start(){try{this.init();this.context.resume?.();}catch{}}
 setVolume(v){this.volume=v;if(this.master)this.master.gain.setTargetAtTime(v,this.context.currentTime,.06);}
 update(s,world){this.state=s;this.world=world;if(!this.master)return;const ending=!!world.presentationScene;if(!ending&&!s.paused&&world.traffic&&Math.abs(world.traffic.x)<22&&this.trafficId!==world.traffic.id){this.trafficId=world.traffic.id;this.play('highwayPass',{pos:{x:world.traffic.x,z:world.traffic.z},sweep:world.traffic.direction});}const c=this.context;if(!this.ambient){const bus=c.createGain();bus.gain.value=0;bus.connect(this.master);this.ambient=bus;this.hum=c.createOscillator();this.hum.type='sine';this.hum.frequency.value=58;this.humGain=c.createGain();this.humGain.gain.value=.007;this.hum.connect(this.humGain);this.humGain.connect(bus);this.hum.start();this.truckHum=c.createOscillator();this.truckHum.type='triangle';this.truckHum.frequency.value=47;this.truckGain=c.createGain();this.truckGain.gain.value=0;this.truckHum.connect(this.truckGain);this.truckGain.connect(bus);this.truckHum.start();const buffer=c.createBuffer(1,c.sampleRate*4,c.sampleRate),data=buffer.getChannelData(0);let last=0;for(let i=0;i<data.length;i++){last=(last+(Math.random()*2-1)*.018)/1.02;data[i]=last;}const src=c.createBufferSource();src.buffer=buffer;src.loop=true;const low=c.createBiquadFilter();low.type='lowpass';low.frequency.value=700;this.windGain=c.createGain();this.windGain.gain.value=.06;src.connect(low);low.connect(this.windGain);this.windGain.connect(bus);src.start();}this.ambient.gain.setTargetAtTime(s.paused||s.finished?0:1,c.currentTime,.3);this.humGain.gain.setTargetAtTime(s.power&&!ending?.007:0,c.currentTime,.15);const f=s.freight,driving=f&&['approach','reverse','depart'].includes(f.phase),fd=f?Math.hypot(f.x-s.player.x,f.z-s.player.z):99;this.truckGain.gain.setTargetAtTime(driving?.035/(1+fd*.12):0,c.currentTime,.22);this.truckHum.frequency.setTargetAtTime(f?.phase==='reverse'?43:51,c.currentTime,.3);this.windGain.gain.setTargetAtTime(ending?.012:world.zone(s.player)==='outside'?.18*(1+(world.winterWeather?.strength||0)):.045*(1+(world.winterWeather?.strength||0)*.5),c.currentTime,.4);}
 play(kind,{pos=null,surface=null,sweep=0}={}){if(!this.master||this.volume<=0)return;const c=this.context,now=c.currentTime;if(now-(this.last[kind]??-99)<(kind==='keyboard'?.025:.07))return;this.last[kind]=now;this.events.push(kind);this.events=this.events.slice(-100);const n=++this.serial,variation=.92+(n%7)*.026;
  const output=c.createGain(),pan=c.createStereoPanner(),filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=14000;let level=1.4;
  if(pos&&this.state){const p=this.state.player,dx=pos.x-p.x,dz=pos.z-p.z,d=Math.hypot(dx,dz),angle=Math.atan2(dx,-dz)+p.yaw;pan.pan.value=Math.max(-.95,Math.min(.95,Math.sin(angle)));level=1.4/(1+d*.12);if(this.world&&this.world.zone(pos)!==this.world.zone(p)&&!this.world.sees(pos,p,this.state)){filter.frequency.value=850;level*=.5;}}
  if(kind==='highwayPass'&&sweep){const direction=sweep*Math.cos(this.state?.player.yaw||0);pan.pan.setValueAtTime(-.65*direction,now);pan.pan.linearRampToValueAtTime(.65*direction,now+2.4);}
  output.gain.value=level;output.connect(filter);filter.connect(pan);pan.connect(this.master);pan.connect(this.room);
  const tone=(frequency,length,delay=0,type='sine',gain=.12,end=0)=>{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(frequency*variation,now+delay);if(end)o.frequency.exponentialRampToValueAtTime(end*variation,now+delay+length);g.gain.setValueAtTime(.0001,now+delay);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),now+delay+.006);g.gain.exponentialRampToValueAtTime(.0001,now+delay+length);o.connect(g);g.connect(output);o.start(now+delay);o.stop(now+delay+length+.02);};
  const noise=(length,gain,cutoff=1500,delay=0,type='lowpass',resonance=.7)=>{const b=c.createBuffer(1,Math.ceil(c.sampleRate*length),c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/a.length,1.7);const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();src.buffer=b;src.playbackRate.value=variation;f.type=type;f.frequency.value=cutoff;f.Q.value=resonance;g.gain.value=gain;src.connect(f);f.connect(g);g.connect(output);src.start(now+delay);};
  if(kind==='deathSting'){tone(43,1.9,0,'sawtooth',.09,25);tone(690,.72,.02,'triangle',.065,130);noise(.18,.31,2900,0,'bandpass',2);noise(1.65,.18,740,.04,'bandpass',4);tone(117,1.2,.12,'sawtooth',.045,49);noise(.30,.14,1900,.62);tone(52,1.5,.04,'sine',.10,23);tone(930,.48,.16,'sawtooth',.04,210);noise(.10,.18,4200,.17,'bandpass',3);noise(.22,.11,1600,.33,'bandpass',5);noise(.45,.09,3100,.94,'bandpass',2);tone(178,1.1,.52,'triangle',.035,61);}
  else if(kind==='drink'){noise(.10,.10,2100);tone(480,.12,.14,'sine',.025,210);noise(.65,.075,600,.22,'bandpass',2);}
  else if(kind==='snack'){noise(.35,.14,2700,0,'highpass');noise(.30,.10,1800,.36,'bandpass');}
  else if(kind==='cabinet'){noise(.3,.15,680,0,'bandpass',3);tone(160,.32,0,'triangle',.035,100);noise(.08,.16,400,.29);}
  else if(kind==='truckAir'){noise(1.1,.13,2000,0,'highpass');tone(82,.5,0,'triangle',.04,42);}
  else if(kind==='busBrake'){noise(2.0,.11,620,0,'bandpass',3);tone(110,.8,0,'triangle',.035,42);noise(.65,.12,2400,.5,'highpass');}
  else if(kind==='busDoor'){noise(.9,.16,1800,0,'bandpass',1.5);tone(140,.6,.1,'triangle',.025,85);noise(.08,.13,530,.7);}
  else if(kind==='cloth'){noise(1.2,.11,2200,0,'bandpass',.7);noise(.4,.075,3600,.6,'highpass');}
  else if(kind==='slidingDoor'){noise(.85,.13,800,0,'bandpass',2);tone(180,.7,0,'triangle',.035,130);noise(.06,.10,450,.75);}
  else if(kind==='doorLatch'||kind==='metalKey'){noise(.025,.18,2800);tone(1200,.09,.02,'sine',.04);noise(.08,.12,900,.04);}
  else if(kind==='binRattle'){[0,.17,.42,.70,1.15].forEach(t=>{noise(.12,.16,1900,t,'bandpass',3);tone(125,.20,t,'triangle',.04,90);});noise(1.3,.13,450,.1,'bandpass',5);}
  else if(kind==='engineStart'){tone(60,1.8,0,'sawtooth',.025,92);noise(1.8,.12,700,0,'lowpass');noise(.22,.18,2300,.04);}
  else if(kind==='carDoor'){noise(.30,.16,1200);noise(.08,.25,350,.22);tone(90,.2,.20,'triangle',.05,45);}
  else if(['doorOpen','doorClose','rearOpen','rearClose','door'].includes(kind)){const metal=kind.startsWith('rear')||surface==='loading',close=kind.endsWith('Close');noise(.06,.20,metal?2200:3300);noise(close?.12:.55,.16,metal?530:900,.05,'bandpass',3);tone(metal?153:246,close?.12:.65,.03,'triangle',.06,metal?93:178);if(close){noise(.10,.35,450,.12);tone(66,.15,.13,'sine',.13,42);}else noise(.03,.15,4500,.32);}
  else if(kind==='boxLift'){noise(.48,.24,2400,0,'bandpass',.8);noise(.13,.08,160,.05);noise(.18,.1,3800,.22);}
  else if(['boxLand','box'].includes(kind)){noise(.10,.34,420);tone(92,.16,0,'sine',.17,40);noise(.28,.15,1800,.04);noise(.07,.1,1200,.18);}
  else if(kind==='shelfStock'){noise(.22,.2,1800);tone(surface===0?1900:820,.12,.07,'sine',.08);tone(surface===2?1300:2400,.18,.14,'sine',.045);noise(.09,.1,650,.20);}
  else if(['cctvOn','cctvSwitch','cctvOff'].includes(kind)){noise(.025,.3,5000);tone(280,.13,.03,'triangle',.05,kind==='cctvOff'?30:900);noise(kind==='cctvOn'?.6:.18,.13,3600,.04,'bandpass',.4);if(kind==='cctvOn')tone(7000,.45,.04,'sine',.009,8800);}
  else if(kind==='drawerOpen'||kind==='drawerClose'){noise(.06,.22,2600);noise(.32,.23,700,.03,'bandpass',2);[0,.07,.15].forEach(t=>tone(800+t*100,.1,t,'sine',.025));noise(.08,.29,300,kind==='drawerClose'?.13:.27);}
  else if(['paper','cashPaper','receipt','printerGhost'].includes(kind)){if(kind==='receipt'||kind==='printerGhost'){for(let i=0;i<7;i++){noise(.045,.1,1900,i*.055,'bandpass',2);tone(210,.04,i*.055,'square',.018);}noise(.22,.17,3800,.38);}else{noise(.25,.2,2700,0,'highpass');noise(.10,.12,4000,.10,'bandpass',1);}}
  else if(kind==='coin'){[0,.035,.09].forEach((t,i)=>{tone(2400+i*640,.13,t,'sine',.055);noise(.015,.12,5000,t);});}
  else if(['barcode','idReady','scanComplete','pump'].includes(kind)){tone(kind==='barcode'?2400:1200,.07,0,'sine',.10);if(kind!=='barcode')tone(1750,.09,.1,'sine',.06);}
  else if(kind==='idScan'){tone(185,.75,0,'triangle',.04,265);noise(.8,.12,1500,.1,'bandpass',2);tone(920,.07,.85,'sine',.06);}
  else if(kind==='keyboard'){noise(.012,.16,3200);noise(.03,.10,500,.025);}
  else if(kind==='foot'||kind==='distantStep'){const outdoor=surface==='outside';noise(.08,.20,outdoor?1400:650);tone(outdoor?85:125,.08,0,'sine',.06,55);noise(.08,.05,outdoor?2700:1900,.03);if(kind==='distantStep'){noise(.09,.14,530,.56);tone(88,.12,.56,'sine',.055,42);}}
  else if(['canopyCreak','rearScratch'].includes(kind)){tone(kind==='rearScratch'?540:154,1.1,0,'triangle',.045,kind==='rearScratch'?1200:77);noise(1.2,.16,kind==='rearScratch'?2000:750,0,'bandpass',5);noise(.08,.17,250,.9);}
  else if(kind==='radioWhisper'||kind==='tape'){noise(1.8,.16,650,0,'bandpass',5);noise(1.6,.08,2200,.12,'bandpass',3);tone(86,1.7,.1,'sawtooth',.018,54);tone(410,.45,.8,'sine',.018,380);}
  else if(kind==='lightFlicker'||kind==='power'){[0,.13,.34].forEach(t=>{noise(.02,.15,4000,t);tone(110,.15,t,'sawtooth',.025,55);});}
  else if(kind==='blackout'){tone(120,.9,0,'sawtooth',.10,22);noise(.11,.24,900);}
  else if(kind==='bell'){tone(790,.6,0,'sine',.13);tone(1054,.85,.06,'sine',.065);}
  else if(kind==='ring'||kind==='pumpCall'){[0,.22].forEach(t=>{tone(470,.14,t,'square',.035);tone(580,.14,t,'sine',.04);});}
  else if(kind==='shot'){noise(.30,.65,5800);tone(65,.19,0,'sawtooth',.27,23);noise(.08,.2,420,.18);}
  else if(kind==='highwayPass'){tone(85,2.4,0,'triangle',.035,42);noise(2.5,.13,460,0,'lowpass');noise(1.8,.06,1400,.4,'bandpass');}
  else if(kind==='growl'){tone(48,1.9,0,'sawtooth',.08,29);noise(1.5,.23,330,0,'bandpass',3);tone(128,1.2,.15,'triangle',.045,61);}
  else if(['break','trap','collapse'].includes(kind)){noise(.5,.5,1600);tone(82,.5,0,'triangle',.11,30);noise(.2,.18,3500,.17);}
  else if(['knock','hammer'].includes(kind)){[0,.19,.43].forEach(t=>{noise(.055,.18,650,t);tone(95,.1,t,'triangle',.14,45);});}
  else if(kind==='radio'){noise(.55,.15,2400,0,'bandpass');tone(930,.1,.1,'sine',.05);}
  else if(kind==='rescue'){tone(540,.8,0,'sine',.1,850);tone(850,.8,.8,'sine',.1,540);}
  else if(kind==='hurt')noise(.12,.22,600);
  else if(kind==='wipe')noise(.55,.16,1400,0,'bandpass');
  else if(kind==='phoneOff'){noise(.03,.2,2500);tone(150,.08,0,'triangle',.04);}
  else if(kind==='dispute'){noise(.08,.10,600);}
  else noise(.12,.10,1200);
  // Disconnect finished event buses; ambience has its own long-lived bus.
  if(typeof window!=='undefined')setTimeout(()=>{output.disconnect();filter.disconnect();pan.disconnect();},3500);
 }
}
