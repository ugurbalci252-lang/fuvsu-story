// Fuvsu Pompa — gerçekçi 3B ekipman modelleri (tamamen özgün, prosedürel; marka/logo yok).
// Tarayıcıda çalışır: sahne3d.html?m=<model>&yaw=<derece>&pitch=<derece>&w=1600&h=1200
import * as THREE from './lib/three.module.min.js';
import { RoomEnvironment } from './lib/RoomEnvironment.js';

const P = new URLSearchParams(location.search);
const W = +P.get('w') || 1600, H = +P.get('h') || 1200;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

// ---------- malzemeler ----------
const M = {
  mavi: new THREE.MeshPhysicalMaterial({ color: 0x1458b8, metalness: 0.35, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.25 }),
  maviKoyu: new THREE.MeshPhysicalMaterial({ color: 0x0c3c82, metalness: 0.35, roughness: 0.45, clearcoat: 0.5 }),
  celik: new THREE.MeshStandardMaterial({ color: 0xdfe4ea, metalness: 1, roughness: 0.2 }),
  celikMat: new THREE.MeshStandardMaterial({ color: 0xc4cad1, metalness: 1, roughness: 0.42 }),
  dokum: new THREE.MeshStandardMaterial({ color: 0x5b636c, metalness: 0.7, roughness: 0.55 }),
  siyah: new THREE.MeshStandardMaterial({ color: 0x1b1f24, metalness: 0.2, roughness: 0.6 }),
  kirmizi: new THREE.MeshPhysicalMaterial({ color: 0xc81d1d, metalness: 0.2, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 }),
  kolKirmizi: new THREE.MeshPhysicalMaterial({ color: 0xd9271c, metalness: 0.1, roughness: 0.35, clearcoat: 0.6 }),
  pirinc: new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 1, roughness: 0.3 }),
  gri: new THREE.MeshPhysicalMaterial({ color: 0xd5dbe1, metalness: 0.1, roughness: 0.45, clearcoat: 0.3 }),
  beyaz: new THREE.MeshStandardMaterial({ color: 0xf4f6f8, metalness: 0, roughness: 0.5 }),
  plastik: new THREE.MeshPhysicalMaterial({ color: 0x23344a, metalness: 0.05, roughness: 0.4, clearcoat: 0.4 }),
  sari: new THREE.MeshPhysicalMaterial({ color: 0xffc81e, metalness: 0.05, roughness: 0.35, clearcoat: 0.5 }),
  cam: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.18, clearcoat: 1 }),
};
const ankraj = {}; // etiket noktaları (3B)

// ---------- yardımcılar ----------
function mesh(geo, mat, x = 0, y = 0, z = 0, parent) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (parent || scene).add(m); return m; }
const silY = (r1, r2, h, s = 64) => new THREE.CylinderGeometry(r1, r2, h, s);
function silX(r, l, mat, x, y, z, p, s = 64) { const m = mesh(silY(r, r, l, s), mat, x, y, z, p); m.rotation.z = Math.PI / 2; return m; }
function silZ(r, l, mat, x, y, z, p, s = 64) { const m = mesh(silY(r, r, l, s), mat, x, y, z, p); m.rotation.x = Math.PI / 2; return m; }
function kutu(w, h, d, mat, x, y, z, p, r = 0) { const g = r ? yuvarlakKutu(w, h, d, r) : new THREE.BoxGeometry(w, h, d); return mesh(g, mat, x, y, z, p); }
function yuvarlakKutu(w, h, d, r) {
  const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: d - r * 0.6, bevelEnabled: true, bevelThickness: r * 0.3, bevelSize: r * 0.3, bevelSegments: 4, curveSegments: 8 });
  g.translate(0, 0, -(d - r * 0.6) / 2); return g;
}
function flans(r, t, eksen, x, y, z, p, delik = 8) { // flanş + cıvatalar
  const g = new THREE.Group(); g.position.set(x, y, z); (p || scene).add(g);
  const f = mesh(silY(r, r, t), M.celikMat, 0, 0, 0, g);
  for (let i = 0; i < delik; i++) { const a = i / delik * Math.PI * 2; mesh(silY(r * 0.09, r * 0.09, t * 1.9, 6), M.dokum, Math.cos(a) * r * 0.78, 0, Math.sin(a) * r * 0.78, g); }
  if (eksen === 'x') g.rotation.z = Math.PI / 2; if (eksen === 'z') g.rotation.x = Math.PI / 2; return g;
}
function kanatliMotor(r, l, p, eksen = 'x') { // gövde kanatlı elektrik motoru, uzunluk ekseni boyunca
  const g = new THREE.Group(); (p || scene).add(g);
  mesh(silY(r, r, l), M.mavi, 0, 0, 0, g);
  const n = 28; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const k = kutu(r * 0.1, l * 0.9, r * 0.16, M.mavi, Math.cos(a) * r * 1.04, 0, Math.sin(a) * r * 1.04, g); k.rotation.y = -a; }
  mesh(silY(r * 1.06, r * 1.06, l * 0.06), M.maviKoyu, 0, l / 2, 0, g); mesh(silY(r * 1.06, r * 1.06, l * 0.06), M.maviKoyu, 0, -l / 2, 0, g);
  // fan kapağı
  const fk = mesh(silY(r * 1.08, r * 1.12, l * 0.28), M.maviKoyu, 0, -l / 2 - l * 0.14, 0, g);
  const izgara = new THREE.Group(); izgara.position.y = -l / 2 - l * 0.285; g.add(izgara);
  for (let i = 1; i <= 5; i++) { const t = mesh(new THREE.TorusGeometry(r * i / 5.6, r * 0.018, 8, 64), M.siyah, 0, 0, 0, izgara); t.rotation.x = Math.PI / 2; }
  // klemens kutusu
  kutu(r * 0.75, l * 0.32, r * 0.75, M.mavi, r * 1.2, l * 0.1, 0, g, r * 0.06).rotation.z = 0;
  kutu(r * 0.8, l * 0.04, r * 0.8, M.maviKoyu, r * 1.62, l * 0.1, 0, g).rotation.z = Math.PI / 2;
  silX(r * 0.08, r * 0.3, M.siyah, r * 1.2, l * 0.1 - l * 0.12, r * 0.42, g, 16).rotation.set(Math.PI / 2, 0, 0);
  // etiket plakası
  const pl = kutu(r * 0.02, l * 0.22, r * 0.5, M.celik, 0, 0, 0, g); pl.position.set(Math.cos(Math.PI * 0.25) * r * 1.13, 0, -Math.sin(Math.PI * 0.25) * r * 1.13); pl.rotation.y = Math.PI * 0.25;
  if (eksen === 'x') g.rotation.z = Math.PI / 2;
  return g;
}
function vana(x, y, z, p, kolYonu = 0, r = 0.05) { // küresel vana: gövde + kırmızı kol
  const g = new THREE.Group(); g.position.set(x, y, z); (p || scene).add(g);
  mesh(new THREE.SphereGeometry(r * 1.25, 32, 24), M.pirinc, 0, 0, 0, g);
  mesh(silY(r * 0.95, r * 0.95, r * 3.2, 6), M.pirinc, 0, 0, 0, g);
  mesh(silY(r * 0.25, r * 0.25, r * 1.4, 16), M.celik, 0, 0, r * 1.2, g).rotation.x = Math.PI / 2;
  const kol = kutu(r * 4.5, r * 0.35, r * 0.6, M.kolKirmizi, r * 1.8, 0, r * 1.9, g, r * 0.15); kol.rotation.y = kolYonu;
  return g;
}
function manometre(x, y, z, p, r = 0.09, yon = 0) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = yon; (p || scene).add(g);
  const cv = document.createElement('canvas'); cv.width = cv.height = 512; const c = cv.getContext('2d');
  c.fillStyle = '#fff'; c.beginPath(); c.arc(256, 256, 256, 0, 7); c.fill();
  const ark = (a1, a2, renk) => { c.strokeStyle = renk; c.lineWidth = 26; c.beginPath(); c.arc(256, 256, 200, a1, a2); c.stroke(); };
  const A = d => (d - 90) * Math.PI / 180; ark(A(-135), A(-60), '#e5332a'); ark(A(-60), A(50), '#2bb673'); ark(A(50), A(135), '#ffcc00');
  c.strokeStyle = '#111'; for (let i = 0; i <= 40; i++) { const a = A(-135 + i * 6.75); c.lineWidth = i % 5 ? 3 : 7; const r1 = i % 5 ? 214 : 196; c.beginPath(); c.moveTo(256 + Math.cos(a) * r1, 256 + Math.sin(a) * r1); c.lineTo(256 + Math.cos(a) * 232, 256 + Math.sin(a) * 232); c.stroke(); }
  c.fillStyle = '#111'; c.font = 'bold 46px Poppins, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i <= 8; i++) { const a = A(-135 + i * 33.75); c.fillText(i * 2, 256 + Math.cos(a) * 150, 256 + Math.sin(a) * 150); }
  c.font = 'bold 40px Poppins, Arial'; c.fillStyle = '#555'; c.fillText('bar', 256, 370);
  const ac = A(-135 + (+P.get('ibre') || 4) / 16 * 270); c.strokeStyle = '#c62828'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(256 - Math.cos(ac) * 30, 256 - Math.sin(ac) * 30); c.lineTo(256 + Math.cos(ac) * 190, 256 + Math.sin(ac) * 190); c.stroke();
  c.fillStyle = '#222'; c.beginPath(); c.arc(256, 256, 24, 0, 7); c.fill();
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  const yuz = mesh(new THREE.CircleGeometry(r * 0.86, 64), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.6 }), 0, 0, r * 0.15, g);
  const kasa = mesh(silY(r, r, r * 0.28, 64), M.celik, 0, 0, 0, g); kasa.rotation.x = Math.PI / 2;
  const bez = mesh(new THREE.TorusGeometry(r * 0.93, r * 0.08, 16, 64), M.celik, 0, 0, r * 0.17, g);
  mesh(new THREE.CircleGeometry(r * 0.88, 64), M.cam, 0, 0, r * 0.2, g);
  mesh(silY(r * 0.14, r * 0.14, r * 0.7, 6), M.pirinc, 0, -r * 1.25, 0, g);
  return g;
}
function boru(noktalar, r, mat, p) { // köşeli boru hattı (dirsekli)
  for (let i = 0; i < noktalar.length - 1; i++) {
    const a = new THREE.Vector3(...noktalar[i]), b = new THREE.Vector3(...noktalar[i + 1]); const l = a.distanceTo(b);
    const m = mesh(silY(r, r, l, 48), mat, 0, 0, 0, p); m.position.copy(a.clone().add(b).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    if (i > 0) mesh(new THREE.SphereGeometry(r * 1.06, 32, 24), mat, a.x, a.y, a.z, p);
  }
}
function tabelaDoku(satirlar, w = 512, h = 256, bg = '#ffffff', fg = '#0b2a4a') {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
  c.fillStyle = bg; c.fillRect(0, 0, w, h); c.fillStyle = fg; c.textAlign = 'center';
  satirlar.forEach(([t, px, y, renk]) => { c.font = `bold ${px}px Poppins, Arial`; c.fillStyle = renk || fg; c.fillText(t, w / 2, y); });
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}

// ---------- modeller ----------
function yatayPompa(p, x = 0, z = 0) { // monoblok santrifüj pompa
  const g = new THREE.Group(); g.position.set(x, 0, z); (p || scene).add(g);
  kutu(1.25, 0.06, 0.46, M.dokum, -0.05, 0.03, 0, g, 0.01);
  [-0.5, 0.35].forEach(xx => [-0.17, 0.17].forEach(zz => mesh(silY(0.018, 0.018, 0.03, 6), M.celik, xx, 0.075, zz, g)));
  const mot = kanatliMotor(0.2, 0.62, g, 'x'); mot.position.set(-0.22, 0.33, 0); mot.rotation.z = -Math.PI / 2; // fan arkada (-x)
  kutu(0.42, 0.12, 0.34, M.mavi, -0.22, 0.12, 0, g);
  mesh(silY(0.15, 0.2, 0.16, 48), M.maviKoyu, 0.17, 0.33, 0, g).rotation.z = Math.PI / 2; // fener
  // salyangoz gövde
  const sal = mesh(new THREE.TorusGeometry(0.17, 0.11, 32, 64), M.mavi, 0.38, 0.33, 0, g); sal.rotation.y = Math.PI / 2; sal.scale.set(1, 1, 0.75);
  silX(0.2, 0.16, M.mavi, 0.38, 0.33, 0, g);
  silX(0.085, 0.16, M.mavi, 0.52, 0.33, 0, g);
  flans(0.13, 0.03, 'x', 0.61, 0.33, 0, g); // emiş
  mesh(silY(0.075, 0.075, 0.2, 48), M.mavi, 0.38, 0.56, 0.06, g); flans(0.12, 0.03, 'y', 0.38, 0.67, 0.06, g); // basma
  kutu(0.2, 0.2, 0.3, M.mavi, 0.38, 0.13, 0, g);
  ankraj.motor = [-0.25, 0.55, 0.1]; ankraj.salyangoz = [0.45, 0.25, 0.12]; ankraj.basma = [0.38, 0.69, 0.06]; ankraj.emis = [0.63, 0.33, 0];
  return g;
}
function dikeyPompa(p, x = 0, z = 0, s = 1) { // dikey çok kademeli pompa
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); (p || scene).add(g);
  kutu(0.34, 0.08, 0.3, M.dokum, 0, 0.04, 0, g, 0.015);
  kutu(0.36, 0.14, 0.18, M.celikMat, 0, 0.15, 0, g, 0.02);
  flans(0.075, 0.025, 'x', 0.19, 0.15, 0, g, 4); flans(0.075, 0.025, 'x', -0.19, 0.15, 0, g, 4);
  mesh(silY(0.1, 0.1, 0.5, 64), M.celik, 0, 0.47, 0, g);
  for (let i = 0; i < 6; i++) mesh(new THREE.TorusGeometry(0.1, 0.006, 8, 64), M.celikMat, 0, 0.27 + i * 0.08, 0, g).rotation.x = Math.PI / 2;
  [[0.08, 0.08], [-0.08, 0.08], [0.08, -0.08], [-0.08, -0.08]].forEach(([a, b]) => mesh(silY(0.008, 0.008, 0.5, 8), M.celikMat, a * 1.45, 0.47, b * 1.45, g));
  mesh(silY(0.13, 0.13, 0.04, 48), M.dokum, 0, 0.74, 0, g);
  mesh(silY(0.1, 0.13, 0.12, 48), M.maviKoyu, 0, 0.82, 0, g);
  const mot = kanatliMotor(0.15, 0.4, g, 'y'); mot.position.set(0, 1.1, 0); mot.rotation.x = Math.PI; // fan üstte
  return g;
}
function membranTank(p, x = 0, z = 0, s = 1, boy = 0.75) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); (p || scene).add(g);
  const r = 0.24;
  mesh(silY(r, r, boy, 96), M.kirmizi, 0, 0.16 + boy / 2, 0, g);
  const ust = mesh(new THREE.SphereGeometry(r, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2), M.kirmizi, 0, 0.16 + boy, 0, g); ust.scale.y = 0.55;
  const alt = mesh(new THREE.SphereGeometry(r, 96, 48, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.kirmizi, 0, 0.16, 0, g); alt.scale.y = 0.45;
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + 0.5; const k = kutu(0.04, 0.2, 0.04, M.dokum, Math.cos(a) * r * 0.8, 0.1, Math.sin(a) * r * 0.8, g); k.rotation.z = Math.cos(a) * 0.25; k.rotation.x = -Math.sin(a) * 0.25; }
  mesh(new THREE.TorusGeometry(r * 0.82, 0.012, 8, 64), M.dokum, 0, 0.12, 0, g).rotation.x = Math.PI / 2;
  mesh(silY(0.04, 0.04, 0.12, 24), M.celik, 0, 0.04, 0, g);
  mesh(silY(0.03, 0.03, 0.08, 24), M.celik, 0, 0.16 + boy + r * 0.55 + 0.02, 0, g);
  mesh(silY(0.04, 0.04, 0.04, 6), M.siyah, 0, 0.16 + boy + r * 0.55 + 0.07, 0, g);
  const et = mesh(new THREE.CylinderGeometry(r * 1.003, r * 1.003, 0.2, 64, 1, true, -0.55, 1.1), new THREE.MeshStandardMaterial({ map: tabelaDoku([['BASINÇ TANKI', 52, 110, '#c81d1d'], ['membranlı', 38, 175, '#333']]), roughness: 0.5, side: THREE.DoubleSide }), 0, 0.16 + boy * 0.55, 0, g);
  et.rotation.y = 0.45;
  ankraj.tank = [x + 0.18 * s, (0.16 + boy * 0.75) * s, z + 0.15 * s]; ankraj.sibop = [x, (0.16 + boy + r * 0.55 + 0.08) * s, z];
  return g;
}
function pano(p, x = 0, z = 0, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); (p || scene).add(g);
  mesh(silY(0.025, 0.025, 0.7, 16), M.celikMat, 0, 0.35, -0.02, g);
  kutu(0.46, 0.6, 0.2, M.gri, 0, 0.95, 0, g, 0.02);
  const cv = tabelaDoku([['4.2 bar', 110, 150, '#5fd0ff'], ['P1 ●   P2 ●', 46, 225, '#9be3ff']], 512, 280, '#0b2a4a');
  mesh(new THREE.PlaneGeometry(0.3, 0.16), new THREE.MeshStandardMaterial({ map: cv, emissive: 0xffffff, emissiveMap: cv, emissiveIntensity: 0.6 }), 0, 1.1, 0.101, g);
  [[-0.12, 0x2bb673], [-0.04, 0x2bb673], [0.04, 0xffcc00], [0.12, 0xe5332a]].forEach(([xx, c]) => mesh(silY(0.022, 0.022, 0.02, 32), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.5 }), xx, 0.96, 0.105, g).rotation.x = Math.PI / 2);
  kutu(0.11, 0.06, 0.03, new THREE.MeshStandardMaterial({ color: 0x2bb673 }), -0.08, 0.85, 0.105, g, 0.008);
  kutu(0.11, 0.06, 0.03, new THREE.MeshStandardMaterial({ color: 0xe5332a }), 0.08, 0.85, 0.105, g, 0.008);
  mesh(silY(0.045, 0.045, 0.03, 32), M.sari, 0, 0.74, 0.105, g).rotation.x = Math.PI / 2;
  kutu(0.02, 0.06, 0.02, M.siyah, 0, 0.74, 0.125, g);
  ankraj.pano = [x, 1.1 * s, z + 0.11 * s];
  return g;
}

const MODELLER = {
  pompa() { yatayPompa(); },
  dikey() { dikeyPompa(); },
  tank() { membranTank(null, 0, 0, 1, 0.8); },
  manometre() { const g = manometre(0, 0.45, 0, null, 0.28); boru([[0, 0, 0], [0, 0.12, 0]], 0.03, M.pirinc); ankraj.ibre = [0, 0.5, 0.1]; },
  hidrofor() { // 3 pompalı paket hidrofor grubu
    const xs = [-0.55, 0, 0.55];
    kutu(1.75, 0.07, 0.62, M.dokum, 0, 0.035, 0, null, 0.01);
    xs.forEach(x => dikeyPompa(null, x, 0.02, 0.9));
    // kollektörler (önde)
    silX(0.065, 1.8, M.celik, 0, 0.14, 0.36); silX(0.065, 1.8, M.celik, 0, 0.62, 0.36);
    flans(0.11, 0.03, 'x', -0.92, 0.14, 0.36); flans(0.11, 0.03, 'x', -0.92, 0.62, 0.36);
    mesh(new THREE.SphereGeometry(0.066, 32, 16), M.celik, 0.9, 0.14, 0.36); mesh(new THREE.SphereGeometry(0.066, 32, 16), M.celik, 0.9, 0.62, 0.36);
    xs.forEach(x => {
      boru([[x + 0.17, 0.135, 0], [x + 0.17, 0.135, 0.18], [x + 0.17, 0.14, 0.36]], 0.032, M.celik);
      boru([[x - 0.17, 0.135, 0], [x - 0.25, 0.135, 0], [x - 0.25, 0.4, 0], [x - 0.25, 0.4, 0.36], [x - 0.25, 0.62, 0.36]], 0.032, M.celik);
      vana(x - 0.25, 0.4, 0.2, null, 0.3, 0.035);
      vana(x + 0.17, 0.135, 0.22, null, -0.3, 0.035);
    });
    manometre(0.15, 0.8, 0.36, null, 0.075); boru([[0.15, 0.62, 0.36], [0.15, 0.7, 0.36]], 0.012, M.pirinc);
    membranTank(null, 1.2, 0.2, 0.8, 0.7); boru([[0.9, 0.62, 0.36], [1.05, 0.62, 0.36], [1.05, 0.08, 0.36], [1.2, 0.08, 0.2]], 0.03, M.celik);
    pano(null, -1.25, 0.1, 1);
    ankraj.pompa = [0, 0.75, 0.15]; ankraj.kollektor = [-0.6, 0.62, 0.42]; ankraj.vana = [0.3, 0.4, 0.26]; ankraj.manometre = [0.15, 0.8, 0.44];
  },
  dalgic() { // dalgıç pompa (yatay yatırılmış, ürün çekimi gibi)
    const g = new THREE.Group(); scene.add(g); g.rotation.z = Math.PI / 2; g.position.set(0, 0.11, 0);
    mesh(silY(0.095, 0.095, 0.6, 64), M.celik, 0, 0.35, 0, g);
    for (let i = 0; i < 9; i++) mesh(new THREE.TorusGeometry(0.095, 0.005, 8, 64), M.celikMat, 0, 0.1 + i * 0.065, 0, g).rotation.x = Math.PI / 2;
    // emiş ızgarası
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; mesh(silY(0.007, 0.007, 0.12, 6), M.celikMat, Math.cos(a) * 0.09, -0.02, Math.sin(a) * 0.09, g); }
    mesh(silY(0.07, 0.07, 0.12, 32), M.siyah, 0, -0.02, 0, g);
    mesh(silY(0.095, 0.095, 0.03, 64), M.celik, 0, 0.055, 0, g); mesh(silY(0.095, 0.095, 0.03, 64), M.celik, 0, -0.095, 0, g);
    mesh(silY(0.088, 0.088, 0.5, 64), M.maviKoyu, 0, -0.36, 0, g);
    mesh(silY(0.088, 0.07, 0.06, 64), M.celikMat, 0, -0.64, 0, g);
    mesh(silY(0.07, 0.06, 0.08, 6), M.celik, 0, 0.69, 0, g); mesh(silY(0.045, 0.045, 0.08, 32), M.pirinc, 0, 0.76, 0, g);
    const kablo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.1, -0.5, 0.02), new THREE.Vector3(0.11, 0, 0.03), new THREE.Vector3(0.11, 0.6, 0.02), new THREE.Vector3(0.2, 0.9, 0.2), new THREE.Vector3(0.05, 1.1, 0.5)]), 64, 0.012, 12);
    mesh(kablo, M.siyah, 0, 0, 0, g);
    ankraj.pompaKismi = [-0.4, 0.2, 0.08]; ankraj.izgara = [0.02, 0.2, 0.09]; ankraj.motor = [0.4, 0.2, 0.08]; ankraj.cikis = [-0.75, 0.12, 0];
  },
  drenaj() { // portatif drenaj (pis su) pompası + şamandıra
    mesh(silY(0.15, 0.17, 0.08, 48), M.plastik, 0, 0.04, 0);
    mesh(silY(0.14, 0.15, 0.3, 48), M.plastik, 0, 0.23, 0);
    mesh(silY(0.12, 0.14, 0.06, 48), M.celikMat, 0, 0.41, 0);
    const kol = mesh(new THREE.TorusGeometry(0.1, 0.018, 16, 48, Math.PI), M.siyah, 0, 0.45, 0);
    silX(0.04, 0.16, M.plastik, 0.2, 0.06, 0); flans(0.05, 0.02, 'x', 0.29, 0.06, 0, null, 4);
    const sam = mesh(new THREE.SphereGeometry(0.05, 32, 16), M.sari, -0.26, 0.12, 0.12); sam.scale.set(1.4, 0.8, 0.8);
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.08, 0.35, 0.05), new THREE.Vector3(-0.2, 0.3, 0.1), new THREE.Vector3(-0.26, 0.15, 0.12)]), 32, 0.008, 8), M.siyah);
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.05, 0.42, -0.05), new THREE.Vector3(0.1, 0.6, -0.2), new THREE.Vector3(-0.2, 0.7, -0.4)]), 32, 0.01, 8), M.siyah);
    ankraj.govde = [0.1, 0.25, 0.13]; ankraj.samandira = [-0.3, 0.13, 0.15]; ankraj.cikis = [0.3, 0.06, 0];
  },
  vana() { boru([[-0.6, 0.15, 0], [0.6, 0.15, 0]], 0.05, M.celik); vana(0, 0.15, 0, null, 0, 0.07); flans(0.1, 0.03, 'x', -0.45, 0.15, 0); flans(0.1, 0.03, 'x', 0.45, 0.15, 0); },
};

// ---------- sahne kur & çek ----------
const ad = P.get('m') || 'pompa';
(MODELLER[ad] || MODELLER.pompa)();
const zemin = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.32 })); zemin.rotation.x = -Math.PI / 2; zemin.receiveShadow = true; scene.add(zemin);
scene.updateMatrixWorld(true);
const kutuB = new THREE.Box3(); scene.traverse(o => { if (o.isMesh && o !== zemin) kutuB.expandByObject(o); });
const mer = kutuB.getCenter(new THREE.Vector3()), boy = kutuB.getSize(new THREE.Vector3());
const isik = new THREE.DirectionalLight(0xffffff, 2.2); isik.position.set(mer.x + 2, mer.y + 4, mer.z + 3); isik.target.position.copy(mer); isik.castShadow = true;
isik.shadow.mapSize.set(2048, 2048); const sk = Math.max(boy.x, boy.z) * 1.2; Object.assign(isik.shadow.camera, { left: -sk, right: sk, top: sk, bottom: -sk, near: 0.1, far: 20 }); isik.shadow.radius = 6; isik.shadow.bias = -0.0005;
scene.add(isik, isik.target); scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.5));
const yaw = (+P.get('yaw') || 32) * Math.PI / 180, pitch = (+P.get('pitch') || 18) * Math.PI / 180;
const kam = new THREE.PerspectiveCamera(28, W / H, 0.01, 50);
const r = boy.length() * 0.5; const uz = r / Math.sin(kam.fov * Math.PI / 360) * (+P.get('zoom') || 1.02);
kam.position.set(mer.x + Math.sin(yaw) * Math.cos(pitch) * uz, mer.y + Math.sin(pitch) * uz, mer.z + Math.cos(yaw) * Math.cos(pitch) * uz); kam.lookAt(mer);
renderer.render(scene, kam);
const ekran = {}; for (const [k, v] of Object.entries(ankraj)) { const p = new THREE.Vector3(...v).project(kam); ekran[k] = [+((p.x + 1) / 2).toFixed(4), +((1 - p.y) / 2).toFixed(4)]; }
window.__hazir = { ankraj: ekran };
