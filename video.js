// Fuvsu Reels/Story video üretici (1080x1920, 30 fps, MP4)
// Kullanım: node video.js <icerik.json> <cikti.mp4>
// icerik.json: {"sahneler":[ ... ]}  her sahne:
//  {"tip":"foto","foto":"pompa-dairesi","odak":"50% 40%","ust":"FUVSU POMPA · GEBZE","baslik":"Hidroforunuz\n*sessizce* yoruluyor\nolabilir","metin":"...","sure":4}
//  {"tip":"urun","gorsel":"hidrofor-a","arkaplan":"pompa","baslik":"Bakımda neleri\n*kontrol* ediyoruz?","etiketler":{"tank":"Basınç tankı","pompa":"Pompalar","pano":"Kumanda panosu"},"sure":4.5}
//  {"tip":"liste","foto":"boru-su","baslik":"Her bakımda","maddeler":["Tank hava basıncı","Membran ve salmastra","Basınç şalteri ve pano"],"sure":4}
//  {"tip":"cta","cagri":"Keşif için arayın","sure":3.5}
// "muzik": {"stil":"enerjik|motive|sakin|kurumsal","tohum":123}  (yoksa rastgele; false = sessiz). Müzik muzik.py ile kodla üretilir, telifsizdir.
// Kurallar: fiyat yok, doğrulanmamış vaat yok, müşteri adı/adres/plaka yok. Telefon ve bölge otomatik eklenir.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const {spawn,execFileSync}=require('child_process');
const W=1080,H=1920,FPS=30,TEL='0501 042 44 57',IG='@fuvsuofficall',V='#ffcf33';
const [,,girdi,cikti]=process.argv;const spec=JSON.parse(fs.readFileSync(girdi,'utf8'));
const b64=(f,m)=>`data:${m};base64,`+fs.readFileSync(f).toString('base64');
const FONT=f=>b64(path.join(__dirname,'fontlar',f),'font/ttf');
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
const vurgu=s=>esc(s).replace(/\*([^*]+)\*/g,`<em>$1</em>`);
const satirlar=s=>String(s||'').split('\n').map((l,i)=>`<div class="sat" data-i="${i}"><span>${vurgu(l)}</span></div>`).join('');
const foto=ad=>b64(path.join(__dirname,'fotolar',ad+'.jpg'),'image/jpeg');
const logo=`<svg viewBox="0 0 64 64" width="70" height="70"><circle cx="32" cy="32" r="30" fill="${V}"/><path d="M32 12 C 24 24 18 31 18 39 a14 14 0 0 0 28 0 C 46 31 40 24 32 12Z" fill="#0b2a4a"/><path d="M26 40 a6 6 0 0 0 6 6" stroke="${V}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
const css=`@font-face{font-family:P;font-weight:700;src:url(${FONT('Poppins-Bold.ttf')})}@font-face{font-family:P;font-weight:500;src:url(${FONT('Poppins-Medium.ttf')})}@font-face{font-family:P;font-weight:400;src:url(${FONT('Poppins-Regular.ttf')})}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:${W}px;height:${H}px;overflow:hidden;background:#040912;font-family:P,sans-serif;color:#fff}
.abs{position:absolute;inset:0}.bg{position:absolute;inset:-4%;background-size:cover;background-position:center;will-change:transform}
.kar{position:absolute;inset:0;background:#040912;z-index:50;pointer-events:none}
.ust{position:absolute;left:76px;right:76px;top:84px;display:flex;align-items:center;gap:20px;z-index:5}
.ust b{display:block;font-size:34px;letter-spacing:2px}.ust i{display:block;font-style:normal;font-size:22px;letter-spacing:5px;opacity:.75;font-weight:500}
.ustg{position:absolute;left:0;right:0;top:0;height:330px;background:linear-gradient(rgba(4,9,18,.8),rgba(4,9,18,0));z-index:2}
.altg{position:absolute;left:0;right:0;bottom:0;height:62%;background:linear-gradient(rgba(4,9,18,0),rgba(4,9,18,.75) 25%,rgba(4,9,18,.96) 65%,#040912);z-index:2}
.ic{position:absolute;left:76px;right:76px;bottom:150px;z-index:4}
.ov{font-size:28px;font-weight:500;letter-spacing:6px;color:${V};display:flex;align-items:center;gap:18px;margin-bottom:26px}.ov:before{content:"";width:60px;height:4px;background:${V};border-radius:2px}
.sat{overflow:hidden;line-height:1.08}.sat span{display:inline-block;font-size:104px;font-weight:700;letter-spacing:-1px}
em{font-style:normal;color:${V}}
.mt{font-size:38px;line-height:1.45;opacity:.9;margin-top:34px;max-width:900px}
.tel{position:absolute;left:76px;right:76px;bottom:64px;z-index:4;font-size:28px;letter-spacing:3px;opacity:.7;display:flex;justify-content:space-between}`;
const ust=`<div class="ust">${logo}<div><b>FUVSU POMPA</b><i>TEKNİK SERVİS</i></div></div>`;
const kucukTel=`<div class="tel"><span>📞 ${TEL}</span><span>GEBZE · KOCAELİ · İSTANBUL</span></div>`;

// Her sahne: html + ciz(t) içeriği (sayfada çalışır). e(t,a,b): yumuşatılmış 0→1
const ORTAK_JS=`const cl=x=>Math.max(0,Math.min(1,x));const e=(t,a,b)=>{const x=cl((t-a)/(b-a));return 1-Math.pow(1-x,3)};const $=s=>{const r=document.querySelector(s);if(!r)throw new Error('yok:'+s);return r};const $$=s=>[...document.querySelectorAll(s)];
function giris(t,D){$('.kar').style.opacity=1-e(t,0,.35)+(t>D-.25?e(t,D-.25,D):0)*0;}
function satirAnim(t,bas){$$('.sat span').forEach((s,i)=>{const k=e(t,bas+i*.22,bas+i*.22+.55);s.style.transform='translateY('+(1-k)*110+'%)';s.style.opacity=k})}`;

function sahneHtml(s){
 const D=s.sure||4;
 if(s.tip==='foto'){
  return {D,html:`<style>${css}</style><div class="bg" style="background-image:url(${foto(s.foto)});background-position:${s.odak||'center'}"></div>
  <div class="abs" style="background:linear-gradient(160deg,rgba(10,40,90,.3),transparent 55%);z-index:1"></div><div class="ustg"></div><div class="altg"></div>${ust}
  <div class="ic"><div class="ov">${esc(s.ust||'HİDROFOR · POMPA SERVİSİ')}</div>${satirlar(s.baslik)}${s.metin?`<div class="mt">${esc(s.metin)}</div>`:''}</div>${kucukTel}<div class="kar"></div>`,
  js:`function ciz(t){giris(t,${D});const z=1+.13*(t/${D});$('.bg').style.transform='scale('+z+') translateY('+(-1.5*t)+'%)';
   const o=e(t,.25,.8);$('.ov').style.opacity=o;$('.ov').style.transform='translateX('+(1-o)*-60+'px)';satirAnim(t,.45);
   const m=$('.mt');if(m){const k=e(t,1.5,2.1);m.style.opacity=k;m.style.transform='translateY('+(1-k)*30+'px)'}}`};
 }
 if(s.tip==='urun'){
  const g=path.join(__dirname,'3d','gorseller',s.gorsel+'.png');const anc=JSON.parse(fs.readFileSync(g.replace('.png','.json'),'utf8'));
  const bx={l:-20,t:700,w:1120,h:800};const ets=Object.entries(s.etiketler||{}).filter(([k])=>anc[k]).slice(0,4);
  const pts=ets.map(([k,ad])=>{const[x,y]=anc[k];return{ad,x:bx.l+x*bx.w,y:bx.t+y*bx.h}}).sort((a,b)=>a.y-b.y);
  // yan seçimi ve çakışmasız y
  let sonL=430,sonR=430;pts.forEach(p=>{p.sag=p.x>W/2;let ly=p.y;if(p.sag){ly=Math.max(ly,sonR+110);sonR=ly}else{ly=Math.max(ly,sonL+110);sonL=ly}p.ly=ly-210});
  const svg=pts.map((p,i)=>{const lx=p.sag?W-70:70;return `<g class="et" data-i="${i}"><circle cx="${p.x}" cy="${p.y}" r="13" fill="${V}"/><circle cx="${p.x}" cy="${p.y}" r="26" fill="none" stroke="${V}" stroke-width="3" class="halka"/><path d="M${p.x} ${p.y} L${p.sag?p.x+40:p.x-40} ${p.ly+44} L${lx} ${p.ly+44}" stroke="${V}" stroke-width="3" fill="none" class="cizgi" pathLength="1" stroke-dasharray="1" /></g>`}).join('');
  const pill=pts.map((p,i)=>`<div class="pill" data-i="${i}" style="top:${p.ly}px;${p.sag?'right:60px':'left:60px'}">${esc(p.ad)}</div>`).join('');
  const bg=path.join(__dirname,'3d','arkaplan',(s.arkaplan||'pompa')+'-story.jpg');
  return {D,html:`<style>${css}.pill{position:absolute;z-index:6;background:#fff;color:#0b2a4a;font-weight:700;font-size:40px;padding:14px 30px;border-radius:44px;box-shadow:0 10px 30px rgba(0,0,0,.4)}
  .urun{position:absolute;left:${bx.l}px;top:${bx.t}px;width:${bx.w}px;height:${bx.h}px;z-index:3;filter:drop-shadow(0 40px 50px rgba(0,0,0,.6))}
  .ic2{position:absolute;left:76px;right:76px;top:230px;z-index:4}.ic2 .sat span{font-size:84px}</style>
  <div class="bg" style="background-image:url(${b64(bg,'image/jpeg')});filter:blur(7px) brightness(.45)"></div>
  <div class="abs" style="background:radial-gradient(ellipse at 50% 55%,rgba(40,120,200,.35),transparent 60%);z-index:1"></div>${ust}
  <div class="ic2"><div class="ov">${esc(s.ust||'PERİYODİK BAKIM')}</div>${satirlar(s.baslik)}</div>
  <img class="urun" src="${b64(g,'image/png')}"><svg class="abs" style="z-index:5" viewBox="0 0 ${W} ${H}">${svg}</svg>${pill}
  <div class="altg" style="height:22%"></div>${kucukTel}<div class="kar"></div>`,
  js:`function ciz(t){giris(t,${D});const k=e(t,0,1.2);$('.urun').style.transform='translateY('+((1-k)*80+Math.sin(t*1.6)*8)+'px) scale('+(.9+.1*k+.03*t/${D})+')';$('.urun').style.opacity=k;
   const o=e(t,.2,.7);$('.ov').style.opacity=o;satirAnim(t,.35);
   $$('.et').forEach((g,i)=>{const a=1.1+i*.45;const k1=e(t,a,a+.35),k2=e(t,a+.2,a+.7);g.querySelector('circle').setAttribute('r',13*k1);const h=g.querySelector('.halka');h.setAttribute('r',13+20*((t*1.2+i*.3)%1));h.style.opacity=k1*(1-((t*1.2+i*.3)%1));g.querySelector('.cizgi').style.strokeDashoffset=1-k2});
   $$('.pill').forEach((p,i)=>{const a=1.5+i*.45;const k=e(t,a,a+.4);p.style.opacity=k;p.style.transform='scale('+(.6+.4*k)+')'})}`};
 }
 if(s.tip==='liste'){
  const m=(s.maddeler||[]).slice(0,4).map((x,i)=>`<div class="md" data-i="${i}"><div class="ck"><svg viewBox="0 0 24 24" width="46" height="46"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#0b2a4a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1"/></svg></div><span>${esc(x)}</span></div>`).join('');
  return {D,html:`<style>${css}.md{display:flex;align-items:center;gap:30px;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.18);border-radius:28px;padding:26px 34px;margin-top:24px;backdrop-filter:blur(6px)}
  .md span{font-size:46px;font-weight:500}.ck{flex:none;width:76px;height:76px;border-radius:50%;background:${V};display:flex;align-items:center;justify-content:center}.ic .sat span{font-size:92px}</style>
  <div class="bg" style="background-image:url(${foto(s.foto||'vana')});background-position:${s.odak||'center'}"></div><div class="ustg"></div><div class="altg" style="height:75%"></div>${ust}
  <div class="ic"><div class="ov">${esc(s.ust||'KONTROL LİSTESİ')}</div>${satirlar(s.baslik)}<div style="margin-top:20px">${m}</div></div>${kucukTel}<div class="kar"></div>`,
  js:`function ciz(t){giris(t,${D});$('.bg').style.transform='scale('+(1.12-.1*t/${D})+')';$('.ov').style.opacity=e(t,.2,.7);satirAnim(t,.3);
   $$('.md').forEach((d,i)=>{const a=1+i*.5;const k=e(t,a,a+.45);d.style.opacity=k;d.style.transform='translateX('+(1-k)*-120+'px)';const c=d.querySelector('.ck');const k2=e(t,a+.25,a+.6);c.style.transform='scale('+(.4+.6*k2)+')';d.querySelector('path').style.strokeDashoffset=1-e(t,a+.4,a+.8)})}`};
 }
 // cta
 return {D,html:`<style>${css}.cta{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;z-index:4;padding:0 70px}
 .cta .lg svg{width:190px;height:190px}.cta h2{font-size:64px;margin-top:40px;line-height:1.15}.cta h3{font-size:30px;letter-spacing:8px;opacity:.75;font-weight:500;margin-top:14px}
 .kart{margin-top:70px;background:#fff;color:#0b2a4a;border-radius:40px;padding:44px 60px;box-shadow:0 30px 70px rgba(0,0,0,.5)}.kart small{display:block;font-size:30px;letter-spacing:4px;font-weight:500;color:#0e6aa8}
 .kart b{display:block;font-size:96px;letter-spacing:1px;margin-top:6px;white-space:nowrap}.kart i{display:block;font-style:normal;font-size:32px;margin-top:8px;opacity:.75}
 .hz{margin-top:60px;font-size:34px;opacity:.85;line-height:1.6}.dalga{position:absolute;left:-10%;width:120%;height:340px;bottom:-60px;border-radius:50%;background:rgba(95,195,255,.12)}</style>
 <div class="abs" style="background:radial-gradient(circle at 50% 35%,#16406b,#071629 70%)"></div><div class="dalga d1"></div><div class="dalga d2" style="bottom:-140px;background:rgba(95,195,255,.08)"></div>
 <div class="cta"><div class="lg">${logo}</div><h2>FUVSU POMPA</h2><h3>TEKNİK SERVİS</h3>
 <div class="kart"><small>${esc((s.cagri||'Keşif için arayın').toLocaleUpperCase('tr'))}</small><b>${TEL}</b><i>${IG} · WhatsApp</i></div>
 <div class="hz">Servis · Arıza · Tesisat · Montaj<br>Hidrofor bakımı · Dalgıç pompa<br><span style="color:${V}">İstanbul · Kocaeli · Sakarya</span></div></div><div class="kar"></div>`,
 js:`function ciz(t){giris(t,${D});const l=e(t,.1,.7);$('.lg').style.transform='scale('+(.5+.5*l)+') rotate('+(1-l)*-40+'deg)';$('.lg').style.opacity=l;
  [['h2',.4],['h3',.55],['.kart',.8],['.hz',1.2]].forEach(([q,a])=>{const k=e(t,a,a+.5);$(q).style.opacity=k;$(q).style.transform='translateY('+(1-k)*50+'px)'});
  const p=1+.035*Math.max(0,Math.sin((t-1.4)*3.2))*(t>1.4);$('.kart').style.transform+=' scale('+p+')';
  $('.d1').style.transform='translateX('+Math.sin(t*1.3)*40+'px)';$('.d2').style.transform='translateX('+Math.cos(t*1.1)*50+'px)'}`};
}

(async()=>{
 const tmp=fs.mkdtempSync('/tmp/video-');const br=await chromium.launch();let pg=null;
 const dosyalar=[];const kare=process.env.KARE; // KARE="0:2.5,2:3" → sadece önizleme kareleri
 for(const [i,s] of spec.sahneler.entries()){
  const {D,html,js}=sahneHtml(s);if(pg)await pg.close();pg=await br.newPage({viewport:{width:W,height:H}});await pg.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${html}<script>${ORTAK_JS}${js}</script></body></html>`);
  await pg.evaluate(()=>document.fonts.ready);await pg.evaluate(()=>Promise.all([...document.images].map(im=>im.complete?1:new Promise(r=>im.onload=r))));
  if(kare){for(const k of kare.split(',')){const[si,t]=k.split(':').map(Number);if(si!==i)continue;await pg.evaluate(t=>ciz(t),t);await pg.screenshot({path:`${cikti}-s${si}-${t}.jpg`,type:'jpeg',quality:90})}continue}
  const ara=path.join(tmp,`s${i}.tmp.mp4`),son=path.join(tmp,`s${i}.mp4`);
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-crf','18','-preset','veryfast','-pix_fmt','yuv420p','-r',String(FPS),ara],{stdio:['pipe','inherit','inherit']});
  const N=Math.round(D*FPS);for(let f=0;f<N;f++){await pg.evaluate(t=>ciz(t),f/FPS);const buf=await pg.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
  ff.stdin.end();const kod=await new Promise(r=>ff.on('close',r));if(kod!==0)throw new Error('ffmpeg sahne '+i);fs.renameSync(ara,son);dosyalar.push(son);console.log('sahne',i,'tamam',D+'s');
 }
 await br.close();if(kare)return;
 const liste=path.join(tmp,'liste.txt');fs.writeFileSync(liste,dosyalar.map(f=>`file '${f}'`).join('\n'));const sessiz=path.join(tmp,'v.mp4');
 execFileSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',liste,'-c','copy',sessiz]);
 // Müzik: muzik.py ile özgün, telifsiz müzik üretilir (spec.muzik:{stil,tohum}; false ise sessiz)
 const toplam=spec.sahneler.reduce((a,s)=>a+(s.sure||4),0);let sesGir=['-f','lavfi','-i','anullsrc=r=44100:cl=stereo'],af=[];
 if(spec.muzik!==false){const m=spec.muzik||{};const wav=path.join(tmp,'m.wav');
  console.log(execFileSync('python3',[path.join(__dirname,'muzik.py'),wav,String(toplam),String(m.tohum||Math.floor(Math.random()*1e6)),m.stil||'']).toString().trim());
  sesGir=['-i',wav];af=['-af','loudnorm=I=-14:TP=-1.5:LRA=11'];}
 execFileSync('ffmpeg',['-y','-loglevel','error','-i',sessiz,...sesGir,'-shortest','-map','0:v','-map','1:a',...af,'-c:v','copy','-c:a','aac','-b:a','160k','-ar','44100','-movflags','+faststart',cikti+'.tmp.mp4']);
 fs.renameSync(cikti+'.tmp.mp4',cikti);console.log('hazır',cikti);
})().catch(e=>{console.error(e);process.exit(1)});
