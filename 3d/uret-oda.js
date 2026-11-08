// Pompa dairesi ortam çekimi: node 3d/uret-oda.js <varyant> <cikti.jpg> [w] [h]
const {chromium}=require('playwright');const http=require('http');const fs=require('fs');const path=require('path');
const kok=path.join(__dirname,'..');const tip={'.js':'text/javascript','.html':'text/html','.ttf':'font/ttf'};
const [,,v='genel',cikti='oda.jpg',w='1080',h='1920']=process.argv;
const srv=http.createServer((q,r)=>{const f=path.join(kok,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(kok)||!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':tip[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0,async()=>{
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:+w,height:+h}});p.on('pageerror',e=>console.error('HATA',e.message));p.on('console',c=>{if(c.type()==='error')console.error(c.text())});
 await p.goto(`http://127.0.0.1:${srv.address().port}/3d/oda3d.html?v=${v}&w=${w}&h=${h}`);
 await p.waitForFunction(()=>window.__hazir,null,{timeout:300000});
 await (await p.$('canvas')).screenshot({path:cikti,type:'jpeg',quality:92});await b.close();srv.close();console.log('tamam',cikti);});
