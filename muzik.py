#!/usr/bin/env python3
"""Özgün (telifsiz) arka plan müziği üretir — her çalıştırmada farklı.
Kullanım: python3 muzik.py <cikti.wav> <sure_sn> [tohum] [stil]
stil: enerjik | motive | sakin | kurumsal  (boşsa tohuma göre seçilir)
Tamamen kodla sentezlenir: başka eserden örnek/parça kullanılmaz."""
import sys, numpy as np
from scipy.signal import butter, lfilter
from scipy.io import wavfile

SR = 44100
cikti, sure = sys.argv[1], float(sys.argv[2])
tohum = int(sys.argv[3]) if len(sys.argv) > 3 else np.random.randint(1, 10**6)
rng = np.random.default_rng(tohum)
STILLER = {
    'enerjik':  dict(bpm=(122, 128), dort=True,  parlak=1.0, arp=True),
    'motive':   dict(bpm=(110, 118), dort=True,  parlak=.85, arp=True),
    'sakin':    dict(bpm=(88, 96),   dort=False, parlak=.55, arp=True),
    'kurumsal': dict(bpm=(100, 108), dort=False, parlak=.7,  arp=True),
}
stil = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] in STILLER else rng.choice(list(STILLER))
S = STILLER[stil]
bpm = rng.integers(S['bpm'][0], S['bpm'][1] + 1)
beat = 60 / bpm
N = int(sure * SR) + SR
mix = np.zeros((N, 2)); mel = np.zeros((N, 2))

# Ton ve akor yürüyüşü
kok = rng.choice([45, 47, 48, 50, 52, 53, 55])          # A2..G3 (MIDI)
MAJOR = [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]]   # I V vi IV
MINOR = [[0, 3, 7], [8, 12, 15], [3, 7, 10], [10, 14, 17]]  # i VI III VII
YURUYUS = [MAJOR, MINOR, [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]], [[0, 3, 7], [5, 8, 12], [8, 12, 15], [7, 10, 14]]]
akorlar = YURUYUS[rng.integers(len(YURUYUS))] if stil != 'kurumsal' else MAJOR
hz = lambda m: 440 * 2 ** ((m - 69) / 12)

def lp(x, f, o=2):
    b, a = butter(o, min(f, SR / 2 - 100) / (SR / 2)); return lfilter(b, a, x)
def hp(x, f, o=2):
    b, a = butter(o, f / (SR / 2), 'high'); return lfilter(b, a, x)
def zarf(n, a=.005, d=.2, s=0., r=.05):
    t = np.arange(n) / SR; e = np.ones(n)
    e = np.where(t < a, t / a, np.exp(-(t - a) / max(d, 1e-3)) * (1 - s) + s)
    rn = int(r * SR)
    if rn and n > rn: e[-rn:] *= np.linspace(1, 0, rn)
    return e
def koy(sig, t, pan=0., vol=1., hedef=None):
    hedef = mix if hedef is None else hedef
    i = int(t * SR)
    if i >= N: return
    sig = sig[:N - i]
    hedef[i:i + len(sig), 0] += sig * vol * (1 - max(0, pan))
    hedef[i:i + len(sig), 1] += sig * vol * (1 + min(0, pan))
def testere(f, n, detune=(0,)):
    t = np.arange(n) / SR
    return sum(2 * ((t * f * (1 + d)) % 1) - 1 for d in detune) / len(detune)

# Davul sesleri
def kick():
    n = int(.35 * SR); t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * 1.0
def clap():
    n = int(.25 * SR); g = rng.standard_normal(n)
    e = np.zeros(n)
    for o in (0, .012, .024): e[int(o * SR):] += np.exp(-np.arange(n - int(o * SR)) / SR * 30)
    return hp(lp(g, 3500), 900) * e * .45
def hat(acik=False):
    n = int((.18 if acik else .05) * SR)
    return hp(rng.standard_normal(n), 7000) * zarf(n, .001, .09 if acik else .018) * .22
K, C, HK, HA = kick(), clap(), hat(), hat(True)

bar = 4 * beat
bar_say = int(np.ceil(sure / bar)) + 1
yan = np.ones(N)  # sidechain (kick'te pad/bas kısılır)
for b in range(bar_say):
    t0 = b * bar
    giris = b == 0
    for s in range(4):
        t = t0 + s * beat
        if t > sure - .2: break
        if not giris and (S['dort'] or s in (0, 2)):
            koy(K, t, vol=.95)
            i = int(t * SR); m = min(N - i, int(beat * .6 * SR))
            yan[i:i + m] = np.minimum(yan[i:i + m], .35 + .65 * np.linspace(0, 1, m) ** .6)
        if not giris and s in (1, 3): koy(C, t, pan=.05, vol=.8)
        for h in range(2):
            th = t + h * beat / 2 + (beat * .04 if h else 0)
            if th < sure - .2 and not giris:
                koy(HA if (h == 1 and S['dort']) else HK, th, pan=.3, vol=.7 + .3 * h)

# Pad (akorlar), bas ve arpej
for b in range(bar_say):
    t0 = b * bar; ak = akorlar[b % 4]
    n = int(bar * SR)
    pad = sum(testere(hz(kok + 12 + x), n, (-.004, 0, .005)) for x in ak) / 3
    kesim = 900 + 2600 * S['parlak'] * (min(1, (b + .5) / 2))
    pad = lp(pad, kesim) * zarf(n, .25, 9, .8, .3) * .32
    koy(pad, t0, pan=-.15, vol=1, hedef=mel); koy(pad, t0 + .012, pan=.15, vol=.8, hedef=mel)
    if b >= 1:
        for e8 in range(8):
            tb = t0 + e8 * beat / 2
            if tb > sure - .3: break
            nb = int(beat / 2 * SR * .9)
            f = hz(kok + ak[0] - 12 + (12 if e8 % 4 == 3 and stil != 'sakin' else 0))
            bas = lp(testere(f, nb, (0, .003)), 420) * zarf(nb, .004, .25, .6, .03) * .55
            koy(bas, tb, vol=1, hedef=mel)
    if S['arp'] and b >= 1:
        desen = rng.permutation([0, 1, 2, 1, 2, 0, 2, 1]) if b % 2 == 1 else desen
        adim = 16 if stil in ('enerjik', 'motive') else 8
        for k in range(adim):
            ta = t0 + k * bar / adim
            if ta > sure - .3: break
            if rng.random() < (.15 if stil != 'sakin' else .35): continue
            nota = kok + 24 + ak[desen[k % 8]] + (12 if k % 8 == 7 else 0)
            na = int(.22 * SR)
            pl = lp(testere(hz(nota), na, (0, .006)), 2800 * S['parlak'] + 600) * zarf(na, .002, .12, 0, .02) * .2
            koy(pl, ta, pan=.35 if k % 2 else -.35, hedef=mel)

# Geçiş efekti (yükselen hışırtı) ilk barın sonunda
n = int(bar * SR); g = rng.standard_normal(n)
riser = hp(g, 4000) * np.linspace(0, 1, n) ** 4 * .05
koy(riser, 0)

mix += mel * yan[:, None]  # sidechain: kick vurunca pad/bas/arpej kısılır
mix = mix[:int(sure * SR)]
# son 1.2 sn yumuşak bitiş
f = int(1.2 * SR); mix[-f:] *= np.linspace(1, 0, f)[:, None] ** 1.5
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
mix /= max(1e-6, np.abs(mix).max()) / .89
wavfile.write(cikti, SR, (mix * 32767).astype(np.int16))
print(f'muzik: stil={stil} bpm={bpm} tohum={tohum} sure={sure:.1f}s')
