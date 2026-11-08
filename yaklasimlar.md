# İçerik yaklaşımları (her gün farklılarını karıştır, art arda aynısını kullanma)
1. Arıza belirtisi sorusu (stil: soru) — "Pompa gece kendi kendine çalışıyor mu?"
2. Biliyor muydunuz? (stil: bilgi) — teknik ama anlaşılır bir bilgi
3. Sık sorulan soru + cevap (stil: sss) — "Hidrofor kaç yılda değişir?"
4. Kontrol listesi / adımlar (stil: liste) — "Pompa dairesinde 4 kontrol"
5. Hizmet tanıtımı (stil: klasik) — tesisat, montaj, dalgıç, bakım, kurumsal
6. Kısa ve vurucu slogan (stil: buyuk) — "Su kesilmeden önce bize ulaşın."
7. Bölge vurgusu — İstanbul / Kocaeli / Sakarya (ilçe isimleri ile)
8. Yöneticilere özel — apartman/site yöneticisine periyodik bakım mesajı
9. Mevsimsel/dönemsel hatırlatma (kış öncesi, yaz su tüketimi vb.)
10. Sahadan iş fotoğrafı (foto) — iş türü + ilçe
11. Mit / yanlış bilinen (stil: bilgi) — "Pompa ne kadar büyükse o kadar iyi değil"
12. Acil durum ne yapmalı (stil: liste) — "Pompa su kaçırıyorsa ilk 3 adım"
Temalar: mavi, lacivert, turkuaz, turuncu, beyaz, yesil — aynı gün içinde farklı temalar kullan.
Kurallar: fiyat yok; "ücretsiz", "garanti", "7/24" gibi doğrulanmamış vaat yok; müşteri adı/adres/telefon/plaka yok. Doğruluğundan emin olmadığın teknik bilgi yazma.

## Görsel çeşitliliği (kullanıcı isteği: her gün birbirinden farklı görseller, sınır yok)
- Kartlara "cizim" alanı ekle: hidrofor | dalgic | boru | anahtar | damla | bina | manometre | vana (özgün vektör çizimler, cizimler.js). Aynı gün aynı çizimi iki kez kullanma; çizimsiz kart da olabilir (ör. "buyuk" stil).
- Stil + tema + çizim kombinasyonunu her gün değiştir; dünkü kombinasyonları (durum.json gunler) tekrarlama.
- İş fotoğrafları: TARİH SINIRI YOK — Fotoğraflar klasöründeki tüm uygun fotoğraflar kullanılabilir (kullanilanFotolar'da olmayanlar; yeniler öncelikli). Pompa, montaj, tesisat, çalışma anı fotoğraflarının hepsi uygundur. Bu kural görev metnindeki "son 10/14 gün" sınırının yerine geçer.
- İnternetten başkasına ait fotoğraf/logo/marka görseli KULLANMA (telif). Sadece kendi iş fotoğraflarımız + bizim çizimlerimiz.

## Zengin görsel kuralları (kullanıcı isteği 08.11: "sade yazı değil, hidrofor/pompa resimleriyle zengin olsun")
- HER kartta (stil "buyuk" dahil) mutlaka bir renkli `sahne` kullan: hidrofor | dalgic | bina | tank | manometre | drenaj | arac | musluk | alet | pano (sahneler.js). Sahneyi konuya göre seç: tank/ön basınç → tank; basınç düşük/yüksek → manometre (aci: -100 düşük, 0 normal, +100 yüksek) veya musluk; kuyu/derin su → dalgic; apartman/site/yönetici → bina; su baskını/bodrum → drenaj; bakım/pompa dairesi → hidrofor veya pano; servise geliyoruz/bölge → arac; tamir/ustalık → alet.
- `etiketler` ile sahnedeki parçalara 2-4 kısa etiket yaz (ör. ["Basınç tankı","Vana","Manometre","Pano"]); etiket kısa olsun (en fazla ~16 harf).
- Yeni stiller: "infografik" (sahne + numaralı etiketler + numaralı açıklamalar; nasıl çalışır / parçalar) ve "karsilastir" (sol: sorunlu, sağ: olması gereken; ör. musluk zayif:true vs normal, manometre aci düşük vs normal).
- Her gün story'lerden en az biri infografik veya karsilastir olsun; aynı gün aynı sahneyi iki kez kullanma.
- Eski `cizim` alanı otomatik sahneye çevrilir ama yeni kartlarda `sahne` kullan.

## GERÇEKÇİ 3B GÖRSELLER (kullanıcı isteği 08.11: "daha gerçekçi resimler olsun") — ÖNCELİKLİ
- Ekipman anlatılıyorsa `gorsel` alanını kullan (3d/gorseller/ içindeki gerçekçi 3B ürün çekimleri): hidrofor-a, hidrofor-b (3 pompalı paket hidrofor + tank + pano), pompa-a, pompa-b (santrifüj pompa+motor), dikey (dikey çok kademeli pompa), tank (membranlı basınç tankı), dalgic (dalgıç pompa), drenaj (drenaj pompası + şamandıra), vana (küresel vana), manometre-dusuk / manometre-normal / manometre-yuksek.
- Etiketler 3B görselin parçalarına otomatik oturur (render.js başındaki sıra listesine bak). karsilastir'da sol/sag içinde gorsel kullan (ör. manometre-dusuk vs manometre-normal).
- Renkli çizim `sahne` sadece kesit/şema gereken konularda: bina (apartman kesiti), dalgic sahnesi (kuyu kesiti), tank sahnesi (tankın içi: hava/membran/su), drenaj sahnesi (su basmış bodrum), musluk (akış karşılaştırma), arac (servis aracı).
- Günde kartların en az yarısı 3B `gorsel` ile olsun. Aynı gün aynı görseli iki kez kullanma.
- Yeni 3B görsel gerekirse: 3d/sahne3d.js içine model ekle → `node 3d/uret.js <model> 3d/gorseller/<ad>.png <yaw> <pitch> 1400 1000 <ibre> <zoom>` (haftalık gözden geçirmede yapılabilir).
