// Kullanım:
//  node render.js <story|post> kart <konuIndex> <cikti.jpg>            (konular.json'dan)
//  node render.js <story|post> json <icerik.json> <cikti.jpg>          (serbest içerik)
//  node render.js <story|post> foto <foto.jpg> <cikti.jpg> "<İş türü · İlçe>" [tema]
// cizim (isteğe bağlı): hidrofor|dalgic|boru|anahtar|damla|bina|manometre|vana
// icerik.json: {stil:"klasik|soru|bilgi|sss|liste|buyuk", tema:"mavi|lacivert|turkuaz|turuncu|beyaz|yesil",
//               etiket, baslik (\n ile satır), metin, maddeler:[...], cagri}
const {chromium}=require('playwright');const ciz=require('./cizimler.js');const fs=require('fs');const path=require('path');
const TEL='0501 042 44 57', IG='@fuvsuofficall', BOLGE='İstanbul · Kocaeli · Sakarya';
const [,,bicim,tur,a,cikti,etiket,temaArg]=process.argv;
const W=1080,H=bicim==='post'?1350:1920,S=bicim==='post'?0.72:1;
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
const TEMALAR={
 mavi:{bg:'linear-gradient(160deg,#0b3d6e 0%,#0e6aa8 55%,#19a0d8 100%)',fg:'#fff',kutu:'rgba(255,255,255,.14)',vurgu:'#ffd23f',vfg:'#0b2a4a'},
 lacivert:{bg:'linear-gradient(170deg,#0a1a2f 0%,#12304f 100%)',fg:'#fff',kutu:'rgba(255,255,255,.08)',vurgu:'#ffd23f',vfg:'#0a1a2f'},
 turkuaz:{bg:'linear-gradient(160deg,#00796b 0%,#00a5a0 60%,#3fd0c9 100%)',fg:'#fff',kutu:'rgba(255,255,255,.16)',vurgu:'#fff',vfg:'#00695c'},
 turuncu:{bg:'linear-gradient(160deg,#e65100 0%,#f57c00 55%,#ffa726 100%)',fg:'#fff',kutu:'rgba(255,255,255,.17)',vurgu:'#0b2a4a',vfg:'#fff'},
 beyaz:{bg:'linear-gradient(170deg,#ffffff 0%,#e8f3fb 100%)',fg:'#0b2a4a',kutu:'rgba(14,106,168,.09)',vurgu:'#0e6aa8',vfg:'#fff'},
 yesil:{bg:'linear-gradient(160deg,#1b5e20 0%,#2e7d32 55%,#66bb6a 100%)',fg:'#fff',kutu:'rgba(255,255,255,.15)',vurgu:'#ffd23f',vfg:'#1b3a1c'}};
function telBlok(T,cagri){return `<div class="tel" style="background:${T.vurgu};color:${T.vfg}">📞<div><small>${esc(cagri||'Hemen arayın')}</small>${TEL}</div></div><div class="alt"><span>${BOLGE}</span><span>${IG}</span></div>`}
const baseCss=(T)=>`*{margin:0;box-sizing:border-box}body{width:${W}px;height:${H}px;font-family:"DejaVu Sans",Arial,sans-serif;color:${T.fg};overflow:hidden}
.ust{font-size:${44*S}px;letter-spacing:6px;font-weight:700}.ust small{display:block;font-size:${28*S}px;letter-spacing:2px;opacity:.85;margin-top:8px;font-weight:400}
.tel{border-radius:${30*S}px;padding:${34*S}px ${44*S}px;font-weight:800;font-size:${74*S}px;letter-spacing:1px;display:flex;align-items:center;gap:${22*S}px}
.tel small{display:block;font-size:${30*S}px;font-weight:600;letter-spacing:0;margin-bottom:4px}
.alt{display:flex;justify-content:space-between;font-size:${30*S}px;opacity:.9;margin-top:${26*S}px}
.etk{display:inline-block;background:${T.kutu};border-radius:40px;padding:${12*S}px ${30*S}px;font-size:${32*S}px;font-weight:700;margin-bottom:${30*S}px}
h1{font-size:${100*S}px;line-height:1.05;margin-bottom:${36*S}px}p{font-size:${48*S}px;line-height:1.35}
.kutu{background:${T.kutu};border-radius:${34*S}px;padding:${40*S}px ${50*S}px;margin-top:${50*S}px;font-size:${44*S}px;line-height:1.45}`;
function kartHtml(k){const T=TEMALAR[k.tema]||TEMALAR.mavi;const st=k.stil||'klasik';
 const ust=`<div class="ust">FUVSU POMPA<small>Teknik Servis · Tesisat · Montaj</small></div>`;
 const wrap=`body{background:${T.bg};display:flex;flex-direction:column;justify-content:space-between;padding:${120*S}px ${80*S}px ${110*S}px}`;
 let orta;
 if(st==='soru'){orta=`<div style="font-size:${260*S}px;line-height:1;font-weight:800;opacity:.9">?</div><h1 style="font-size:${110*S}px">${esc(k.baslik).replace(/\n/g,'<br>')}</h1><p>${esc(k.metin)}</p>`}
 else if(st==='bilgi'){orta=`<div class="etk">💡 Biliyor muydunuz?</div><h1 style="font-size:${84*S}px">${esc(k.baslik).replace(/\n/g,'<br>')}</h1><p>${esc(k.metin)}</p>${k.maddeler?.length?`<div class="kutu">${k.maddeler.map(m=>'• '+esc(m)).join('<br>')}</div>`:''}`}
 else if(st==='sss'){orta=`<div class="etk">❓ Sık sorulan</div><h1 style="font-size:${80*S}px">“${esc(k.baslik).replace(/\n/g,' ')}”</h1><div class="kutu" style="font-size:${46*S}px"><b>Cevap:</b> ${esc(k.metin)}</div>`}
 else if(st==='liste'){orta=`${k.etiket?`<div class="etk">${esc(k.etiket)}</div>`:''}<h1 style="font-size:${88*S}px">${esc(k.baslik).replace(/\n/g,'<br>')}</h1>${(k.maddeler||[]).map((m,i)=>`<div style="display:flex;gap:${28*S}px;align-items:center;font-size:${50*S}px;margin:${22*S}px 0"><span style="background:${T.vurgu};color:${T.vfg};border-radius:50%;width:${84*S}px;height:${84*S}px;display:flex;align-items:center;justify-content:center;font-weight:800;flex:none">${i+1}</span>${esc(m)}</div>`).join('')}`}
 else if(st==='buyuk'){orta=`<h1 style="font-size:${124*S}px;line-height:1">${esc(k.baslik).replace(/\n/g,'<br>')}</h1><p style="font-size:${54*S}px">${esc(k.metin)}</p>`}
 else{orta=`${k.etiket||k.hizmet?`<div class="etk">${esc(k.etiket||k.hizmet)}</div>`:''}<h1>${esc(k.baslik).replace(/\n/g,'<br>')}</h1><p>${esc(k.metin)}</p>${k.maddeler?.length?`<div class="kutu">${k.maddeler.map(m=>'✔ '+esc(m)).join('<br>')}</div>`:''}`}
 const svg=k.cizim?ciz(k.cizim,T.fg==='#fff'?'#ffffff':'#0e6aa8',T.fg==='#fff'?'rgba(255,255,255,.35)':'rgba(14,106,168,.3)'):'';
 const cz=svg?`<div style="width:${(bicim==='post'?380:560)}px;opacity:.95;margin-bottom:${30*S}px">${svg}</div>`:'';
 return `<style>${baseCss(T)}${wrap}</style>${ust}<div>${cz}${orta}</div><div>${telBlok(T,k.cagri)}</div>`;}
let body;
if(tur==='kart'){const k=JSON.parse(fs.readFileSync(path.join(__dirname,'konular.json')))[+a];body=kartHtml(k);}
else if(tur==='json'){body=kartHtml(JSON.parse(fs.readFileSync(a)));}
else{const T=TEMALAR[temaArg]||TEMALAR.mavi;const img='data:image/jpeg;base64,'+fs.readFileSync(a).toString('base64');
body=`<style>${baseCss({...T,fg:'#fff'})}body{background:#000 url(${img}) center/cover no-repeat;position:relative}
.ustb{position:absolute;top:0;left:0;right:0;padding:${90*S}px ${70*S}px ${120*S}px;background:linear-gradient(rgba(0,0,0,.6),transparent)}
.altb{position:absolute;bottom:0;left:0;right:0;padding:${160*S}px ${70*S}px ${100*S}px;background:linear-gradient(transparent,rgba(0,0,0,.82) 35%)}
.is{font-size:${62*S}px;font-weight:800;margin-bottom:${30*S}px;line-height:1.15}</style>
<div class="ustb"><div class="ust">FUVSU POMPA<small>Teknik Servis · Tesisat · Montaj</small></div></div>
<div class="altb">${etiket?`<div class="is">${esc(etiket)}</div>`:''}${telBlok(T.vurgu==='#fff'?TEMALAR.mavi:T,'Servis · Tesisat · Montaj')}</div>`;}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:H}});
await p.setContent('<!doctype html><meta charset="utf-8">'+body);await p.waitForTimeout(300);
await p.screenshot({path:cikti,type:'jpeg',quality:90});await b.close();})();
