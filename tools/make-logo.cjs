const {chromium}=require('playwright');const fs=require('fs');
const S=process.argv[2];const ic=JSON.parse(fs.readFileSync(S+'/icons.json'));
const sz=(h,w)=>h.replace(/width="\d+"/,`width="${w}"`).replace(/height="\d+"/,`height="${w}"`);
function page(dark){
 const bg=dark?'radial-gradient(circle at 30% 25%,#2f5f57 0%,#173a35 60%,#0f2723 100%)':'radial-gradient(circle at 30% 25%,#e9fbf5 0%,#bfeee0 55%,#8fd9c4 100%)';
 return `<html><body style="margin:0"><div style="width:600px;height:600px;background:${bg};position:relative;overflow:hidden">
 <div style="position:absolute;left:70px;bottom:70px;width:420px;height:70px;border-radius:50%;background:rgba(0,0,0,${dark?.25:.08});filter:blur(8px)"></div>
 <div style="position:absolute;left:40px;top:140px">${sz(ic[3],330)}</div>
 <div style="position:absolute;left:285px;top:215px">${sz(ic[1],270)}</div>
 <svg style="position:absolute;left:245px;top:100px" width="110" height="100" viewBox="0 0 110 100"><defs><radialGradient id="hh" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffc0cf"/><stop offset=".55" stop-color="#ff6f93"/><stop offset="1" stop-color="#cf3e66"/></radialGradient></defs>
 <path d="M55 92 C10 62 5 30 25 18 C40 9 52 18 55 28 C58 18 70 9 85 18 C105 30 100 62 55 92Z" fill="url(#hh)"/><ellipse cx="34" cy="30" rx="10" ry="6" fill="#fff" opacity=".6"/></svg>
 </div></body></html>`;}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:600,height:600}});
for(const d of [0,1]){await p.setContent(page(d));await p.screenshot({path:S+(d?'/logo-dark.png':'/logo.png')});}
await b.close();})();
