// Özgün, telifsiz, renkli ve detaylı vektör sahneler (Fuvsu Pompa için çizildi; başka marka/logo/karakter yok).
// Kullanım: require('./sahneler.js')(ad, {etiketler:[...]}) -> <svg> metni. viewBox 0 0 900 640.
// Sahneler: hidrofor | dalgic | bina | tank | manometre | drenaj | arac | musluk | alet | pano
// etiketler: sahnedeki numaralı noktalara (1,2,3,4) yazılacak kısa etiketler (isteğe bağlı).

const D = (id) => `
<linearGradient id="${id}mavi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fa7ff"/><stop offset=".5" stop-color="#1a73d9"/><stop offset="1" stop-color="#0d4c9c"/></linearGradient>
<linearGradient id="${id}maviY" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0d4c9c"/><stop offset=".35" stop-color="#3fa7ff"/><stop offset=".6" stop-color="#1a73d9"/><stop offset="1" stop-color="#0b3f82"/></linearGradient>
<linearGradient id="${id}krom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7fa"/><stop offset=".45" stop-color="#c3ccd6"/><stop offset=".55" stop-color="#e9eef3"/><stop offset="1" stop-color="#8d98a5"/></linearGradient>
<linearGradient id="${id}kromY" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d98a5"/><stop offset=".3" stop-color="#eef2f6"/><stop offset=".55" stop-color="#c3ccd6"/><stop offset="1" stop-color="#7c8794"/></linearGradient>
<linearGradient id="${id}kirmizi" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8e1414"/><stop offset=".35" stop-color="#ef4a3a"/><stop offset=".6" stop-color="#d42c22"/><stop offset="1" stop-color="#7a0f0f"/></linearGradient>
<linearGradient id="${id}su" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fd0ff" stop-opacity=".95"/><stop offset="1" stop-color="#0a6fc2" stop-opacity=".95"/></linearGradient>
<linearGradient id="${id}toprak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6b43"/><stop offset="1" stop-color="#5d3c22"/></linearGradient>
<linearGradient id="${id}gri" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6ebf0"/><stop offset="1" stop-color="#b9c3cd"/></linearGradient>
<linearGradient id="${id}koyu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c4652"/><stop offset="1" stop-color="#1f262e"/></linearGradient>
<radialGradient id="${id}golge" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<filter id="${id}gl" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#001a33" flood-opacity=".28"/></filter>`;

// Yardımcı parçalar
const vana = (x, y, id, yatay = true) => `<g transform="translate(${x},${y})" filter="url(#${id}gl)">
 <rect x="-16" y="-16" width="32" height="32" rx="6" fill="url(#${id}krom)" stroke="#6b7682" stroke-width="2"/>
 <rect x="-3" y="-40" width="6" height="26" fill="#55606c"/>
 <rect x="${yatay ? -30 : -8}" y="-50" width="${yatay ? 60 : 16}" height="12" rx="6" fill="#e5332a"/>
</g>`;
const mano = (x, y, r, id, aci = 35) => `<g transform="translate(${x},${y})">
 <rect x="-5" y="${r - 2}" width="10" height="22" fill="url(#${id}kromY)"/>
 <circle r="${r}" fill="url(#${id}krom)" stroke="#5d6874" stroke-width="3"/>
 <circle r="${r * 0.82}" fill="#fff"/>
 <path d="M ${-r * 0.62} ${r * 0.36} A ${r * 0.72} ${r * 0.72} 0 0 1 ${-r * 0.36} ${-r * 0.62}" stroke="#2bb673" stroke-width="${r * 0.12}" fill="none"/>
 <path d="M ${-r * 0.36} ${-r * 0.62} A ${r * 0.72} ${r * 0.72} 0 0 1 ${r * 0.36} ${-r * 0.62}" stroke="#ffcc00" stroke-width="${r * 0.12}" fill="none"/>
 <path d="M ${r * 0.36} ${-r * 0.62} A ${r * 0.72} ${r * 0.72} 0 0 1 ${r * 0.62} ${r * 0.36}" stroke="#e5332a" stroke-width="${r * 0.12}" fill="none"/>
 <g transform="rotate(${aci})"><path d="M -3 4 L 0 ${-r * 0.7} L 3 4 Z" fill="#c62828"/></g>
 <circle r="${r * 0.12}" fill="#333"/>
</g>`;
const pompa = (x, y, s, id) => `<g transform="translate(${x},${y}) scale(${s})" filter="url(#${id}gl)">
 <rect x="-10" y="64" width="250" height="16" rx="4" fill="url(#${id}koyu)"/>
 <rect x="0" y="0" width="150" height="66" rx="12" fill="url(#${id}mavi)"/>
 ${[18, 34, 50, 66, 82, 98, 114, 130].map(i => `<rect x="${i}" y="6" width="5" height="54" rx="2" fill="#0b3f82" opacity=".55"/>`).join('')}
 <rect x="-14" y="10" width="20" height="46" rx="6" fill="#0d4c9c"/>
 <rect x="150" y="14" width="22" height="38" fill="url(#${id}krom)"/>
 <circle cx="205" cy="33" r="36" fill="url(#${id}mavi)"/>
 <circle cx="205" cy="33" r="14" fill="#0b3f82"/>
 <rect x="194" y="-22" width="22" height="24" fill="url(#${id}kromY)"/>
 <rect x="232" y="22" width="26" height="22" fill="url(#${id}krom)"/>
 <rect x="20" y="-12" width="44" height="14" rx="4" fill="#0d4c9c"/>
</g>`;
const etiketCiz = (noktalar, etiketler) => (etiketler || []).slice(0, noktalar.length).map((t, i) => {
  const [px, py, lx, ly, sag] = noktalar[i];
  const w = Math.max(120, String(t).length * 15 + 66);
  const bx = sag ? lx : lx - w;
  return `<g><line x1="${px}" y1="${py}" x2="${lx}" y2="${ly}" stroke="#ffffff" stroke-width="5" opacity=".9"/><line x1="${px}" y1="${py}" x2="${lx}" y2="${ly}" stroke="#0b2a4a" stroke-width="2.5"/>
  <circle cx="${px}" cy="${py}" r="12" fill="#ffd23f" stroke="#0b2a4a" stroke-width="3"/>
  <rect x="${bx}" y="${ly - 26}" width="${w}" height="52" rx="26" fill="#ffffff" stroke="#0b2a4a" stroke-width="3"/>
  <circle cx="${bx + 26}" cy="${ly}" r="18" fill="#0e6aa8"/><text x="${bx + 26}" y="${ly + 7}" text-anchor="middle" font-size="20" font-weight="700" fill="#fff" font-family="Poppins">${i + 1}</text>
  <text x="${bx + 52}" y="${ly + 8}" font-size="23" font-weight="600" fill="#0b2a4a" font-family="Poppins">${String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></g>`;
}).join('');

const S = {
  // Çift pompalı hidrofor (paket) grubu + membranlı tank + pano
  hidrofor: (id, o) => `
 <ellipse cx="450" cy="590" rx="400" ry="30" fill="url(#${id}golge)"/>
 <rect x="70" y="548" width="760" height="22" rx="6" fill="url(#${id}koyu)"/>
 <!-- pano -->
 <g filter="url(#${id}gl)"><rect x="70" y="170" width="150" height="230" rx="10" fill="url(#${id}gri)" stroke="#8a96a3" stroke-width="3"/>
 <rect x="92" y="196" width="106" height="58" rx="6" fill="#0b2a4a"/><text x="145" y="234" text-anchor="middle" font-size="26" font-weight="700" fill="#5fd0ff" font-family="Poppins">4.2 bar</text>
 <circle cx="110" cy="290" r="13" fill="#2bb673"/><circle cx="145" cy="290" r="13" fill="#2bb673"/><circle cx="180" cy="290" r="13" fill="#e5332a" opacity=".35"/>
 <rect x="96" y="322" width="44" height="30" rx="6" fill="#2bb673"/><rect x="150" y="322" width="44" height="30" rx="6" fill="#e5332a"/>
 <rect x="138" y="400" width="14" height="148" fill="#8a96a3"/></g>
 <!-- kollektörler -->
 <rect x="250" y="168" width="430" height="34" rx="17" fill="url(#${id}krom)" stroke="#7c8794" stroke-width="2"/>
 <rect x="250" y="494" width="430" height="34" rx="17" fill="url(#${id}krom)" stroke="#7c8794" stroke-width="2"/>
 <rect x="232" y="160" width="26" height="50" rx="4" fill="url(#${id}kromY)"/><rect x="232" y="486" width="26" height="50" rx="4" fill="url(#${id}kromY)"/>
 <!-- dikey bağlantılar -->
 ${[414, 634].map(x => `<rect x="${x - 12}" y="200" width="24" height="114" fill="url(#${id}kromY)"/><rect x="${x - 12}" y="384" width="24" height="112" fill="url(#${id}kromY)"/>${vana(x, 262, id, false)}`).join('')}
 ${pompa(0, 0, 0.8, id).replace('translate(0,0)', 'translate(250,330)')}
 ${pompa(0, 0, 0.8, id).replace('translate(0,0)', 'translate(470,330)')}
 ${mano(470, 128, 34, id, 20)}
 <rect x="463" y="150" width="14" height="20" fill="url(#${id}kromY)"/>
 <!-- membranlı tank -->
 <g filter="url(#${id}gl)"><rect x="712" y="230" width="128" height="300" rx="20" fill="url(#${id}kirmizi)"/>
 <ellipse cx="776" cy="232" rx="64" ry="34" fill="#e8463a"/><ellipse cx="776" cy="226" rx="40" ry="16" fill="#ff6b5e" opacity=".6"/>
 <rect x="712" y="520" width="128" height="18" fill="#7a0f0f"/>
 <rect x="726" y="534" width="14" height="22" fill="#55606c"/><rect x="812" y="534" width="14" height="22" fill="#55606c"/>
 <rect x="740" y="340" width="72" height="44" rx="6" fill="#fff" opacity=".9"/><rect x="750" y="352" width="52" height="6" fill="#c62828"/><rect x="750" y="366" width="36" height="6" fill="#c62828" opacity=".6"/></g>
 <rect x="676" y="498" width="60" height="26" fill="url(#${id}krom)"/>
 ${etiketCiz([[776, 420, 890, 120, false], [414, 262, 250, 90, true], [470, 128, 560, 40, true], [110, 290, 20, 470, true]], o.etiketler)}`,

  // Kuyu kesiti + dalgıç pompa
  dalgic: (id, o) => `
 <rect x="0" y="0" width="900" height="150" fill="#bfe6ff"/>
 <circle cx="780" cy="60" r="34" fill="#ffd23f"/>
 <rect x="0" y="140" width="900" height="22" fill="#46a34a"/>
 ${[30, 120, 210, 600, 690, 800].map(x => `<path d="M${x} 142 l8 -18 l8 18 M${x + 14} 142 l6 -12 l6 12" fill="#2f8a35"/>`).join('')}
 <rect x="0" y="160" width="900" height="170" fill="url(#${id}toprak)"/>
 <rect x="0" y="330" width="900" height="80" fill="#8a7a6a"/>
 ${Array.from({ length: 40 }, (_, i) => `<ellipse cx="${(i * 97) % 900}" cy="${180 + (i * 53) % 220}" rx="${6 + (i % 4) * 3}" ry="${4 + (i % 3) * 2}" fill="#4a2f1a" opacity=".35"/>`).join('')}
 <rect x="0" y="410" width="900" height="230" fill="url(#${id}su)"/>
 <path d="M0 410 Q 60 398 120 410 T 240 410 T 360 410 T 480 410 T 600 410 T 720 410 T 840 410 T 960 410 V 424 H0Z" fill="#9be3ff" opacity=".7"/>
 <!-- kuyu borusu -->
 <rect x="372" y="120" width="156" height="520" fill="#d9e1e8" opacity=".55" stroke="#9aa6b2" stroke-width="5"/>
 <rect x="350" y="100" width="200" height="44" rx="8" fill="url(#${id}gri)" stroke="#8a96a3" stroke-width="3"/>
 <!-- yükselen boru ve çıkış -->
 <rect x="436" y="40" width="28" height="400" fill="url(#${id}kromY)"/>
 <rect x="436" y="40" width="200" height="26" rx="6" fill="url(#${id}krom)"/>
 ${vana(560, 54, id)}
 <path d="M640 66 q 20 30 0 60 q -14 20 6 40" stroke="#3fa7ff" stroke-width="10" fill="none" stroke-linecap="round"/>
 <!-- kablo -->
 <path d="M478 140 C 492 260 486 360 478 452" stroke="#222" stroke-width="5" fill="none"/>
 <!-- dalgıç pompa -->
 <g filter="url(#${id}gl)"><rect x="418" y="436" width="64" height="88" rx="10" fill="url(#${id}kromY)"/>
 ${[452, 470, 488, 506].map(y => `<rect x="418" y="${y}" width="64" height="5" fill="#7c8794"/>`).join('')}
 <rect x="414" y="522" width="72" height="16" fill="#3c4652"/>
 <rect x="420" y="536" width="60" height="78" rx="12" fill="url(#${id}maviY)"/>
 <rect x="428" y="610" width="44" height="14" rx="6" fill="#0b3f82"/></g>
 ${[[330, 470, 9], [560, 520, 7], [300, 580, 12], [600, 600, 6], [520, 460, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".55"/>`).join('')}
 ${etiketCiz([[450, 480, 820, 470, false], [450, 580, 120, 600, true], [560, 54, 860, 210, false], [450, 410, 100, 380, true]], o.etiketler)}`,

  // Apartman kesiti: bodrumda pompa dairesi, katlara giden su hattı
  bina: (id, o) => `
 <rect x="0" y="0" width="900" height="640" fill="#e8f4fd" opacity="0"/>
 <ellipse cx="450" cy="610" rx="420" ry="24" fill="url(#${id}golge)"/>
 <g filter="url(#${id}gl)"><rect x="170" y="40" width="460" height="440" rx="8" fill="#f5efe6" stroke="#c7b9a6" stroke-width="4"/>
 <rect x="150" y="26" width="500" height="24" rx="6" fill="#b5523b"/>
 ${[0, 1, 2, 3].map(k => [0, 1, 2].map(p => `<rect x="${210 + p * 140}" y="${80 + k * 100}" width="90" height="60" rx="6" fill="#9fd6ff" stroke="#6c8aa3" stroke-width="3"/><rect x="${253 + p * 140}" y="${80 + k * 100}" width="4" height="60" fill="#6c8aa3"/>`).join('')).join('')}
 </g>
 <!-- bodrum -->
 <rect x="150" y="480" width="500" height="120" fill="#cfd6dd" stroke="#8a96a3" stroke-width="4"/>
 <rect x="150" y="474" width="500" height="10" fill="#7d8792"/>
 <!-- yükselen hat -->
 <rect x="640" y="70" width="18" height="460" fill="#1a73d9"/>
 ${[0, 1, 2, 3].map(k => `<rect x="610" y="${110 + k * 100}" width="40" height="12" fill="#1a73d9"/><path d="M612 ${122 + k * 100} q -6 14 0 22" stroke="#3fa7ff" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="612" cy="${152 + k * 100}" r="5" fill="#3fa7ff"/>`).join('')}
 <rect x="470" y="520" width="188" height="16" fill="#1a73d9"/>
 <!-- şebeke girişi -->
 <rect x="40" y="556" width="200" height="16" fill="#1a73d9"/>
 <path d="M60 540 l30 0 l0 -12 l24 20 l-24 20 l0 -12 l-30 0z" fill="#ffd23f" stroke="#0b2a4a" stroke-width="2"/>
 <!-- depo + pompa -->
 <rect x="230" y="500" width="110" height="88" rx="10" fill="url(#${id}gri)" stroke="#8a96a3" stroke-width="3"/>
 <rect x="236" y="532" width="98" height="50" rx="6" fill="url(#${id}su)"/>
 ${pompa(0, 0, 0.42, id).replace('translate(0,0)', 'translate(370,540)')}
 <rect x="560" y="500" width="40" height="88" rx="10" fill="url(#${id}kirmizi)"/>
 ${mano(520, 512, 16, id, 25)}
 ${etiketCiz([[420, 556, 890, 600, false], [580, 520, 890, 470, false], [285, 548, 20, 440, true], [649, 160, 890, 160, false]], o.etiketler)}`,

  // Membranlı tank kesiti (hava bölümü / membran / su)
  tank: (id, o) => `
 <ellipse cx="450" cy="610" rx="250" ry="22" fill="url(#${id}golge)"/>
 <g filter="url(#${id}gl)">
 <path d="M300 150 Q300 70 450 70 Q600 70 600 150 V 520 Q600 580 450 580 Q300 580 300 520 Z" fill="url(#${id}kirmizi)"/>
 <path d="M322 160 Q322 96 450 96 Q578 96 578 160 V 512 Q578 556 450 556 Q322 556 322 512 Z" fill="#fdf1ef"/>
 <path d="M322 300 V 512 Q322 556 450 556 Q578 556 578 512 V 300 Q 520 260 450 280 Q 380 300 322 300 Z" fill="#3c4652"/>
 <path d="M336 316 V 506 Q336 540 450 540 Q564 540 564 506 V 316 Q 512 284 450 300 Q 388 316 336 316 Z" fill="url(#${id}su)"/>
 <path d="M336 340 Q 450 320 564 340" stroke="#bfefff" stroke-width="4" fill="none" opacity=".7"/>
 ${[[380, 200], [470, 170], [520, 230], [420, 240], [360, 150]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#c9d6e2"/>`).join('')}
 <text x="450" y="215" text-anchor="middle" font-size="34" font-weight="700" fill="#8a96a3" font-family="Poppins">HAVA</text>
 <text x="450" y="450" text-anchor="middle" font-size="34" font-weight="700" fill="#ffffff" font-family="Poppins">SU</text>
 <rect x="438" y="40" width="24" height="34" rx="4" fill="url(#${id}kromY)"/><rect x="432" y="30" width="36" height="14" rx="4" fill="#333"/>
 <rect x="432" y="576" width="36" height="40" fill="url(#${id}kromY)"/>
 </g>
 ${etiketCiz([[450, 38, 890, 60, false], [540, 170, 890, 200, false], [322, 300, 280, 300, false], [530, 480, 890, 470, false]], o.etiketler)}`,

  // Büyük manometre
  manometre: (id, o) => `
 <ellipse cx="450" cy="610" rx="230" ry="22" fill="url(#${id}golge)"/>
 <rect x="420" y="480" width="60" height="120" fill="url(#${id}kromY)"/>
 <rect x="380" y="560" width="140" height="44" rx="8" fill="url(#${id}krom)"/>
 <g filter="url(#${id}gl)"><circle cx="450" cy="290" r="250" fill="url(#${id}krom)" stroke="#5d6874" stroke-width="6"/>
 <circle cx="450" cy="290" r="214" fill="#ffffff"/>
 ${Array.from({ length: 41 }, (_, i) => { const a = (-225 + i * 6.75) * Math.PI / 180, r1 = i % 5 ? 188 : 172; return `<line x1="${450 + Math.cos(a) * r1}" y1="${290 + Math.sin(a) * r1}" x2="${450 + Math.cos(a) * 200}" y2="${290 + Math.sin(a) * 200}" stroke="#1f262e" stroke-width="${i % 5 ? 3 : 6}"/>`; }).join('')}
 ${[0, 2, 4, 6, 8, 10, 12, 14, 16].map((v, i) => { const a = (-225 + i * 33.75) * Math.PI / 180; return `<text x="${450 + Math.cos(a) * 140}" y="${300 + Math.sin(a) * 140}" text-anchor="middle" font-size="34" font-weight="700" fill="#1f262e" font-family="Poppins">${v}</text>`; }).join('')}
 <path d="M ${450 + Math.cos(-225 * Math.PI / 180) * 160} ${290 + Math.sin(-225 * Math.PI / 180) * 160} A 160 160 0 0 1 ${450 + Math.cos(-157 * Math.PI / 180) * 160} ${290 + Math.sin(-157 * Math.PI / 180) * 160}" stroke="#e5332a" stroke-width="14" fill="none" opacity=".85"/>
 <path d="M ${450 + Math.cos(-157 * Math.PI / 180) * 160} ${290 + Math.sin(-157 * Math.PI / 180) * 160} A 160 160 0 0 1 ${450 + Math.cos(-60 * Math.PI / 180) * 160} ${290 + Math.sin(-60 * Math.PI / 180) * 160}" stroke="#2bb673" stroke-width="14" fill="none" opacity=".85"/>
 <path d="M ${450 + Math.cos(-60 * Math.PI / 180) * 160} ${290 + Math.sin(-60 * Math.PI / 180) * 160} A 160 160 0 0 1 ${450 + Math.cos(45 * Math.PI / 180) * 160} ${290 + Math.sin(45 * Math.PI / 180) * 160}" stroke="#ffcc00" stroke-width="14" fill="none" opacity=".85"/>
 <text x="450" y="420" text-anchor="middle" font-size="40" font-weight="700" fill="#5d6874" font-family="Poppins">bar</text>
 <g transform="rotate(${o.aci ?? -40} 450 290)"><path d="M440 300 L450 110 L460 300 Z" fill="#c62828"/></g>
 <circle cx="450" cy="290" r="24" fill="#1f262e"/><circle cx="444" cy="284" r="8" fill="#5d6874"/>
 <path d="M300 150 Q 380 90 470 92" stroke="#fff" stroke-width="18" fill="none" opacity=".5" stroke-linecap="round"/></g>`,

  // Bodrum su baskını + drenaj pompası
  drenaj: (id, o) => `
 <rect x="60" y="60" width="780" height="520" fill="#d8dee4" stroke="#8a96a3" stroke-width="5"/>
 ${Array.from({ length: 6 }, (_, r) => Array.from({ length: 8 }, (_, c) => `<rect x="${64 + c * 97 + (r % 2) * 48}" y="${64 + r * 60}" width="94" height="56" fill="none" stroke="#c3ccd6" stroke-width="2"/>`).join('')).join('')}
 <path d="M60 300 L 240 300 L 240 360 L 300 360 L300 420 L 360 420 L 360 480" stroke="#9aa6b2" stroke-width="16" fill="none"/>
 <rect x="60" y="440" width="780" height="140" fill="url(#${id}su)"/>
 <path d="M60 440 Q 120 428 180 440 T 300 440 T 420 440 T 540 440 T 660 440 T 780 440 T 900 440 V 452 H60Z" fill="#9be3ff" opacity=".7"/>
 <rect x="560" y="500" width="160" height="100" fill="#55606c"/>
 <g filter="url(#${id}gl)"><rect x="596" y="470" width="88" height="110" rx="16" fill="url(#${id}maviY)"/>
 <rect x="604" y="560" width="72" height="22" rx="4" fill="#0b3f82"/>
 <circle cx="700" cy="478" r="14" fill="#ffd23f" stroke="#0b2a4a" stroke-width="3"/>
 <rect x="628" y="140" width="24" height="334" fill="url(#${id}kromY)"/></g>
 <rect x="628" y="120" width="230" height="24" rx="6" fill="url(#${id}krom)"/>
 <path d="M858 132 q 26 20 10 50" stroke="#3fa7ff" stroke-width="12" fill="none" stroke-linecap="round"/>
 ${[[200, 500, 10], [320, 530, 7], [460, 490, 8], [140, 545, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".6"/>`).join('')}
 ${etiketCiz([[640, 520, 420, 250, false], [640, 300, 420, 160, false], [858, 140, 860, 40, false]], o.etiketler)}`,

  // Servis aracı (kendi markamız)
  arac: (id, o) => `
 <rect x="0" y="520" width="900" height="120" fill="#55606c"/>
 ${[40, 220, 400, 580, 760].map(x => `<rect x="${x}" y="574" width="110" height="12" rx="6" fill="#ffd23f"/>`).join('')}
 <ellipse cx="450" cy="528" rx="380" ry="20" fill="url(#${id}golge)"/>
 <g filter="url(#${id}gl)"><path d="M90 220 Q90 180 130 180 H 560 L 680 280 H 790 Q 820 280 820 320 V 480 Q 820 500 800 500 H 110 Q 90 500 90 480 Z" fill="#ffffff" stroke="#c3ccd6" stroke-width="4"/>
 <path d="M575 196 L 665 278 H 575 Z" fill="#9fd6ff" stroke="#6c8aa3" stroke-width="3"/>
 <rect x="90" y="380" width="730" height="70" fill="url(#${id}mavi)"/>
 <text x="130" y="300" font-size="62" font-weight="700" fill="#0b3f82" font-family="Poppins">FUVSU POMPA</text>
 <text x="132" y="350" font-size="30" font-weight="600" fill="#1a73d9" font-family="Poppins">Teknik Servis · Tesisat · Montaj</text>
 <text x="130" y="428" font-size="40" font-weight="700" fill="#ffffff" font-family="Poppins">0501 042 44 57</text>
 <rect x="780" y="330" width="40" height="30" rx="6" fill="#ffd23f"/></g>
 ${[230, 680].map(x => `<circle cx="${x}" cy="500" r="56" fill="#1f262e"/><circle cx="${x}" cy="500" r="28" fill="url(#${id}krom)"/>`).join('')}`,

  // Musluk: zayıf akış vs güçlü akış (o.zayif = true)
  musluk: (id, o) => `
 <ellipse cx="450" cy="600" rx="300" ry="26" fill="url(#${id}golge)"/>
 <g filter="url(#${id}gl)"><rect x="160" y="90" width="420" height="80" rx="40" fill="url(#${id}krom)"/>
 <rect x="520" y="150" width="80" height="120" rx="20" fill="url(#${id}krom)"/>
 <rect x="530" y="250" width="60" height="40" rx="8" fill="url(#${id}kromY)"/>
 <rect x="330" y="40" width="80" height="60" rx="10" fill="url(#${id}kromY)"/>
 <rect x="250" y="20" width="240" height="34" rx="17" fill="url(#${id}krom)"/>
 <rect x="80" y="70" width="90" height="120" rx="10" fill="#e8ecf0" stroke="#c3ccd6" stroke-width="3"/></g>
 ${o.zayif ? `<path d="M560 292 q 6 40 -4 70" stroke="#3fa7ff" stroke-width="10" fill="none" stroke-linecap="round"/>${[[556, 400, 9], [560, 450, 7], [554, 505, 8]].map(([x, y, r]) => `<path d="M${x} ${y - r * 1.8} Q ${x + r} ${y} ${x} ${y + r} Q ${x - r} ${y} ${x} ${y - r * 1.8}Z" fill="#3fa7ff"/>`).join('')}`
      : `<path d="M538 290 Q 528 440 520 580 H 600 Q 592 440 582 290 Z" fill="url(#${id}su)"/><path d="M552 300 Q 548 440 544 570" stroke="#fff" stroke-width="6" opacity=".6"/>${[[470, 585, 14], [650, 580, 12], [430, 570, 8], [690, 565, 9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#5fd0ff"/>`).join('')}`}
 <path d="M300 590 Q 450 560 820 590" stroke="#9be3ff" stroke-width="8" fill="none" opacity="${o.zayif ? 0 : .8}"/>`,

  // Alet çantası
  alet: (id, o) => `
 <ellipse cx="450" cy="600" rx="340" ry="26" fill="url(#${id}golge)"/>
 <g filter="url(#${id}gl)"><path d="M330 250 V 200 Q 330 170 360 170 H 540 Q 570 170 570 200 V 250" stroke="#3c4652" stroke-width="22" fill="none"/>
 <rect x="150" y="250" width="600" height="330" rx="26" fill="#e5332a"/>
 <rect x="150" y="330" width="600" height="20" fill="#a81f19"/>
 <rect x="410" y="320" width="80" height="44" rx="8" fill="url(#${id}krom)"/></g>
 <g transform="rotate(-28 300 200)" filter="url(#${id}gl)"><rect x="170" y="180" width="300" height="34" rx="12" fill="url(#${id}krom)"/><path d="M150 160 a 46 46 0 1 0 0 92 l 30 -26 v -40 z" fill="url(#${id}krom)"/></g>
 <g transform="rotate(24 640 180)" filter="url(#${id}gl)"><rect x="540" y="168" width="250" height="28" rx="10" fill="#1a73d9"/><rect x="520" y="150" width="60" height="64" rx="8" fill="url(#${id}koyu)"/><rect x="480" y="150" width="50" height="22" fill="url(#${id}koyu)"/></g>`,

  // Kumanda panosu
  pano: (id, o) => `
 <ellipse cx="450" cy="610" rx="260" ry="22" fill="url(#${id}golge)"/>
 <g filter="url(#${id}gl)"><rect x="240" y="40" width="420" height="560" rx="20" fill="url(#${id}gri)" stroke="#8a96a3" stroke-width="5"/>
 <rect x="280" y="90" width="340" height="140" rx="12" fill="#0b2a4a"/>
 <text x="450" y="160" text-anchor="middle" font-size="64" font-weight="700" fill="#5fd0ff" font-family="Poppins">${o.ekran || '4.0 bar'}</text>
 <text x="450" y="205" text-anchor="middle" font-size="26" font-weight="600" fill="#9be3ff" font-family="Poppins">P1 ● P2 ●</text>
 ${[[320, 300, '#2bb673'], [400, 300, '#2bb673'], [480, 300, '#ffcc00'], [560, 300, '#e5332a']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="24" fill="${c}"/><circle cx="${x - 7}" cy="${y - 7}" r="7" fill="#fff" opacity=".6"/>`).join('')}
 <rect x="300" y="370" width="130" height="80" rx="14" fill="#2bb673"/><text x="365" y="422" text-anchor="middle" font-size="30" font-weight="700" fill="#fff" font-family="Poppins">START</text>
 <rect x="470" y="370" width="130" height="80" rx="14" fill="#e5332a"/><text x="535" y="422" text-anchor="middle" font-size="30" font-weight="700" fill="#fff" font-family="Poppins">STOP</text>
 <circle cx="450" cy="520" r="44" fill="#ffd23f" stroke="#333" stroke-width="4"/><rect x="440" y="486" width="20" height="68" rx="6" fill="#333"/></g>`,
};

module.exports = function (ad, o = {}) {
  const f = S[ad]; if (!f) return '';
  const id = 'z' + ad + Math.floor(Math.random() * 1e6);
  return `<svg viewBox="0 0 900 640" xmlns="http://www.w3.org/2000/svg"><defs>${D(id)}</defs>${f(id, o)}</svg>`;
};
module.exports.liste = Object.keys(S);
