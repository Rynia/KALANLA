export const COPY = {
  appName: 'KALANLA',
  tagline: 'Ne kaldıysa, ondan başla.',
  badge: 'KITCHEN OS',
  tabs: {
    pantry: 'Dolabım',      // Eski: 01 // GÖR
    quickAdd: 'Ekle',
    cook: 'Pişir',          // Eski: 02 // PİŞİR
    savings: 'Kazancın',    // Eski: 03 // KAZANCIN / TELEMETRİ
  },
  tabSubtitles: {
    pantry: 'DOLABIMDA NE VAR?',
    quickAdd: 'YENİ MALZEME EKLE',
    cook: 'SIFIR ZİYAN TARİFLERİ',
    savings: 'MUTFAK TASARRUFU',
  },
  radar: {
    urgentBadge: '48 SAAT',
    title: 'Öncelikli Tüket',
    all: 'Tüm Dolap',
    urgent: 'Öncelikli',
    week: 'Bu Hafta',
    fresh: 'Taze',
  },
  scanner: {
    button: 'Fotoğraftan Ekle',
    title: 'Buzdolabı Tara',
    staging: 'Bulunan Malzemeler',
  },
  actions: {
    add: 'Ekle',
    cook: 'Bu Tarifi Pişir',
    undo: 'GERİ AL',
    share: 'Fişi Paylaş',
    reset: 'Tüm Yerel Verileri Sıfırla',
  },
  notices: {
    foodSafety: 'KALANLA planlama ve hatırlatma amacıyla bilgi sunar. Gıdaların saklama koşullarını, tazeliğini ve tüketilebilirliğini kullanıcı değerlendirmelidir.',
    resetConfirmTitle: 'Tüm Veriler Sıfırlansın mı?',
    resetConfirmDesc: 'Dolabındaki tüm malzemeler, tasarruf geçmişin ve fişlerin silinecektir. Bu işlem geri alınamaz.',
  }
} as const;
