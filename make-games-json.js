// Usage: node make-games-json.js
// Scans ./games (folders with an index.html, or loose .html files) and writes games.json.
// Put a cover.png / thumb.jpg next to a game's index.html and it is used as the card image.
const fs=require("fs"),p=require("path"),D="games",IMG=/\.(png|jpe?g|webp|gif)$/i,out=[];
const nice=s=>s.replace(/\.html?$/i,"").replace(/[-_]+/g," ").replace(/\b\w/g,m=>m.toUpperCase());
for(const e of fs.readdirSync(D,{withFileTypes:true})){
  if(e.isDirectory()){
    const files=fs.readdirSync(p.join(D,e.name)),h=files.find(x=>/^index\.html?$/i.test(x));
    if(!h)continue;
    const i=files.find(x=>IMG.test(x)&&/^(cover|thumb|icon|logo|image)/i.test(x));
    out.push({name:nice(e.name),image:i?`${D}/${e.name}/${i}`:"",path:`${D}/${e.name}/${h}`});
  }else if(/\.html?$/i.test(e.name))out.push({name:nice(e.name),image:"",path:`${D}/${e.name}`});
}
out.sort((a,b)=>a.name.localeCompare(b.name));
fs.writeFileSync("games.json",JSON.stringify(out,null,2));
console.log(out.length+" games written to games.json");
