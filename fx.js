const FX=(()=>{
const cv=document.getElementById("bg"),c=cv.getContext("2d"),R=Math.random,T=Math.PI*2;
let W,H,on={},k=1,sp=1,col="#fff",dark=true,P={},raf=0,last=0;
const FW=[],NW=[],TR=[],RP=[];let LT=0,LB=[],GB=null;
const E={
stars:{n:110,mk:()=>({x:R()*W,y:R()*H,r:R()*1.4+.3,p:R()*6}),dr(p,t){c.globalAlpha=.3+.7*Math.abs(Math.sin(t/900*sp+p.p));c.fillStyle=col;c.beginPath();c.arc(p.x,p.y,p.r,0,T);c.fill()}},
meteors:{n:4,mk:()=>({x:R()*W*1.3-W*.3,y:-60,vx:9+R()*5,vy:4+R()*3,d:R()*150}),
 up(p,dt){if(p.d>0){p.d-=dt;return}p.x+=p.vx*sp*dt;p.y+=p.vy*sp*dt;if(p.y>H+60)Object.assign(p,E.meteors.mk())},
 dr(p){if(p.d>0)return;const x=p.x-p.vx*9,y=p.y-p.vy*9,g=c.createLinearGradient(p.x,p.y,x,y);g.addColorStop(0,col);g.addColorStop(1,"rgba(255,255,255,0)");c.strokeStyle=g;c.lineWidth=2;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(x,y);c.stroke()}},
snow:{n:130,mk:()=>({x:R()*W,y:R()*H,r:1+R()*3,v:.6+R()*1.4,ph:R()*6}),up(p,dt){p.y+=p.v*sp*dt;p.x+=Math.sin(p.ph+=.02*sp*dt)*.6;if(p.y>H+5){p.y=-5;p.x=R()*W}},dr(p){c.globalAlpha=.85;c.fillStyle=col;c.beginPath();c.arc(p.x,p.y,p.r,0,T);c.fill()}},
rain:{n:170,mk:()=>({x:R()*W,y:R()*H,l:12+R()*18,v:14+R()*10}),up(p,dt){p.y+=p.v*sp*dt;p.x-=p.v*.12*sp*dt;if(p.y>H){p.y=-30;p.x=R()*W*1.1}},dr(p){c.globalAlpha=.4;c.strokeStyle=col;c.lineWidth=1.2;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+p.l*.12,p.y-p.l);c.stroke()}},
lasers:{all(t){c.globalCompositeOperation=dark?"lighter":"source-over";c.lineWidth=2.5;const m=Math.round(6*k)||1;
 for(let i=0;i<m;i++){const top=i%2,x=(i+.5)/m*W,y=top?0:H,a=(top?1.57:-1.57)+Math.sin(t/900*sp+i*1.7),L=Math.max(W,H)*1.6,h=dark?(t/25+i*55)%360:350,s=`hsl(${h} 100% 55%)`;
 c.strokeStyle=s;c.shadowColor=s;c.shadowBlur=14;c.globalAlpha=.8;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);c.stroke()}}},
rave:{all(t){c.globalCompositeOperation=dark?"lighter":"source-over";const b=1-((t*sp/469)%1);
 for(let i=0;i<7;i++){const a=-1.57+Math.sin(t/700*sp+i)*.9,x=W*(i+.5)/7,L=H*1.6;c.fillStyle=`hsla(${dark?(t/10+i*50)%360:350},100%,60%,${.06+.16*b})`;c.beginPath();c.moveTo(x,H);c.lineTo(x+Math.cos(a-.13)*L,H+Math.sin(a-.13)*L);c.lineTo(x+Math.cos(a+.13)*L,H+Math.sin(a+.13)*L);c.fill()}}},
matrix:{n:45,mk:()=>({x:(R()*W/16|0)*16,y:R()*H,v:2+R()*4}),up(p,dt){p.y+=p.v*sp*dt;if(p.y-230>H){p.y=0;p.x=(R()*W/16|0)*16}},
 dr(p){c.font="14px monospace";for(let i=0;i<14;i++){c.globalAlpha=1-i/14;c.fillStyle=i?(dark?"#0f4":col):(dark?"#cfc":col);c.fillText(String.fromCharCode(0x30A0+(R()*60|0)),p.x,p.y-i*16)}}},
fireflies:{n:45,mk:()=>({x:R()*W,y:R()*H,a:R()*T,ph:R()*6}),up(p,dt){p.a+=(R()-.5)*.2;p.x+=Math.cos(p.a)*.6*sp*dt;p.y+=Math.sin(p.a)*.6*sp*dt;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0},
 dr(p,t){c.globalAlpha=.3+.7*Math.abs(Math.sin(t/600*sp+p.ph));c.fillStyle=dark?"#ffe066":col;c.shadowColor=c.fillStyle;c.shadowBlur=14;c.beginPath();c.arc(p.x,p.y,2.4,0,T);c.fill()}},
confetti:{n:80,mk:()=>({x:R()*W,y:R()*H,w:6+R()*6,h:3+R()*4,v:1+R()*2,r:R()*6,vr:(R()-.5)*.2,hue:R()*360,ph:R()*6}),up(p,dt){p.y+=p.v*sp*dt;p.x+=Math.sin(p.ph+=.03*sp*dt);p.r+=p.vr*sp*dt;if(p.y>H+10){p.y=-10;p.x=R()*W}},
 dr(p){c.globalAlpha=.9;c.fillStyle=`hsl(${p.hue} 90% 60%)`;c.save();c.translate(p.x,p.y);c.rotate(p.r);c.fillRect(-p.w/2,-p.h/2,p.w,p.h);c.restore()}},
aurora:{all(t){c.globalCompositeOperation=dark?"lighter":"source-over";for(let b=0;b<3;b++){const h=dark?[140,180,280][b]:350,g=c.createLinearGradient(0,H*.1,0,H*.6);g.addColorStop(0,`hsla(${h},90%,60%,0)`);g.addColorStop(.5,`hsla(${h},90%,60%,.25)`);g.addColorStop(1,`hsla(${h},90%,60%,0)`);c.fillStyle=g;c.beginPath();c.moveTo(0,H*.6);for(let x=0;x<=W;x+=40)c.lineTo(x,H*.3+b*40+Math.sin(x/200+t/1500*sp+b*2)*60);c.lineTo(W,H*.6);c.fill()}}},
bubbles:{n:40,mk:()=>({x:R()*W,y:R()*H,r:4+R()*18,v:.4+R()*1.2,ph:R()*6}),up(p,dt){p.y-=p.v*sp*dt;p.x+=Math.sin(p.ph+=.02*sp*dt)*.5;if(p.y<-30){p.y=H+30;p.x=R()*W}},dr(p){c.globalAlpha=.55;c.strokeStyle=col;c.fillStyle=col;c.lineWidth=1.5;c.beginPath();c.arc(p.x,p.y,p.r,0,T);c.stroke();c.beginPath();c.arc(p.x-p.r*.35,p.y-p.r*.35,p.r*.15,0,T);c.fill()}},
fireworks:{all(t,dt){c.globalCompositeOperation=dark?"lighter":"source-over";if(R()<.02*k*sp*dt){const x=R()*W,y=H*.15+R()*H*.4,h=R()*360;for(let i=0;i<50;i++){const a=R()*T,s=1+R()*4;FW.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,h})}}for(let i=FW.length;i--;){const p=FW[i];p.x+=p.vx*sp*dt;p.y+=p.vy*sp*dt;p.vy+=.04*dt;p.l-=.012*sp*dt;if(p.l<=0){FW.splice(i,1);continue}c.globalAlpha=p.l;c.fillStyle=dark?`hsl(${p.h} 100% 60%)`:col;c.beginPath();c.arc(p.x,p.y,2,0,T);c.fill()}}},
lightning:{all(t,dt){if(R()<.006*k*sp*dt){let x=R()*W,y=0;LB=[[x,y]];while(y<H*.8){x+=R()*80-40;y+=20+R()*30;LB.push([x,y])}LT=1}if(LT>0){c.globalAlpha=LT*.3;c.fillStyle=dark?"#cfe0ff":col;c.fillRect(0,0,W,H);c.globalAlpha=LT;c.strokeStyle=dark?"#fff":col;c.lineWidth=2.5;c.shadowColor="#9cf";c.shadowBlur=20;c.beginPath();LB.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();LT-=.05*dt*sp}}},
embers:{n:70,mk:()=>({x:R()*W,y:R()*H,r:1+R()*2.5,v:.8+R()*2,ph:R()*6}),up(p,dt){p.y-=p.v*sp*dt;p.x+=Math.sin(p.ph+=.04*sp*dt);if(p.y<-5){p.y=H+5;p.x=R()*W}},dr(p){c.globalAlpha=.4+.6*R();c.fillStyle=dark?`hsl(${20+R()*25} 100% 55%)`:col;c.shadowColor=c.fillStyle;c.shadowBlur=8;c.beginPath();c.arc(p.x,p.y,p.r,0,T);c.fill()}},
warp:{n:140,mk:()=>({a:R()*T,d:R()*Math.max(W,H)*.5,v:R()*3+1}),up(p,dt){p.d+=p.v*(p.d/80+1)*sp*dt;if(p.d>Math.max(W,H)*.8){p.d=2;p.a=R()*T}},dr(p){const x=W/2+Math.cos(p.a)*p.d,y=H/2+Math.sin(p.a)*p.d,l=p.d*.08;c.globalAlpha=Math.min(1,p.d/200);c.strokeStyle=col;c.lineWidth=1+p.d/300;c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.cos(p.a)*l,y-Math.sin(p.a)*l);c.stroke()}},
grid:{all(t){c.globalCompositeOperation=dark?"lighter":"source-over";c.strokeStyle=dark?"#ff2bd6":col;c.shadowColor=c.strokeStyle;c.shadowBlur=8;c.globalAlpha=.7;c.lineWidth=1.2;const hz=H*.55,o=(t/2000*sp)%1;for(let i=0;i<14;i++){const y=hz+(H-hz)*((i+o)/14)**2;c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}for(let i=-12;i<=12;i++){c.beginPath();c.moveTo(W/2+i*20,hz);c.lineTo(W/2+i*W/10,H);c.stroke()}}},
waves:{all(t){for(let b=0;b<3;b++){c.globalAlpha=.25;c.fillStyle=dark?`hsl(${200+b*40} 90% 55%)`:col;c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=20)c.lineTo(x,H*.82+b*22+Math.sin(x/120+t/700*sp*(1+b*.3)+b)*18);c.lineTo(W,H);c.fill()}}},
equalizer:{all(t){const n=Math.round(48*k)||1,w=W/n;for(let i=0;i<n;i++){const h=(Math.sin(t/300*sp+i*.5)*.5+.5)*(Math.sin(t/170*sp+i*1.3)*.5+.5)*H*.35+6;c.globalAlpha=.7;c.fillStyle=dark?`hsl(${i/n*360} 90% 60%)`:col;c.fillRect(i*w+2,H-h,w-4,h)}}},
network:{all(t,dt){const n=Math.round(60*k);while(NW.length<n)NW.push({x:R()*W,y:R()*H,vx:R()-.5,vy:R()-.5});NW.length=n;c.fillStyle=col;c.strokeStyle=col;c.lineWidth=1;for(const p of NW){p.x+=p.vx*sp*dt;p.y+=p.vy*sp*dt;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;c.globalAlpha=.8;c.beginPath();c.arc(p.x,p.y,2.2,0,T);c.fill()}for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const a=NW[i],b=NW[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<140){c.globalAlpha=(1-d/140)*.5;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke()}}}},
galaxy:{n:260,mk:()=>({a:R()*T,d:R()**2*Math.min(W,H)*.45,s:R()*1.5+.4}),up(p,dt){p.a+=.003*sp*dt*(1+60/(p.d+30))},dr(p){const a=p.a+p.d/55,x=W/2+Math.cos(a)*p.d*1.4,y=H/2+Math.sin(a)*p.d*.55;c.globalAlpha=.8;c.fillStyle=dark?`hsl(${220+p.d/2} 90% 70%)`:col;c.beginPath();c.arc(x,y,p.s,0,T);c.fill()}},
glitch:{all(){c.globalCompositeOperation=dark?"lighter":"source-over";if(!GB&&R()<.05*sp)GB={n:6,b:Array.from({length:4},()=>[R()*H,2+R()*14,R()*3|0])};if(GB){for(const b of GB.b){c.globalAlpha=.3;c.fillStyle=dark?["#f0f","#0ff","#ff0"][b[2]]:col;c.fillRect(0,b[0],W,b[1])}if(--GB.n<=0)GB=null}}},
trail:{all(t,dt){for(let i=TR.length;i--;){const p=TR[i];p.l-=.025*dt;if(p.l<=0){TR.splice(i,1);continue}c.globalAlpha=p.l;c.fillStyle=dark?`hsl(${p.h} 100% 65%)`:col;c.beginPath();c.arc(p.x,p.y,4*p.l+1,0,T);c.fill()}}},
ripples:{all(t,dt){for(let i=RP.length;i--;){const p=RP[i];p.r+=4*sp*dt;if(p.r>260){RP.splice(i,1);continue}c.globalAlpha=1-p.r/260;c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,p.r,0,T);c.stroke()}}}
};
const size=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight};
const build=()=>{P={};for(const f in on)if(on[f]&&E[f]&&E[f].n)P[f]=Array.from({length:Math.round(E[f].n*k)},E[f].mk)};
function loop(t){raf=requestAnimationFrame(loop);const dt=Math.min(3,(t-last)/16.7||1);last=t;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);
 for(const f in on){if(!on[f]||!E[f])continue;const e=E[f];c.globalCompositeOperation="source-over";c.shadowBlur=0;c.globalAlpha=1;
  if(e.all)e.all(t,dt);else for(const p of P[f]||[]){e.up&&e.up(p,dt);e.dr(p,t)}}}
function set(o,K,S,C){on=o;k=K;sp=S;col=C;dark=C==="#fff";build();cancelAnimationFrame(raf);raf=0;if(Object.values(on).some(Boolean))raf=requestAnimationFrame(loop);else c.clearRect(0,0,W,H)}
addEventListener("resize",()=>{size();build()});
document.addEventListener("visibilitychange",()=>{if(document.hidden)cancelAnimationFrame(raf);else if(raf){last=performance.now();raf=requestAnimationFrame(loop)}});
addEventListener("pointermove",e=>{if(on.trail)TR.push({x:e.clientX,y:e.clientY,l:1,h:(performance.now()/5)%360})});
addEventListener("pointerdown",e=>{if(on.ripples)RP.push({x:e.clientX,y:e.clientY,r:0})});
size();return{set}})();
