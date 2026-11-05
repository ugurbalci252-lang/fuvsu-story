// Kullanım: node render.js <story|post> kart <konuIndex> <cikti.jpg>
//           node render.js <story|post> foto <fotoYolu> <cikti.jpg> "<İş türü · İlçe>"
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const TEL='0501 042 44 57', IG='@fuvsuofficall', BOLGE='İstanbul · Kocaeli · Sakarya';
const [,,bicim,tur,a,cikti,etiket]=process.argv;
const W=1080,H=bicim==='post'?1350:1920,S=bicim==='post'?0.72:1;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const css=`*{margin:0;box-sizing:border-box}body{width:${W}px;height:${H}px;font-family:"DejaVu Sans",Arial,sans-serif;color:#fff;overflow:hidden}
.ust{font-size:${44*S}px;letter-spacing:6px;font-weight:700}.ust small{display:block;font-size:${28*S}px;letter-spacing:2px;opacity:.85;margin-top:8px;font-weight:400}
.tel{background:#ffd23f;color:#0b2a4a;border-radius:${30*S}px;padding:${34*S}px ${44*S}px;font-weight:800;font-size:${74*S}px;letter-spacing:1px;display:flex;align-items:center;gap:${22*S}px}
.tel small{display:block;font-size:${30*S}px;font-weight:600;letter-spacing:0;margin-bottom:4px}
.alt{display:flex;justify-content:space-between;font-size:${30*S}px;opacity:.9;margin-top:${26*S}px}`;
let body;
if(tur==='kart'){const k=JSON.parse(fs.readFileSync(path.join(__dirname,'konular.json')))[+a];
body=`<style>${css}body{background:linear-gradient(160deg,#0b3d6e 0%,#0e6aa8 55%,#19a0d8 100%);display:flex;flex-direction:column;justify-content:space-between;padding:${120*S}px ${80*S}px ${110*S}px}
.etk{display:inline-block;background:rgba(255,255,255,.18);border-radius:40px;padding:${12*S}px ${30*S}px;font-size:${32*S}px;font-weight:700;margin-bottom:${30*S}px}
h1{font-size:${100*S}px;line-height:1.05;margin-bottom:${36*S}px}p{font-size:${48*S}px;line-height:1.35}
.kutu{background:rgba(255,255,255,.14);border-radius:${34*S}px;padding:${40*S}px ${50*S}px;margin-top:${50*S}px;font-size:${44*S}px;line-height:1.45}</style>
<div class="ust">FUVSU POMPA<small>Teknik Servis · Tesisat · Montaj</small></div>
<div><div class="etk">${esc(k.hizmet)}</div><h1>${esc(k.baslik).replace(/\n/g,'<br>')}</h1><p>${esc(k.metin)}</p>
<div class="kutu">${k.maddeler.map(m=>'✔ '+esc(m)).join('<br>')}</div></div>
<div><div class="tel">📞<div><small>${esc(k.cagri)}</small>${TEL}</div></div><div class="alt"><span>${BOLGE}</span><span>${IG}</span></div></div>`;}
else{const img='data:image/jpeg;base64,'+fs.readFileSync(a).toString('base64');
body=`<style>${css}body{background:#000 url(${img}) center/cover no-repeat;position:relative}
.ustb{position:absolute;top:0;left:0;right:0;padding:${90*S}px ${70*S}px ${120*S}px;background:linear-gradient(rgba(0,0,0,.6),transparent)}
.altb{position:absolute;bottom:0;left:0;right:0;padding:${160*S}px ${70*S}px ${100*S}px;background:linear-gradient(transparent,rgba(0,0,0,.82) 35%)}
.is{font-size:${62*S}px;font-weight:800;margin-bottom:${30*S}px;line-height:1.15}</style>
<div class="ustb"><div class="ust">FUVSU POMPA<small>Teknik Servis · Tesisat · Montaj</small></div></div>
<div class="altb">${etiket?`<div class="is">${esc(etiket)}</div>`:''}<div class="tel">📞<div><small>Servis · Tesisat · Montaj</small>${TEL}</div></div><div class="alt"><span>${BOLGE}</span><span>${IG}</span></div></div>`;}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:H}});
await p.setContent('<!doctype html><meta charset="utf-8">'+body);await p.waitForTimeout(300);
await p.screenshot({path:cikti,type:'jpeg',quality:90});await b.close();})();
