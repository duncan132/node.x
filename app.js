const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],root=document.documentElement;
const ST={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const LOGO="https://tr.rbxcdn.com/180DAY-a175ab77fef306e1a567da03872fd10f/420/420/BackAccessory/Webp/noFilter";
const FALLBACK="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#7c5cff"/><path d="M20 20l24 24M44 20L20 44" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>');
const TRACKS=[{title:"Track 1",file:"music/track1.mp3"},{title:"Track 2",file:"music/track2.mp3"}]; // your own music files go in /music
const THEMES={neon:{n:"Neon Night",p:["#0b0d1a","#1a1f3d","#7c5cff"],fx:"#fff",logo:LOGO},mei:{n:"mei mei snow leopard",p:["#000","#222","#e8e8e8"],fx:"#fff",logo:LOGO},david:{n:"David Douglas",p:["#fff","#d90429","#d90429"],fx:"#d90429",logo:"https://cache.bsnsports.com/comp/sls/get/43/15387?f=jpg&sid=15387&ts=1749478020"}};
const SWATCH=["#7c5cff","#ff2d75","#22d3ee","#34d399","#fbbf24","#fb7185","#a3e635","#38bdf8","#f97316","#e879f9"];
const FXG={Weather:{snow:"Snow",rain:"Rain",lightning:"Lightning",aurora:"Aurora",bubbles:"Bubbles"},Space:{stars:"Stars",meteors:"Falling stars",warp:"Warp speed",galaxy:"Galaxy"},Party:{rave:"Rave",lasers:"Lasers",fireworks:"Fireworks",confetti:"Confetti",equalizer:"Equalizer"},Tech:{matrix:"Matrix",network:"Network",grid:"Retro grid",glitch:"Glitch"},Cozy:{fireflies:"Fireflies",embers:"Embers",waves:"Waves"},Interactive:{trail:"Cursor trail",ripples:"Click ripples"}};
const FXL=Object.assign({},...Object.values(FXG));
const I={
games:'<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10v5M4.5 12.5h5"/><circle cx="16" cy="11.5" r="1"/><circle cx="18.5" cy="14" r="1"/>',
star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
dice:'<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1"/><circle cx="15.5" cy="15.5" r="1"/><circle cx="12" cy="12" r="1"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>',
full:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
close:'<path d="M5 5l14 14M19 5L5 19"/>',
prev:'<path d="M6 5v14M19 5L9 12l10 7z"/>',
next:'<path d="M18 5v14M5 5l10 7-10 7z"/>',
play:'<path d="M7 4l13 8-13 8z"/>',
pause:'<path d="M8 4v16M16 4v16"/>',
vol:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9a4 4 0 010 6"/>',
link:'<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
upload:'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
reset:'<path d="M4 12a8 8 0 112.3 5.7M4 18v-5h5"/>',
off:'<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
stars:'<path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z"/>',
meteors:'<path d="M20 4L6 18M20 4l-5 1M20 4l-1 5M4 12l-2 2M9 20l-2 2"/>',
snow:'<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/>',
rain:'<path d="M8 4l-2 6M14 4l-2 6M20 4l-2 6M8 14l-2 6M14 14l-2 6"/>',
lasers:'<path d="M3 20L21 4M3 20L21 12M3 20L12 3"/>',
rave:'<circle cx="12" cy="13" r="7"/><path d="M12 2v4M5 13h14M12 6v14M7.5 8.5c3 2 6 2 9 0M7.5 17.5c3-2 6-2 9 0"/>',
matrix:'<path d="M5 4v6M5 14v6M12 7v10M19 4v4M19 12v8"/>',
fireflies:'<circle cx="7" cy="8" r="1.5"/><circle cx="16" cy="6" r="1.5"/><circle cx="12" cy="15" r="1.5"/><circle cx="18" cy="17" r="1.5"/>',
confetti:'<path d="M4 20l4-12 8 8zM14 4l1 3M19 9h3M18 3l-1 2"/>',
home:'<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
aurora:'<path d="M3 17c3-8 6-8 9 0s6 8 9 0M3 11c3-6 6-6 9 0s6 6 9 0"/>',
bubbles:'<circle cx="8" cy="15" r="4"/><circle cx="17" cy="8" r="3"/><circle cx="16" cy="17" r="1.5"/>',
fireworks:'<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
lightning:'<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
embers:'<path d="M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/>',
warp:'<path d="M12 12L4 4M12 12l8-8M12 12L4 20M12 12l8 8"/><circle cx="12" cy="12" r="1"/>',
grid:'<path d="M3 21l5-9h8l5 9zM8 12l-2 9M16 12l2 9M12 12v9M6 16h12"/>',
waves:'<path d="M2 9c3-3 5 3 8 0s5 3 8 0M2 15c3-3 5 3 8 0s5 3 8 0"/>',
equalizer:'<path d="M5 20V10M10 20V4M15 20V13M20 20V7"/>',
network:'<circle cx="5" cy="6" r="2"/><circle cx="19" cy="8" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 7l10 1M6 8l5 8M18 10l-5 6"/>',
galaxy:'<circle cx="12" cy="12" r="2"/><path d="M12 4a8 8 0 018 8M12 20a8 8 0 01-8-8M12 7a5 5 0 015 5"/>',
glitch:'<path d="M3 7h12M9 12h12M3 17h8"/>',
trail:'<path d="M5 19l5-14 3 6 6 3z"/>',
ripples:'<circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="10"/>'};
const svg=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${I[n]||""}</svg>`;
const icons=()=>$$("[data-i]").forEach(e=>e.innerHTML=svg(e.dataset.i));
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),2200)};
const calm=matchMedia("(prefers-reduced-motion: reduce)").matches;
const S=Object.assign({theme:"neon",accent:null,fs:16,rad:14,cs:170,logo:null,fx:calm?{}:{stars:1,meteors:1},k:1,sp:1},ST.get("nodex",{}));

// ---- navigation ----
$$("nav button").forEach(b=>b.onclick=()=>{$$("nav button").forEach(x=>x.classList.toggle("on",x===b));$$(".view").forEach(v=>v.classList.toggle("on",v.id==="v-"+b.dataset.v));document.body.dataset.v=b.dataset.v});
document.body.dataset.v="home";

// ---- settings UI ----
$("#themes").innerHTML=Object.entries(THEMES).map(([k,t])=>`<button class="th" data-t="${k}"><span class="pv" style="--b:${t.p[0]};--p:${t.p[1]};--a:${t.p[2]}"><em></em><b></b></span>${t.n}</button>`).join("");
$$(".th").forEach(b=>b.onclick=()=>{S.theme=b.dataset.t;S.accent=null;S.logo=null;apply()});
$("#swatches").innerHTML=SWATCH.map(c=>`<button class="sw" data-c="${c}" style="background:${c}" aria-label="${c}"></button>`).join("");
$$(".sw").forEach(b=>b.onclick=()=>{S.accent=b.dataset.c;apply()});
$("#accent").oninput=e=>{S.accent=e.target.value;apply()};
$("#fxlist").innerHTML=Object.entries(FXG).map(([g,l])=>`<h4>${g}</h4><div class="tiles">${Object.entries(l).map(([k,n])=>`<button class="fx" data-f="${k}"><i data-i="${k}"></i>${n}</button>`).join("")}</div>`).join("");
$$(".fx").forEach(b=>b.onclick=()=>{S.fx[b.dataset.f]=S.fx[b.dataset.f]?0:1;apply()});
$("#fxoff").onclick=()=>{S.fx={};apply()};
$("#fxrnd").onclick=()=>{S.fx=Object.fromEntries(Object.keys(FXL).sort(()=>Math.random()-.5).slice(0,3).map(x=>[x,1]));apply()};
const SL={fs:"fs",rad:"rad",cs:"cs",fxk:"k",fxs:"sp"};
Object.entries(SL).forEach(([id,key])=>$("#"+id).oninput=e=>{S[key]=+e.target.value;apply()});

// ---- logo ----
[$("#logo"),$("#heroLogo")].forEach(im=>im.onerror=()=>{if(im.src!==FALLBACK)im.src=FALLBACK});
$("#logoSet").onclick=()=>{const u=$("#logoUrl").value.trim();if(u){S.logo=u;apply()}};
$("#logoReset").onclick=()=>{S.logo=null;$("#logoUrl").value="";apply()};
$("#logoFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement("canvas"),k=Math.min(1,256/Math.max(im.width,im.height));c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);S.logo=c.toDataURL("image/png");apply()};im.src=r.result};r.readAsDataURL(f)};

// ---- games ----
let G=[],cat="All",N=120,favs=ST.get("nodex-favs",[]);
function card(g){const d=document.createElement("div");d.className="card";d.innerHTML='<div class="cv"></div><p></p><button class="fv" aria-label="Favorite"></button>';
 const c=d.querySelector(".cv");if(g.image){const im=new Image();im.loading="lazy";im.alt="";im.src=g.image;im.onerror=()=>{im.remove();c.textContent=g.name[0]};c.append(im)}else c.textContent=g.name[0];
 d.querySelector("p").textContent=g.name;const f=d.querySelector(".fv");f.innerHTML=svg("star");f.classList.toggle("on",favs.includes(g.name));
 f.onclick=e=>{e.stopPropagation();favs=favs.includes(g.name)?favs.filter(x=>x!==g.name):[...favs,g.name];ST.set("nodex-favs",favs);grid()};
 d.onclick=()=>openGame(g);return d}
function chips(){const c=[...new Set(G.map(g=>g.cat).filter(Boolean))];$("#chips").hidden=!c.length;
 $("#chips").replaceChildren(...["All",...c].map(n=>{const b=document.createElement("button");b.textContent=n;b.className=n===cat?"on":"";b.onclick=()=>{cat=n;N=120;chips();grid()};return b}))}
function grid(){const q=$("#q").value.toLowerCase(),l=G.filter(g=>g.name.toLowerCase().includes(q)&&(cat==="All"||g.cat===cat));
 $("#grid").replaceChildren(...l.slice(0,N).map(card));$("#fgrid").replaceChildren(...G.filter(g=>favs.includes(g.name)).map(card));
 $("#more").hidden=l.length<=N;$("#empty").textContent=G.length?(l.length?"":"No games match that search."):"No games yet. Run make-games-json.js or edit games.json."}
$("#more").onclick=()=>{N+=120;grid()};
$("#q").oninput=()=>{N=120;grid();$("[data-v=games]").click()};
fetch("games.json").then(r=>r.json()).then(j=>{G=Array.isArray(j)?j:[];$("#sGames").textContent=G.length;chips();grid()}).catch(()=>grid());
function openGame(g){if(!g.path)return toast("No game file linked for "+g.name);$("#gt").textContent=g.name;$("#frame").src=g.path;$("#player").hidden=false}
$("#close").onclick=()=>{$("#frame").src="about:blank";$("#player").hidden=true};
$("#reload").onclick=()=>{$("#frame").src=$("#frame").src};
$("#full").onclick=()=>$("#frame").requestFullscreen?.();
$("#rand").onclick=()=>{const p=G.filter(g=>g.path);p.length?openGame(p[Math.random()*p.length|0]):toast("No games yet")};

// ---- music ----
const au=$("#audio");let ti=0;
$("#tracks").replaceChildren(...TRACKS.map((t,n)=>{const li=document.createElement("li");li.textContent=t.title;li.onclick=()=>track(n,1);return li}));
function track(n,p){if(!TRACKS.length)return;ti=(n+TRACKS.length)%TRACKS.length;au.src=TRACKS[ti].file;$("#now").textContent=TRACKS[ti].title;$$("#tracks li").forEach((l,i)=>l.classList.toggle("on",i===ti));if(p)au.play().catch(()=>toast("Couldn't play that file"))}
$("#play").onclick=()=>au.src?(au.paused?au.play():au.pause()):track(0,1);
au.onplay=()=>{$("#play").innerHTML=svg("pause")};au.onpause=()=>{$("#play").innerHTML=svg("play")};au.onended=()=>track(ti+1,1);
$("#prev").onclick=()=>track(ti-1,1);$("#next").onclick=()=>track(ti+1,1);$("#vol").oninput=e=>{au.volume=e.target.value};au.volume=.6;

// ---- apply ----
function apply(){const st=root.style,th=THEMES[S.theme]||THEMES.neon;
 root.dataset.theme=THEMES[S.theme]?S.theme:"neon";
 st.setProperty("--fs",S.fs+"px");st.setProperty("--rad",S.rad+"px");st.setProperty("--cs",S.cs+"px");
 if(S.accent){st.setProperty("--accent",S.accent);$("#accent").value=S.accent}else st.removeProperty("--accent");
 const lg=S.logo||th.logo||LOGO;$("#logo").src=lg;$("#heroLogo").src=lg;
 for(const[id,key]of Object.entries(SL))$("#"+id).value=S[key];
 $$(".th").forEach(b=>b.classList.toggle("on",b.dataset.t===S.theme));
 $$(".fx").forEach(b=>b.classList.toggle("on",!!S.fx[b.dataset.f]));
 $("#rave").classList.toggle("on",!!S.fx.rave);
 FX.set(S.fx,S.k,S.sp,th.fx);ST.set("nodex",S)}
$("#resetAll").onclick=()=>{ST.set("nodex",null);location.reload()};$("#sFx").textContent=Object.keys(FXL).length;$("#sTh").textContent=Object.keys(THEMES).length;icons();apply();
