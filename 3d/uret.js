// 3B ekipman görsellerini üretir: node 3d/uret.js <model> <cikti.png> [yaw] [pitch] [w] [h] [ibre]
// Çıktının yanına <cikti>.json (etiket noktaları, 0-1 oranında) yazar.
const {chromium}=require('playwright');const http=require('http');const fs=require('fs');const path=require('path');
const kok=path.join(__dirname,'..');const tip={'.js':'text/javascript','.html':'text/html','.ttf':'font/ttf'};
const [,,m='pompa',cikti='out.png',yaw='32',pitch='18',w='1600',h='1200',ibre='4',zoom='1.02']=process.argv;
const srv=http.createServer((q,r)=>{const f=path.join(kok,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(kok)||!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':tip[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0,async()=>{
 const port=srv.address().port;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:+w,height:+h}});p.on('pageerror',e=>console.error('HATA',e.message));p.on('console',c=>{if(c.type()==='error')console.error(c.text())});
 await p.goto(`http://127.0.0.1:${port}/3d/sahne3d.html?m=${m}&yaw=${yaw}&pitch=${pitch}&w=${w}&h=${h}&ibre=${ibre}&zoom=${zoom}`);
 await p.waitForFunction(()=>window.__hazir,null,{timeout:120000});const an=await p.evaluate(()=>window.__hazir.ankraj);
 const el=await p.$('canvas');await el.screenshot({path:cikti,omitBackground:true});fs.writeFileSync(cikti.replace(/\.png$/,'.json'),JSON.stringify(an));
 await b.close();srv.close();console.log('tamam',cikti,JSON.stringify(an));});
