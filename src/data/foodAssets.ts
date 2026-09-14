// src/data/foodAssets.ts
// KALANLA Doğrulanmış Yerel Görsel Kaynakları
// Dış URL bağımlılığı olmadan, yerel bundle içerisinden güvenli yükleme
import { ImageSourcePropType } from 'react-native';

/**
 * Kullanıcının doğrudan assets/food/ingredients klasörüne eklediği doğrulanmış yerel görseller
 */
export const INGREDIENT_ASSETS: Record<string, ImageSourcePropType> = {
  'balik': require('../../assets/food/ingredients/balik.jpg'),
  'borulce': require('../../assets/food/ingredients/borulce.jpg'),
  'bulgur': require('../../assets/food/ingredients/bulgur.jpg'),
  'charliston': require('../../assets/food/ingredients/charliston.jpg'),
  'dana-eti': require('../../assets/food/ingredients/dana-eti.jpg'),
  'dereotu': require('../../assets/food/ingredients/dereotu.jpg'),
  'ekmek': require('../../assets/food/ingredients/ekmek.jpg'),
  'fesligen': require('../../assets/food/ingredients/fesligen.jpg'),
  'hamsi': require('../../assets/food/ingredients/hamsi.jpg'),
  'kabak': require('../../assets/food/ingredients/kabak.jpg'),
  'kefir': require('../../assets/food/ingredients/kefir.jpg'),
  'kereviz': require('../../assets/food/ingredients/kereviz.jpg'),
  'kirmizi-et': require('../../assets/food/ingredients/kirmizi-et.jpg'),
  'kiyma': require('../../assets/food/ingredients/kiyma.jpg'),
  'krema': require('../../assets/food/ingredients/krema.jpg'),
  'kuru-fasulye': require('../../assets/food/ingredients/kuru-fasulye.jpg'),
  'kuzu-eti': require('../../assets/food/ingredients/kuzu-eti.jpg'),
  'mantar': require('../../assets/food/ingredients/mantar.jpg'),
  'maydanoz': require('../../assets/food/ingredients/maydanoz.jpg'),
  'mercimek': require('../../assets/food/ingredients/mercimek.jpg'),
  'nane': require('../../assets/food/ingredients/nane.jpg'),
  'patlican': require('../../assets/food/ingredients/patlican.jpg'),
  'pide': require('../../assets/food/ingredients/pide.jpg'),
  'pirasa': require('../../assets/food/ingredients/pirasa.jpg'),
  'roka': require('../../assets/food/ingredients/roka.jpg'),
  'salam': require('../../assets/food/ingredients/salam.jpg'),
  'salca': require('../../assets/food/ingredients/salca.jpg'),
  'semizotu': require('../../assets/food/ingredients/semizotu.jpg'),
  'sivri-biber': require('../../assets/food/ingredients/sivri-biber.jpg'),
  'siyah-zeytin': require('../../assets/food/ingredients/siyah-zeytin.jpg'),
  'somon': require('../../assets/food/ingredients/somon.jpg'),
  'sosis': require('../../assets/food/ingredients/sosis.jpg'),
  'sucuk': require('../../assets/food/ingredients/sucuk.jpg'),
  'suzme-yogurt': require('../../assets/food/ingredients/suzme-yogurt.jpg'),
  'tarhana': require('../../assets/food/ingredients/tarhana.jpg'),
  'tere': require('../../assets/food/ingredients/tere.jpg'),
  'turp': require('../../assets/food/ingredients/turp.jpg'),
  'yesil-zeytin': require('../../assets/food/ingredients/yesil-zeytin.jpg'),
  'yufka': require('../../assets/food/ingredients/yufka.jpg'),
};

/**
 * Kullanıcının doğrudan assets/food/recipes klasörüne eklediği doğrulanmış yerel tarif görselleri
 */
export const RECIPE_ASSETS: Record<string, ImageSourcePropType> = {
  'recipe-et-1': require('../../assets/food/recipes/tava-kavurmasi.jpg'),
  'recipe-tavuk-1': require('../../assets/food/recipes/tavuk-sote.jpg'),
  'recipe-patates-1': require('../../assets/food/recipes/citir-patates.jpg'),
  'recipe-patates-2': require('../../assets/food/recipes/patates-corbasi.jpg'),
  'recipe-sebze-1': require('../../assets/food/recipes/sebze-sote.jpg'),
  'recipe-kuskonmaz-1': require('../../assets/food/recipes/zeytinyagli-kuskonmaz.jpg'),
  'recipe-mantar-1': require('../../assets/food/recipes/mantar-sote.jpg'),
  'recipe-menemen-1': require('../../assets/food/recipes/menemen.jpg'),
  'recipe-yogurt-1': require('../../assets/food/recipes/cacik.jpg'),
  'recipe-1': require('../../assets/food/recipes/kasarli-ekmek.jpg'),
  'recipe-3': require('../../assets/food/recipes/ekmek-mantisi.jpg'),
  'recipe-makarna-1': require('../../assets/food/recipes/domatesli-makarna.jpg'),
  'recipe-un-pisi-1': require('../../assets/food/recipes/pisi.jpg'),
  'recipe-un-kasik-1': require('../../assets/food/recipes/kasik-dokmesi.jpg'),
  'recipe-un-krep-1': require('../../assets/food/recipes/kasik-dokmesi.jpg'), // Klasik akıtma / kaşık dökmesi krep sunumu
  'recipe-un-corba-1': require('../../assets/food/recipes/un-corbasi.jpg'),
  'recipe-yufka-borek-1': require('../../assets/food/recipes/su-boregi.jpg'),
  'recipe-sebze-mucver-1': require('../../assets/food/recipes/mucver.jpg'),
  'recipe-bulgur-mercimek-1': require('../../assets/food/recipes/mercimek-koftesi.jpg'),
  'recipe-tarhana-1': require('../../assets/food/recipes/tarhana-corbasi.jpg'),
  'recipe-gozleme-1': require('../../assets/food/recipes/gozleme.jpg'),
  'recipe-bulgur-pilav-1': require('../../assets/food/recipes/bulgur-pilavi.jpg'),
  'recipe-ispanak-yumurta-1': require('../../assets/food/recipes/yumurtali-ispanak.jpg'),
  'recipe-patates-borek-1': require('../../assets/food/recipes/patates-boregi.jpg'),
};
