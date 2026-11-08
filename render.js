// Kullanım:
//  node render.js <story|post> kart <konuIndex> <cikti.jpg>            (konular.json'dan)
//  node render.js <story|post> json <icerik.json> <cikti.jpg>          (serbest içerik)
//  node render.js <story|post> foto <foto.jpg> <cikti.jpg> "<İş türü · İlçe>" [tema]
//
// icerik.json alanları:
//  stil   : klasik | soru | bilgi | sss | liste | buyuk | infografik | karsilastir
//  tema   : mavi | lacivert | turkuaz | turuncu | beyaz | yesil
//  sahne  : hidrofor | dalgic | bina | tank | manometre | drenaj | arac | musluk | alet | pano   (renkli detaylı çizim, sahneler.js)
//  etiketler: ["Basınç tankı","Vana",...]  (sahnedeki numaralı noktalara yazılır; infografik stilinde açıklamalar 'maddeler'den gelir)
//  aci    : manometre ibresi açısı (-120 düşük … 0 orta … 120 yüksek)   zayif: musluk sahnesinde zayıf akış (true/false)
//  etiket, baslik (\n ile satır), metin, maddeler:[...], cagri
//  karsilastir için: sol:{baslik,metin,sahne,zayif}, sag:{baslik,metin,sahne,zayif}
//  (eski 'cizim' alanı da çalışır: otomatik olarak uygun renkli sahneye çevrilir)
//  arkaplan: genel | gece | pompa | tank | pano  → "AFİŞ" stili: gerçekçi pompa dairesi 3B çekimi tam ekran arka plan,
//           altta büyük başlık (başlıkta *kelime* vurgu rengiyle yazılır), metin, maddeler, telefon. En gösterişli stil.
//  gorsel : GERÇEKÇİ 3B görsel (öncelikli): hidrofor-a | hidrofor-b | pompa-a | pompa-b | dikey | tank | dalgic | drenaj | vana |
//           manometre-dusuk | manometre-normal | manometre-yuksek   (3d/gorseller/). gorsel varsa sahne yerine o kullanılır.
//           etiketler dizi ise sırayla: hidrofor:[tank,vana,manometre,pano,pompa,kollektor] pompa:[motor,salyangoz,basma,emis]
//           tank:[tank,sibop] dalgic:[motor,izgara,pompaKismi,cikis] drenaj:[govde,samandira,cikis]
//           ya da nesne: {"tank":"Basınç tankı","pano":"Kumanda panosu"}. karsilastir'da sol/sag içinde de gorsel kullanılabilir.
const {chromium}=require('playwright');const sahne=require('./sahneler.js');const fs=require('fs');const path=require('path');
const TEL='0501 042 44 57', IG='@fuvsuofficall', BOLGE='İstanbul · Kocaeli · Sakarya';
const [,,bicim,tur,a,cikti,etiket,temaArg]=process.argv;
const POST=bicim==='post';const W=1080,H=POST?1350:1920,S=POST?0.74:1;
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
const br=s=>esc(s).replace(/\n/g,'<br>');
const FONT=f=>'data:font/ttf;base64,'+fs.readFileSync(path.join(__dirname,'fontlar',f)).toString('base64');
const CIZIM_SAHNE={hidrofor:'hidrofor',dalgic:'dalgic',bina:'bina',manometre:'manometre',vana:'pano',damla:'musluk',boru:'drenaj',anahtar:'alet'};
const TEMALAR={
 mavi:{bg:'linear-gradient(165deg,#062b52 0%,#0b4f8f 45%,#1590d6 100%)',fg:'#fff',kutu:'rgba(255,255,255,.13)',vurgu:'#ffd23f',vfg:'#0b2a4a',panel:'radial-gradient(circle at 50% 40%,rgba(255,255,255,.28),rgba(255,255,255,.06) 70%)',dalga:'#5fc3ff'},
 lacivert:{bg:'linear-gradient(170deg,#050f1e 0%,#0d2440 55%,#16406b 100%)',fg:'#fff',kutu:'rgba(255,255,255,.08)',vurgu:'#ffd23f',vfg:'#0a1a2f',panel:'radial-gradient(circle at 50% 40%,rgba(95,195,255,.25),rgba(255,255,255,.03) 70%)',dalga:'#2f80c9'},
 turkuaz:{bg:'linear-gradient(165deg,#004d47 0%,#00807a 50%,#18b5ad 100%)',fg:'#fff',kutu:'rgba(255,255,255,.15)',vurgu:'#ffffff',vfg:'#00695c',panel:'radial-gradient(circle at 50% 40%,rgba(255,255,255,.3),rgba(255,255,255,.05) 70%)',dalga:'#5ee0d6'},
 turuncu:{bg:'linear-gradient(165deg,#b33c00 0%,#e8650a 50%,#ff9a2e 100%)',fg:'#fff',kutu:'rgba(255,255,255,.17)',vurgu:'#0b2a4a',vfg:'#fff',panel:'radial-gradient(circle at 50% 40%,rgba(255,255,255,.32),rgba(255,255,255,.06) 70%)',dalga:'#ffc380'},
 beyaz:{bg:'linear-gradient(170deg,#ffffff 0%,#e6f2fb 60%,#cfe6f7 100%)',fg:'#0b2a4a',kutu:'rgba(14,106,168,.09)',vurgu:'#0e6aa8',vfg:'#fff',panel:'radial-gradient(circle at 50% 40%,rgba(14,106,168,.16),rgba(14,106,168,.03) 70%)',dalga:'#8ccaf0'},
 yesil:{bg:'linear-gradient(165deg,#0f3d13 0%,#22672a 50%,#4fa55a 100%)',fg:'#fff',kutu:'rgba(255,255,255,.14)',vurgu:'#ffd23f',vfg:'#1b3a1c',panel:'radial-gradient(circle at 50% 40%,rgba(255,255,255,.28),rgba(255,255,255,.05) 70%)',dalga:'#8fd99a'}};

const logo=(T)=>`<svg viewBox="0 0 64 64" width="${78*S}" height="${78*S}"><circle cx="32" cy="32" r="30" fill="${T.vurgu}"/><path d="M32 12 C 24 24 18 31 18 39 a14 14 0 0 0 28 0 C 46 31 40 24 32 12Z" fill="${T.vfg}"/><path d="M26 40 a6 6 0 0 0 6 6" stroke="${T.vurgu}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
const ustBlok=(T)=>`<div class="ust">${logo(T)}<div>FUVSU POMPA<small>Teknik Servis · Tesisat · Montaj</small></div></div>`;
const telBlok=(T,cagri)=>`<div class="tel" style="background:${T.vurgu};color:${T.vfg}"><svg viewBox="0 0 24 24" width="${70*S}" height="${70*S}"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg><div><small>${esc(cagri||'Hemen arayın')}</small>${TEL}</div></div><div class="alt"><span>📍 ${BOLGE}</span><span>${IG}</span></div>`;
const dekor=(T)=>`<svg class="dekor" viewBox="0 0 1080 ${H}" preserveAspectRatio="none">
 <defs><pattern id="izgara" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="${T.fg}" stroke-opacity=".05" stroke-width="2"/></pattern></defs>
 <rect width="1080" height="${H}" fill="url(#izgara)"/>
 <path d="M0 ${H-150} C 200 ${H-210} 380 ${H-90} 560 ${H-140} S 900 ${H-200} 1080 ${H-150} V ${H} H0Z" fill="${T.dalga}" opacity=".18"/>
 <path d="M0 ${H-90} C 240 ${H-140} 420 ${H-40} 640 ${H-90} S 940 ${H-130} 1080 ${H-80} V ${H} H0Z" fill="${T.dalga}" opacity=".22"/>
 ${[[960,260,26],[1010,340,12],[60,700,18],[110,760,9],[990,900,14]].map(([x,y,r])=>`<circle cx="${x}" cy="${POST?y*0.7:y}" r="${r}" fill="none" stroke="${T.fg}" stroke-opacity=".22" stroke-width="3"/>`).join('')}
</svg>`;
const baseCss=(T)=>`@font-face{font-family:P;src:url(${FONT('Poppins-Bold.ttf')});font-weight:700}@font-face{font-family:P;src:url(${FONT('Poppins-Medium.ttf')});font-weight:500}@font-face{font-family:P;src:url(${FONT('Poppins-Regular.ttf')});font-weight:400}@font-face{font-family:Poppins;src:url(${FONT('Poppins-Bold.ttf')});font-weight:700}@font-face{font-family:Poppins;src:url(${FONT('Poppins-Medium.ttf')});font-weight:600}
*{margin:0;box-sizing:border-box}body{width:${W}px;height:${H}px;font-family:P,"DejaVu Sans",Arial,sans-serif;color:${T.fg};overflow:hidden;position:relative}
.dekor{position:absolute;inset:0;width:100%;height:100%;z-index:0}.ic{position:relative;z-index:1;height:100%;display:flex;flex-direction:column;padding:${100*S}px ${72*S}px ${80*S}px}
.ust{display:flex;align-items:center;gap:${20*S}px;font-size:${44*S}px;letter-spacing:5px;font-weight:700;line-height:1.1}.ust small{display:block;font-size:${26*S}px;letter-spacing:1px;opacity:.85;margin-top:6px;font-weight:500}
.panel{margin:${38*S}px 0 ${30*S}px;border-radius:${44*S}px;background:${T.panel};border:2px solid ${T.fg==='#fff'?'rgba(255,255,255,.18)':'rgba(14,106,168,.18)'};padding:${18*S}px;display:flex;align-items:center;justify-content:center}
.panel svg{width:100%;height:100%}
.govde{flex:1;display:flex;flex-direction:column;justify-content:center}
.tel{border-radius:${30*S}px;padding:${28*S}px ${40*S}px;font-weight:700;font-size:${72*S}px;letter-spacing:1px;display:flex;align-items:center;gap:${24*S}px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.tel small{display:block;font-size:${28*S}px;font-weight:500;letter-spacing:0;margin-bottom:2px}
.alt{display:flex;justify-content:space-between;font-size:${28*S}px;opacity:.92;margin-top:${22*S}px;font-weight:500}
.etk{display:inline-flex;align-self:flex-start;align-items:center;gap:10px;background:${T.vurgu};color:${T.vfg};border-radius:40px;padding:${10*S}px ${28*S}px;font-size:${30*S}px;font-weight:700;margin-bottom:${22*S}px}
h1{font-size:${88*S}px;line-height:1.08;margin-bottom:${22*S}px;font-weight:700;letter-spacing:-.5px}p{font-size:${42*S}px;line-height:1.38;font-weight:400;opacity:.95}
.kutu{background:${T.kutu};border-radius:${30*S}px;padding:${30*S}px ${40*S}px;margin-top:${28*S}px;font-size:${40*S}px;line-height:1.45}
.mad{display:flex;flex-wrap:wrap;gap:${16*S}px;margin-top:${26*S}px}.mad div{display:flex;align-items:center;gap:${14*S}px;background:${T.kutu};border-radius:${24*S}px;padding:${14*S}px ${24*S}px;font-size:${36*S}px;font-weight:500}
.mad b{background:${T.vurgu};color:${T.vfg};border-radius:50%;width:${50*S}px;height:${50*S}px;display:flex;align-items:center;justify-content:center;font-size:${28*S}px;flex:none}
.num{display:flex;gap:${22*S}px;align-items:center;font-size:${40*S}px;margin:${14*S}px 0;font-weight:500;line-height:1.25}.num b{background:${T.vurgu};color:${T.vfg};border-radius:50%;width:${66*S}px;height:${66*S}px;display:flex;align-items:center;justify-content:center;font-weight:700;flex:none;font-size:${34*S}px}
.ikili{display:grid;grid-template-columns:1fr 1fr;gap:${24*S}px;margin:${34*S}px 0 ${26*S}px}.ikili>div{border-radius:${36*S}px;padding:${18*S}px;background:${T.kutu};display:flex;flex-direction:column}
.ikili .rozet{align-self:flex-start;border-radius:30px;padding:${8*S}px ${22*S}px;font-weight:700;font-size:${30*S}px;color:#fff;margin:${8*S}px}
.ikili h3{font-size:${44*S}px;margin:${10*S}px ${10*S}px 4px;line-height:1.15}.ikili span{font-size:${32*S}px;margin:0 ${10*S}px ${10*S}px;opacity:.92;line-height:1.3}`;

// ---- Gerçekçi 3B görseller (3d/gorseller/*.png, 3d/uret.js ile üretildi) ----
const G3=path.join(__dirname,'3d','gorseller');
const G3_SIRA={hidrofor:['tank','vana','manometre','pano','pompa','kollektor'],pompa:['motor','salyangoz','basma','emis'],tank:['tank','sibop'],dalgic:['motor','izgara','pompaKismi','cikis'],drenaj:['govde','samandira','cikis']};
function g3Html(ad,etiketler,yuk){const f=path.join(G3,ad+'.png');if(!fs.existsSync(f))return '';
 const img='data:image/png;base64,'+fs.readFileSync(f).toString('base64');const an=JSON.parse(fs.readFileSync(f.replace(/\.png$/,'.json')));
 const tur=ad.split('-')[0];let et=[];
 if(Array.isArray(etiketler)){const sira=G3_SIRA[tur]||Object.keys(an);et=etiketler.map((t,i)=>[sira[i],t]).filter(([k])=>an[k]);}
 else if(etiketler&&typeof etiketler==='object')et=Object.entries(etiketler).filter(([k])=>an[k]);
 const L=et.map(([k,t],i)=>{const [x,y]=an[k];return {i,t,px:x*1400,py:y*1000,sag:x>=0.5,w:Math.max(220,String(t).length*29+120)}});
 for(const taraf of [true,false]){let son=-1e9;L.filter(l=>l.sag===taraf).sort((p,q)=>p.py-q.py).forEach(l=>{l.ly=Math.max(l.py,son+120,70);son=l.ly;});
  const tas=L.filter(l=>l.sag===taraf&&l.ly>940);if(tas.length){const k=Math.max(...tas.map(l=>l.ly))-940;L.filter(l=>l.sag===taraf).forEach(l=>l.ly-=k);}}
 const svg=L.map(l=>{const bx=l.sag?1385-l.w:15;const ux=l.sag?bx:bx+l.w;
  return `<line x1="${l.px}" y1="${l.py}" x2="${ux}" y2="${l.ly}" stroke="#fff" stroke-width="10"/><line x1="${l.px}" y1="${l.py}" x2="${ux}" y2="${l.ly}" stroke="#0b2a4a" stroke-width="5"/><circle cx="${l.px}" cy="${l.py}" r="20" fill="#ffd23f" stroke="#0b2a4a" stroke-width="5"/>
  <rect x="${bx}" y="${l.ly-46}" width="${l.w}" height="92" rx="46" fill="#fff" stroke="#0b2a4a" stroke-width="5"/><circle cx="${bx+46}" cy="${l.ly}" r="32" fill="#0e6aa8"/><text x="${bx+46}" y="${l.ly+12}" text-anchor="middle" font-size="34" font-weight="700" fill="#fff" font-family="Poppins">${l.i+1}</text><text x="${bx+92}" y="${l.ly+14}" font-size="40" font-weight="700" fill="#0b2a4a" font-family="Poppins">${esc(l.t)}</text>`}).join('');
 return `<div style="position:relative;width:100%;height:${yuk}px;border-radius:${36*S}px;overflow:hidden;background:radial-gradient(ellipse at 50% 35%,#ffffff 0%,#eef4f9 55%,#d6e3ee 100%)"><div style="position:absolute;left:8%;right:8%;bottom:7%;height:12%;background:radial-gradient(ellipse,rgba(11,42,74,.18),transparent 70%)"></div><img src="${img}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain"><svg viewBox="0 0 1400 1000" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;width:100%;height:100%">${svg}</svg></div>`;}
function sahneSvg(k){const ad=k.sahne||CIZIM_SAHNE[k.cizim];if(!ad)return '';return sahne(ad,{etiketler:k.etiketler,aci:k.aci,zayif:k.zayif,ekran:k.ekran});}
function otoGorsel(k){if(k.gorsel||k.stil==='karsilastir')return;
 if(k.sahne==='hidrofor')k.gorsel=Math.random()<.5?'hidrofor-a':'hidrofor-b';
 else if(k.sahne==='manometre')k.gorsel=(k.aci??0)<-50?'manometre-dusuk':(k.aci??0)>50?'manometre-yuksek':'manometre-normal';}
// ---- AFİŞ stili: gerçekçi pompa dairesi 3B çekimi tam ekran arka plan (3d/arkaplan/) ----
function afisHtml(k){const T=TEMALAR[k.tema]||TEMALAR.lacivert;const f=path.join(__dirname,'3d','arkaplan',`${k.arkaplan}-${POST?'post':'story'}.jpg`);
 const img=fs.existsSync(f)?'data:image/jpeg;base64,'+fs.readFileSync(f).toString('base64'):'';const V=k.tema==='turkuaz'?'#5ee0d6':'#ffd23f';const VF='#0b2a4a';
 const mad=k.maddeler?.length?`<div class="mad">${k.maddeler.map(m=>`<div><b style="background:${V};color:${VF}">✓</b>${esc(m)}</div>`).join('')}</div>`:'';
 return `<style>${baseCss({...T,fg:'#fff',vurgu:V,vfg:VF,kutu:'rgba(255,255,255,.14)'})}body{background:#0a1220 url(${img}) center/cover no-repeat}
 .ust-g{position:absolute;left:0;right:0;top:0;height:${380*S}px;background:linear-gradient(rgba(5,10,20,.85),rgba(5,10,20,0))}
 .alt-g{position:absolute;left:0;right:0;bottom:0;height:${(POST?62:58)}%;background:linear-gradient(rgba(5,10,20,0),rgba(5,10,20,.78) 28%,rgba(5,10,20,.96) 70%)}
 .afis{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;padding:${100*S}px ${72*S}px ${80*S}px}
 .afis h1{font-size:${(k.baslikBoyu||104)*S}px;line-height:1.02;text-shadow:0 6px 30px rgba(0,0,0,.55);margin-bottom:${20*S}px}
 .afis h1 em{font-style:normal;color:${V}}.afis p{font-size:${44*S}px;text-shadow:0 2px 12px rgba(0,0,0,.6)}
 .etk{background:${V};color:${VF}}.serit{width:${120*S}px;height:${10*S}px;border-radius:6px;background:${V};margin-bottom:${26*S}px}</style>
 <div class="ust-g"></div><div class="alt-g"></div><div class="afis">${ustBlok({...T,vurgu:V,vfg:VF})}<div style="flex:1"></div>
 ${k.etiket?`<div class="etk">${esc(k.etiket)}</div>`:'<div class="serit"></div>'}<h1>${br(k.baslik).replace(/\*(.+?)\*/g,'<em>$1</em>')}</h1>${k.metin?`<p>${esc(k.metin)}</p>`:''}${mad}<div style="margin-top:${40*S}px">${telBlok({...T,vurgu:V,vfg:VF},k.cagri)}</div></div>`;}
function kartHtml(k){if(k.arkaplan)return afisHtml(k);otoGorsel(k);const T=TEMALAR[k.tema]||TEMALAR.mavi;const st=k.stil||'klasik';
 const svg=sahneSvg(k)||(k.gorsel?' ':'');
 const ph=(oran)=>{const yk=Math.round((POST?560:800)*oran);if(k.gorsel){const g=g3Html(k.gorsel,k.etiketler,yk-8);if(g)return `<div class="panel" style="height:${yk}px;padding:${8*S}px">${g}</div>`;}return svg?`<div class="panel" style="height:${yk}px">${svg}</div>`:'';};
 const mad=(isaret)=>k.maddeler?.length?`<div class="mad">${k.maddeler.map((m,i)=>`<div><b>${isaret==='#'?i+1:isaret}</b>${esc(m)}</div>`).join('')}</div>`:'';
 const etk=(t)=>t?`<div class="etk">${esc(t)}</div>`:'';
 let orta;
 if(st==='soru'){orta=`${ph(svg?0.92:0)}<div class="govde">${etk(k.etiket||'🤔 Sizde de oluyor mu?')}<h1 style="font-size:${(svg?92:120)*S}px">${br(k.baslik)}</h1><p>${esc(k.metin)}</p>${mad('!')}</div>`}
 else if(st==='bilgi'){orta=`${ph(0.92)}<div class="govde">${etk(k.etiket||'💡 Biliyor muydunuz?')}<h1 style="font-size:${80*S}px">${br(k.baslik)}</h1><p>${esc(k.metin)}</p>${mad('✓')}</div>`}
 else if(st==='sss'){orta=`${ph(0.85)}<div class="govde">${etk(k.etiket||'❓ Sık sorulan')}<h1 style="font-size:${74*S}px">“${esc(k.baslik).replace(/\n/g,' ')}”</h1><div class="kutu"><b>Cevap:</b> ${esc(k.metin)}</div></div>`}
 else if(st==='liste'){orta=`${ph(0.72)}<div class="govde">${etk(k.etiket)}<h1 style="font-size:${78*S}px">${br(k.baslik)}</h1>${(k.maddeler||[]).map((m,i)=>`<div class="num"><b>${i+1}</b>${esc(m)}</div>`).join('')}</div>`}
 else if(st==='infografik'){orta=`<div class="govde" style="flex:none;margin-top:${44*S}px">${etk(k.etiket||'🔧 Nasıl çalışır?')}<h1 style="font-size:${72*S}px;margin-bottom:0">${br(k.baslik)}</h1></div>${ph(0.84)}<div class="govde">${(k.maddeler||[]).map((m,i)=>`<div class="num" style="font-size:${36*S}px"><b>${i+1}</b>${esc(m)}</div>`).join('')}${k.metin?`<p style="margin-top:${12*S}px;font-size:${36*S}px">${esc(k.metin)}</p>`:''}</div>`}
 else if(st==='karsilastir'){const yan=(x,ok)=>`<div><div class="rozet" style="background:${ok?'#2bb673':'#e5332a'}">${ok?'✓ Olması gereken':'✗ Sorun'}</div><div style="height:${(POST?320:560)}px">${x.gorsel?g3Html(x.gorsel,x.etiketler,(POST?320:560)):sahne(x.sahne||'musluk',{zayif:x.zayif,aci:x.aci,ekran:x.ekran})}</div><h3>${esc(x.baslik)}</h3><span>${esc(x.metin)}</span></div>`;
   orta=`<div class="govde" style="flex:none;margin-top:${44*S}px">${etk(k.etiket||'⚖️ Farkı görün')}<h1 style="font-size:${72*S}px;margin-bottom:0">${br(k.baslik)}</h1></div><div class="ikili">${yan(k.sol||{zayif:true},false)}${yan(k.sag||{},true)}</div><div class="govde">${k.metin?`<p>${esc(k.metin)}</p>`:''}</div>`}
 else if(st==='buyuk'){orta=`${ph(0.8)}<div class="govde"><h1 style="font-size:${(svg?108:132)*S}px;line-height:1.02">${br(k.baslik)}</h1><p style="font-size:${48*S}px">${esc(k.metin)}</p></div>`}
 else{orta=`${ph(0.92)}<div class="govde">${etk(k.etiket||k.hizmet)}<h1>${br(k.baslik)}</h1><p>${esc(k.metin)}</p>${mad('✓')}</div>`}
 return `<style>${baseCss(T)}body{background:${T.bg}}</style>${dekor(T)}<div class="ic">${ustBlok(T)}${orta}<div>${telBlok(T,k.cagri)}</div></div>`;}

let body;
if(tur==='kart'){const k=JSON.parse(fs.readFileSync(path.join(__dirname,'konular.json')))[+a];body=kartHtml(k);}
else if(tur==='json'){body=kartHtml(JSON.parse(fs.readFileSync(a)));}
else{const T0=TEMALAR[temaArg]||TEMALAR.mavi;const T=T0.vurgu==='#ffffff'||T0.fg!=='#fff'?TEMALAR.mavi:T0;const img='data:image/jpeg;base64,'+fs.readFileSync(a).toString('base64');
body=`<style>${baseCss({...T,fg:'#fff'})}body{background:${T.bg}}
.foto{position:relative;flex:1;margin:${34*S}px 0 ${30*S}px;border-radius:${44*S}px;overflow:hidden;background:#000 url(${img}) center/cover no-repeat;box-shadow:0 18px 50px rgba(0,0,0,.4);border:6px solid rgba(255,255,255,.85)}
.foto .is{position:absolute;left:0;right:0;bottom:0;padding:${120*S}px ${40*S}px ${36*S}px;background:linear-gradient(transparent,rgba(0,0,0,.8));font-size:${56*S}px;font-weight:700;line-height:1.15}
.foto .rz{position:absolute;top:${30*S}px;left:${30*S}px;background:${T.vurgu};color:${T.vfg};border-radius:40px;padding:${10*S}px ${26*S}px;font-weight:700;font-size:${30*S}px}</style>
${dekor(T)}<div class="ic">${ustBlok(T)}<div class="foto"><div class="rz">📸 Sahadan</div>${etiket?`<div class="is">${esc(etiket)}</div>`:''}</div><div>${telBlok(T,'Servis · Tesisat · Montaj')}</div></div>`;}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:H}});
await p.setContent('<!doctype html><meta charset="utf-8">'+body,{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(250);
await p.screenshot({path:cikti,type:'jpeg',quality:92});await b.close();})();
