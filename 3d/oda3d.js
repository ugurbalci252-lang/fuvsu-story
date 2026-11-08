// Fuvsu Pompa — gerçekçi "pompa dairesi" ortam çekimleri (özgün 3B sahne, marka/logo yok).
// oda3d.html?v=<varyant>&w=1080&h=1920   varyantlar: genel | pompa | tank | pano | gece
window.__oda = true;
const S = await import('./sahne3d.js');
const { THREE, P, W, H, renderer, scene, M, mesh, kutu, silX, silZ, silY, boru, flans, vana, manometre, yatayPompa, dikeyPompa, membranTank, pano, tabelaDoku } = S;
const { EffectComposer } = await import('./jsm/postprocessing/EffectComposer.js');
const { RenderPass } = await import('./jsm/postprocessing/RenderPass.js');
const { SAOPass } = await import('./jsm/postprocessing/SAOPass.js');
const { UnrealBloomPass } = await import('./jsm/postprocessing/UnrealBloomPass.js');
const { BokehPass } = await import('./jsm/postprocessing/BokehPass.js');
const { OutputPass } = await import('./jsm/postprocessing/OutputPass.js');
const { RectAreaLightUniformsLib } = await import('./jsm/lights/RectAreaLightUniformsLib.js');
RectAreaLightUniformsLib.init();

const V = P.get('v') || 'genel';
renderer.toneMappingExposure = 0.85;
for (const m of Object.values(M)) if (m.envMapIntensity !== undefined) m.envMapIntensity = 0.55;

// ---------- prosedürel dokular ----------
function gurultu(w, h, temel, sapma, leke = 0, tohum = 1) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
  c.fillStyle = temel; c.fillRect(0, 0, w, h);
  let t = tohum; const rnd = () => (t = (t * 9301 + 49297) % 233280) / 233280;
  const img = c.getImageData(0, 0, w, h); const d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * sapma; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  c.putImageData(img, 0, 0);
  for (let i = 0; i < leke; i++) { const x = rnd() * w, y = rnd() * h, r = 20 + rnd() * 120; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(0,0,0,${0.04 + rnd() * 0.08})`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  return cv;
}
function doku(cv, tekrar = 1) { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(tekrar, tekrar); t.anisotropy = 8; return t; }
function fayans(w, h, renk, derz, adim) {
  const cv = gurultu(w, h, renk, 14, 6, 7); const c = cv.getContext('2d'); c.strokeStyle = derz; c.lineWidth = 3;
  for (let x = 0; x <= w; x += adim) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  for (let y = 0; y <= h; y += adim) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  return cv;
}

// ---------- oda ----------
const gece = V === 'gece';
const zeminCv = gurultu(1024, 1024, '#5d636a', 22, 60, 3);
const zeminM = new THREE.MeshPhysicalMaterial({ map: doku(zeminCv, 3), roughness: 0.42, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.18, envMapIntensity: 0.7 });
const zemin = mesh(new THREE.PlaneGeometry(14, 14), zeminM, 0, 0, 0); zemin.rotation.x = -Math.PI / 2; zemin.castShadow = false;
// sarı güvenlik şeridi
const serit = mesh(new THREE.PlaneGeometry(4.6, 0.06), new THREE.MeshStandardMaterial({ color: 0xf2c200, roughness: 0.6 }), 0.2, 0.002, 0.95); serit.rotation.x = -Math.PI / 2;
// arka duvar: alt fayans, üst boyalı sıva
const duvarZ = -0.95;
const altDuvar = mesh(new THREE.PlaneGeometry(14, 1.2), new THREE.MeshStandardMaterial({ map: doku(fayans(1024, 128, '#8e989f', '#5f686f', 64), 1), roughness: 0.35 }), 0, 0.6, duvarZ);
altDuvar.material.map.repeat.set(7, 1);
const ustDuvar = mesh(new THREE.PlaneGeometry(14, 3.2), new THREE.MeshStandardMaterial({ map: doku(gurultu(1024, 512, '#4b5157', 18, 50, 5), 1), roughness: 0.9 }), 0, 2.8, duvarZ);
kutu(14, 0.05, 0.03, new THREE.MeshStandardMaterial({ color: 0x1458b8, roughness: 0.5 }), 0, 1.22, duvarZ + 0.015);
// sol duvar
const solDuvar = mesh(new THREE.PlaneGeometry(6, 4.4), new THREE.MeshStandardMaterial({ map: doku(gurultu(1024, 1024, '#42484e', 18, 50, 9), 1), roughness: 0.9 }), -3.2, 2.2, 1.5); solDuvar.rotation.y = Math.PI / 2;
// duvardaki tesisat: galvaniz borular + kelepçeler
const galv = new THREE.MeshStandardMaterial({ color: 0xb9c0c7, metalness: 1, roughness: 0.38, envMapIntensity: 0.6 });
const maviBoru = new THREE.MeshPhysicalMaterial({ color: 0x1e5fb4, roughness: 0.4, clearcoat: 0.5, envMapIntensity: 0.5 });
const kirmiziBoru = new THREE.MeshPhysicalMaterial({ color: 0xb3221b, roughness: 0.4, clearcoat: 0.5, envMapIntensity: 0.5 });
boru([[-3.2, 2.35, duvarZ + 0.14], [3.5, 2.35, duvarZ + 0.14]], 0.07, galv);
boru([[-3.2, 2.62, duvarZ + 0.16], [3.5, 2.62, duvarZ + 0.16]], 0.09, maviBoru);
boru([[-3.2, 2.85, duvarZ + 0.12], [3.5, 2.85, duvarZ + 0.12]], 0.05, kirmiziBoru);
for (let x = -2.8; x < 3.5; x += 1.1) { kutu(0.06, 0.62, 0.05, M.dokum, x, 2.62, duvarZ + 0.03); [2.35, 2.62, 2.85].forEach(y => { const t = mesh(new THREE.TorusGeometry(y === 2.62 ? 0.095 : 0.075, 0.012, 8, 32), M.dokum, x, y, duvarZ + 0.15); }); }
boru([[2.2, 2.62, duvarZ + 0.16], [2.2, 1.4, duvarZ + 0.16], [2.2, 1.4, 0.0]], 0.09, maviBoru);
// kablo kanalı + armatür
kutu(6.5, 0.06, 0.25, galv, 0, 3.4, duvarZ + 0.2);
const armM = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: gece ? 3.2 : 2.2 });
[-1.4, 1.4].forEach(x => { kutu(1.3, 0.05, 0.16, M.gri, x, 3.62, 0.3); kutu(1.2, 0.02, 0.1, armM, x, 3.59, 0.3); });

// ---------- ekipman ----------
const hid = new THREE.Group(); scene.add(hid);
const _add = scene.add.bind(scene);
// paket hidrofor (MODELLER.hidrofor içeriğini merkezde kur)
S.MODELLER.hidrofor();
// ikinci tank + duvar panosu
membranTank(null, 1.75, -0.35, 1.05, 0.95);
boru([[1.05, 0.08, 0.36], [1.75, 0.08, 0.36], [1.75, 0.08, -0.35]], 0.03, M.celik);
// yatay pompa (sağ önde, ikinci ekipman)
if (V === 'pompa' || V === 'genel' || V === 'gece') yatayPompa(null, -2.3, 0.55);

// ---------- detay ve aksesuarlar ----------
const { Reflector } = await import('./jsm/objects/Reflector.js');
// (yansıma kapatıldı: fazla ayna gibi duruyordu)
// izolasyonlu (beyaz kılıflı) sıcak su hattı
const izo = new THREE.MeshStandardMaterial({ color: 0xe9ecef, roughness: 0.75, metalness: 0 });
boru([[-3.2, 3.08, duvarZ + 0.15], [3.5, 3.08, duvarZ + 0.15]], 0.085, izo);
for (let x = -2.6; x < 3.5; x += 0.9) mesh(new THREE.TorusGeometry(0.087, 0.006, 6, 32), M.celikMat, x, 3.08, duvarZ + 0.15).rotation.y = Math.PI / 2;
// duvar hattında volanlı sürgülü vana + manometre
const vg = new THREE.Group(); vg.position.set(-1.6, 2.62, duvarZ + 0.16); scene.add(vg);
mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 32), maviBoru, 0, 0, 0, vg).rotation.z = Math.PI / 2;
mesh(new THREE.BoxGeometry(0.14, 0.26, 0.16), maviBoru, 0, 0.12, 0, vg);
mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 12), M.celik, 0, 0.32, 0, vg);
const vol = mesh(new THREE.TorusGeometry(0.11, 0.012, 10, 40), M.kolKirmizi, 0, 0.43, 0, vg); vol.rotation.x = Math.PI / 2;
for (let i = 0; i < 4; i++) { const k = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 8), M.kolKirmizi, 0, 0.43, 0, vg); k.rotation.z = Math.PI / 2; k.rotation.y = i * Math.PI / 4; }
manometre(-0.9, 2.82, duvarZ + 0.27, null, 0.07); boru([[-0.9, 2.62, duvarZ + 0.2], [-0.9, 2.72, duvarZ + 0.2]], 0.01, M.pirinc);
// genel uyarı levhası (markasız)
const lv = tabelaDoku([['⚠', 120, 120, '#111'], ['DİKKAT', 70, 200, '#111'], ['YETKİSİZ GİRİLMEZ', 34, 245, '#111']], 512, 280, '#ffd400');
mesh(new THREE.PlaneGeometry(0.5, 0.28), new THREE.MeshStandardMaterial({ map: lv, roughness: 0.5 }), 0.75, 1.75, duvarZ + 0.005);
// yangın söndürücü (markasız)
const ys = new THREE.Group(); ys.position.set(-2.85, 0, -0.55); scene.add(ys);
mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.5, 40), M.kirmizi, 0, 0.3, 0, ys); mesh(new THREE.SphereGeometry(0.085, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), M.kirmizi, 0, 0.55, 0, ys);
mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.08, 16), M.siyah, 0, 0.66, 0, ys); kutu(0.14, 0.02, 0.03, M.siyah, 0.04, 0.7, 0, ys);
mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.03, 0.68, 0), new THREE.Vector3(0.12, 0.6, 0.02), new THREE.Vector3(0.1, 0.3, 0.06)]), 24, 0.012, 8), M.siyah);
// kablo kanalından panoya inen kablo borusu
boru([[-1.25, 3.4, duvarZ + 0.2], [-1.25, 1.27, duvarZ + 0.2], [-1.25, 1.27, 0.0]], 0.022, M.siyah);

// zemin süzgeci
const suzgec = mesh(new THREE.CircleGeometry(0.12, 32), new THREE.MeshStandardMaterial({ color: 0x3a3f45, metalness: 0.8, roughness: 0.5 }), 0.6, 0.003, 1.3); suzgec.rotation.x = -Math.PI / 2;
// zemine hafif su lekesi (parlak)
const islak = mesh(new THREE.CircleGeometry(0.5, 48), new THREE.MeshPhysicalMaterial({ color: 0x6e7680, roughness: 0.05, transparent: true, opacity: 0.12, clearcoat: 1 }), 0.9, 0.004, 1.15); islak.rotation.x = -Math.PI / 2; islak.scale.set(1.6, 1, 1);

// ---------- ışıklar ----------
scene.add(new THREE.HemisphereLight(gece ? 0x8fb4ff : 0xcfdcff, 0x1a1816, gece ? 0.12 : 0.18));
const ust = new THREE.RectAreaLight(0xffffff, gece ? 3 : 2.2, 3.2, 0.5); ust.position.set(0, 3.55, 0.3); ust.lookAt(0, 0, 0.3); scene.add(ust);
const ana = new THREE.SpotLight(gece ? 0xbcd4ff : 0xfff1dc, gece ? 30 : 26, 12, 0.5, 0.75, 1.6); ana.position.set(2.8, 3.6, 3.2); ana.target.position.set(0.1, 0.5, 0); ana.castShadow = true; ana.shadow.mapSize.set(2048, 2048); ana.shadow.bias = -0.0004; ana.shadow.radius = 4; scene.add(ana, ana.target);
const pencere = new THREE.SpotLight(gece ? 0x2f6bff : 0xcfe4ff, gece ? 16 : 10, 10, 0.8, 0.9, 1.5); pencere.position.set(-3.0, 2.8, 1.8); pencere.target.position.set(0, 0.6, 0); pencere.castShadow = true; pencere.shadow.mapSize.set(1024, 1024); scene.add(pencere, pencere.target);
const kenar = new THREE.PointLight(gece ? 0x37a3ff : 0x9ccfff, gece ? 5 : 3.5, 5, 2); kenar.position.set(0.2, 1.6, -0.7); scene.add(kenar);
scene.fog = new THREE.Fog(gece ? 0x070d17 : 0x14181d, 9, 20);

// ---------- kamera ----------
const kam = new THREE.PerspectiveCamera(W / H < 0.7 ? 46 : 38, W / H, 0.05, 40);
const K = {
  genel: { p: [3.3, 1.5, 5.4], t: [-0.1, 0.7, 0], f: 5.6 },
  gece: { p: [-2.8, 1.4, 5.2], t: [0.1, 0.7, 0], f: 5.5 },
  pompa: { p: [-0.9, 0.55, 2.3], t: [-2.05, 0.35, 0.5], f: 2.0 },
  tank: { p: [3.4, 0.95, 2.4], t: [1.4, 0.75, -0.1], f: 2.9 },
  pano: { p: [-0.2, 1.2, 2.2], t: [-1.15, 1.0, 0.1], f: 2.1 },
}[V] || { p: [2.6, 1.55, 4.4], t: [0, 0.6, 0], f: 4.6 };
kam.position.set(...K.p); kam.lookAt(...K.t);

// ---------- son işlem ----------
const comp = new EffectComposer(renderer); comp.setSize(W, H);
comp.addPass(new RenderPass(scene, kam));
const sao = new SAOPass(scene, kam); Object.assign(sao.params, { saoBias: 0.5, saoIntensity: 0.012, saoScale: 4, saoKernelRadius: 40, saoMinResolution: 0, saoBlur: true, saoBlurRadius: 6, saoBlurStdDev: 4, saoBlurDepthCutoff: 0.01 }); comp.addPass(sao);
comp.addPass(new BokehPass(scene, kam, { focus: K.f, aperture: 0.0016, maxblur: 0.006 }));
comp.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), gece ? 0.5 : 0.3, 0.5, 0.9));
comp.addPass(new OutputPass());
scene.background = new THREE.Color(gece ? 0x070d17 : 0x14181d);
comp.render();
window.__hazir = { ok: 1 };
