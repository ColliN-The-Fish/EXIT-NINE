import {OPENING_VOICES,openingVoice} from './opening-data.js';
export class OpeningVoice{
 constructor(soundscape){this.audio=soundscape;this.buffers=new Map();this.events=[];this.source=null;this.playingId=null;this.finished=new Set();this.resume=null;this.lastTime=0;}
 reset(){this.stop();this.finished.clear();this.events=[];this.lastTime=0;}
 async load(){this.audio.start();const c=this.audio.context;if(!c)return;await Promise.all(OPENING_VOICES.map(async v=>{if(this.buffers.has(v.id))return;try{const r=await fetch(new URL(v.src,import.meta.url));if(!r.ok)throw Error('voice HTTP '+r.status);const buffer=await c.decodeAudioData(await r.arrayBuffer());if(buffer.duration<.1)throw Error('empty voice');this.buffers.set(v.id,buffer);}catch(e){this.events.push({id:v.id,error:e.message});}}));}
 stop(){const source=this.source;this.source=null;this.playingId=null;if(source){try{source.stop();}catch{}source.disconnect();}this.resume=null;}
 pause(){if(!this.source)return;const clip=OPENING_VOICES.find(c=>c.id===this.playingId),offset=Math.max(0,this.sourceOffset+this.audio.context.currentTime-this.sourceAudioStart);this.stop();this.resume={clip,offset};}
 begin(clip,buffer,offset,time){const c=this.audio.context,source=c.createBufferSource(),gain=c.createGain();source.buffer=buffer;gain.gain.value=clip.id.startsWith('alex-')?.83:.92;source.connect(gain);gain.connect(this.audio.master);this.source=source;this.playingId=clip.id;this.sourceOffset=offset;this.sourceAudioStart=c.currentTime;source.onended=()=>{gain.disconnect();source.disconnect();if(this.source===source){this.source=null;this.playingId=null;this.finished.add(clip.id);}};source.start(0,offset);this.events.push({id:clip.id,at:time,offset});}
 sync(time,paused){if(paused){this.pause();return;}if(time<this.lastTime-.1){this.stop();this.finished.clear();}this.lastTime=time;const current=openingVoice(time);
  if(this.resume){const{clip,offset}=this.resume,buffer=this.buffers.get(clip?.id);this.resume=null;if(clip&&buffer&&offset<buffer.duration&&time>=clip.start&&time<clip.end+1.5&&(!current||current.id===clip.id)){this.begin(clip,buffer,offset,time);return;}}
  if(!current)return;const buffer=this.buffers.get(current.id);if(!buffer||this.playingId===current.id||this.finished.has(current.id))return;
  // A late video frame must not cut off the first syllable. Allow a short spoken
  // tail through the following silent gap; a new line still takes priority.
  if(this.source)this.stop();this.begin(current,buffer,0,time);
 }
}
