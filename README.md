# 🥦 KALANLA — Kiler & Mutfak OS
### *Local-First Zero-Waste Smart Kitchen Assistant & Telemetry Engine*

<p align="center">
  <img src="assets/adaptive-icon.png" width="128" height="128" alt="KALANLA Logo" style="border-radius: 28px;" />
</p>

<p align="center">
  <a href="https://rynia.github.io/KALANLA/"><img src="https://img.shields.io/badge/Live_Showcase-rynia.github.io%2FKALANLA-10B981?style=for-the-badge&logo=githubpages&logoColor=white" alt="Live Site" /></a>
  <a href="https://play.google.com/apps/testing/com.rynia.kalanla"><img src="https://img.shields.io/badge/Google_Play-Closed_Beta-34D399?style=for-the-badge&logo=googleplay&logoColor=white" alt="Google Play Closed Beta" /></a>
  <img src="https://img.shields.io/badge/App_Store-Coming_Soon-0284C7?style=for-the-badge&logo=apple&logoColor=white" alt="App Store Coming Soon" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React_Native-Expo_57-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="Expo" />
  <img src="https://img.shields.io/badge/Architecture-Local--First-F59E0B?style=for-the-badge" alt="Local First" />
</p>

---

## 🏛️ Vizyon ve Felsefe
**KALANLA**, mutfaktaki gıda israfını sıfırlamak ve ev ekonomisini korumak için tasarlanmış bağımsız bir **Mutfak İşletim Sistemidir (Kitchen OS)**.

Mevcut yemek tarifleri uygulamalarının aksine, kullanıcıya *"markete gidip şunları satın al"* demez. Tam tersine: **"Dolabında ne kaldıysa, ondan başla"** felsefesiyle çalışır.

> *"Kimse 'güzel bir uygulama' için var olmaz. İnsanlar dolapta unuttuğu yiyeceklerin bozulmasını önlediğinde ve ay sonunda cebinde kalan gerçek parayı gördüğünde bir ürün vazgeçilmez olur."*

---

## ✨ Temel Özellikler

### ⏱️ 1. 48 Saatlik Risk Radarı (Shelf-Life Telemetry)
* Dolaptaki gıdaların son kullanma ve bozulma risklerini saatlik hassasiyetle hesaplar.
* **Acil Tüketim Rozetleri:** *"Son 18 Saat"*, *"Bugün Tüket"* alarmlarıyla çürüme eşiğindeki gıdaları en tepeye çeker.

### 🍳 2. Deterministik Sıfır-Atık Şef Motoru
* Dolaptaki malzemeleri eşleştiren yerel reçete motoru.
* İnternet bağlantısı gerektirmez; Türk mutfağının denenmiş kurtarma reçeteleriyle (fırında kaşarlı ekmek, yayla çorbası, sebzeli omlet vb.) saniyeler içinde tarif üretir.

### 🧾 3. 9:16 Termal Tasarruf Fişi (Financial Telemetry)
* Kurtarılan her gıda ile cebinizde kalan reel Türk Lirası miktarını ve karbon tasarrufunu hesaplar.
* Nostaljik termal kasa fişi formatında 9:16 oranında çıktı verir; tek dokunuşla Instagram Story veya WhatsApp'ta paylaşılabilir.

### ↩️ 4. Güvenli Geri Al Kalkanı (Undo Safety)
* Yanlışlıkla bir malzemeyi "Pişirdim" veya "Sildim" dediğinizde 5 saniyelik geri sayımlı haptik kalkan devreye girer. Yanlışlıkla veri kaybını sıfıra indirir.

### 🔒 5. %100 Local-First Gizlilik & Hesap Zorunluluğu Yok
* **Üyelik Yok:** E-posta, şifre veya sosyal medya girişi gerektirmez.
* **Sıfır Dış Veri Aktarımı:** Tüm envanter ve tercihler kullanıcının kendi cihazında (`AsyncStorage`) şifreli ve yerel tutulur.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji | Açıklama |
|:---|:---|:---|
| **Framework** | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) (SDK ~57) | Çift platform (iOS & Android) yerel performans |
| **Dil** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) | Tip güvenliği ve sıfır derleme hatası (`tsc --noEmit`) |
| **Depolama** | `@react-native-async-storage/async-storage` | Cihaz içi yerel kalıcılık (Local-First) |
| **İkonografi** | `lucide-react-native` | Hafif ve vektörel titanyum arayüz ikonları |
| **Haptics** | `expo-haptics` | Buton basışlarında gerçekçi dokunsal geri bildirim |
| **Ekran Çıktısı** | `react-native-view-shot` + `expo-sharing` | 9:16 termal fiş oluşturucu ve paylaşım motoru |
| **Dağıtım** | EAS Build (Expo Application Services) | Android App Bundle (.aab) & iOS IPA otomasyonu |

---

## 📂 Proje Dizin Yapısı

```bash
kiler-kitchen-os/
├── assets/                  # 1024x1024 Safe-Zone uyumlu simgeler & görseller
├── src/
│   ├── components/          # Modüler UI bileşenleri (Radar, Reçete, Termal Fiş)
│   ├── constants/           # Sistem sabitleri ve kopya metinleri
│   ├── data/                # Türk mutfağı gıda ontolojisi & akıllı varsayılanlar
│   ├── services/            # Yetki (entitlements) ve yerel motor servisleri
│   ├── storage/             # AsyncStorage veri doğrulama ve hydration katmanı
│   ├── theme/               # Titanyum Koyu (#0A0A0E) renk ve boşluk paleti
│   ├── types/               # TypeScript tip tanımları (models, subscription)
│   └── utils/               # Reçete motoru, zaman matematiği ve görsel çözümleyici
├── app.json                 # Apple Privacy Manifest & Android izin beyanları
├── eas.json                 # Production build profilleri
└── App.tsx                  # Ana durum yöneticisi ve sekme orkestrasyonu
```

---

## 🚀 Yerel Geliştirme (Local Setup)

Projeyi yerel makinenizde çalıştırmak için:

```bash
# 1. Repoyu klonlayın
git clone https://github.com/Rynia/KALANLA.git
cd KALANLA

# 2. Bağımlılıkları yükleyin
npm install

# 3. TypeScript tip kontrolü yapın
npx tsc --noEmit

# 4. Geliştirici sunucusunu başlatın
npx expo start
```

---

## 🗺️ Sürüm Yol Haritası (Roadmap)

* [x] **v1.0.0 (Alpha / Closed Beta):** Saf Local-First çekirdek, 48 saatlik risk radarı, kurtarma reçeteleri, termal fiş simülatörü.
* [ ] **v1.1.0:** 🧾💀 *İsraf Otopsisi* (Waste Autopsy Report), 🎴 *Dolap Falı* (Fridge Fortune), Cihaz içi ML Kit yerel fiş okuma.
* [ ] **v1.2.0:** 🥘🔥 *Kazan Başı Canlılık* (Eşzamanlı pişirenler sayacı & tencere tıkırtısı reaksiyonları).
* [ ] **v1.3.0:** Ortak Aile Dolabı (Çoklu cihaz yerel senkronizasyonu).

---

## 📄 Gizlilik Politikası & Lisans

* **Gizlilik Politikası:** [https://rynia.github.io/KALANLA/privacy.html](https://rynia.github.io/KALANLA/privacy.html)
* **Geliştirici:** [Rynia Studios](https://ryniastudios.netlify.app) (ryniastudios@gmail.com)

<p align="center">
  <b>Rynia Studios</b> © 2026 • <i>"Ne kaldıysa, ondan başla."</i>
</p>
