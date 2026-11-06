import * as Tone from 'tone';
export class SoundEngine{
 constructor(){this.voices=new Map();this.master=new Tone.Volume(-6).toDestination();this.limiter=new Tone.Limiter(-2).connect(this.master);this.muted=false}
 async ready(){await Tone.start()}
 async add(s){if(this.voices.has(s.id))return;const bytes=await s.blob.arrayBuffer();const buffer=await Tone.getContext().rawContext.decodeAudioData(bytes);const player=new Tone.Player(buffer);const filter=new Tone.Filter(s.controls.filter,'lowpass');const delay=new Tone.FeedbackDelay('8n',.25);const reverb=new Tone.Reverb({decay:3,wet:s.controls.reverb});const pan=new Tone.Panner(s.controls.pan);const volume=new Tone.Volume(s.controls.volume);player.chain(filter,delay,reverb,pan,volume,this.limiter);this.voices.set(s.id,{player,filter,delay,reverb,pan,volume,duration:buffer.duration});this.update(s);return buffer.duration}
 update(s){const v=this.voices.get(s.id);if(!v)return;const c=s.controls;v.player.playbackRate=c.rate;v.player.loop=c.loop;v.player.fadeIn=c.fade;v.player.fadeOut=c.fade;v.filter.frequency.rampTo(c.filter,.1);v.delay.wet.rampTo(c.delay,.1);v.reverb.wet.rampTo(c.reverb,.1);v.pan.pan.rampTo(c.pan,.1);v.volume.volume.rampTo(c.volume,.1)}
 async toggle(s){await this.ready();await this.add(s);const v=this.voices.get(s.id);if(v.player.state==='started')v.player.stop();else v.player.start();}
 async playAll(samples){await this.ready();for(const s of samples){await this.add(s);const p=this.voices.get(s.id).player;if(p.state!=='started')p.start()}}
 stop(){for(const v of this.voices.values())if(v.player.state==='started')v.player.stop()}
 playing(id){return this.voices.get(id)?.player.state==='started'}
 delete(id){const v=this.voices.get(id);if(v){Object.values(v).forEach(n=>n?.dispose?.());this.voices.delete(id)}}
 mute(){this.muted=!this.muted;this.master.mute=this.muted;return this.muted}
}
export function demoBlob(index){const sr=22050,n=sr*4,buf=new ArrayBuffer(44+n*2),v=new DataView(buf);const str=(p,s)=>[...s].forEach((c,i)=>v.setUint8(p+i,c.charCodeAt(0)));str(0,'RIFF');v.setUint32(4,36+n*2,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,n*2,true);const f=[130.81,164.81,196,261.63,329.63,392,523.25,659.25,783.99][index%9];for(let i=0;i<n;i++){const t=i/sr,e=Math.sin(Math.PI*i/n)**2;const x=(Math.sin(2*Math.PI*f*t)+.25*Math.sin(2*Math.PI*f*2.003*t))*.15*e;v.setInt16(44+2*i,x*32767,true)}return new Blob([buf],{type:'audio/wav'})}
