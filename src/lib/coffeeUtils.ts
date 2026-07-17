import { canonicalizeCountry } from '@/lib/coffeeReferenceI18n';

// ─── Country → Emoji Flag ────────────────────────────────────────────────────
const COUNTRY_CODES: Record<string, string> = {
  'ethiopia': 'ET', 'colombia': 'CO', 'brazil': 'BR', 'kenya': 'KE',
  'guatemala': 'GT', 'costa rica': 'CR', 'panama': 'PA', 'yemen': 'YE',
  'peru': 'PE', 'indonesia': 'ID', 'rwanda': 'RW', 'burundi': 'BI',
  'honduras': 'HN', 'el salvador': 'SV', 'mexico': 'MX', 'nicaragua': 'NI',
  'bolivia': 'BO', 'tanzania': 'TZ', 'uganda': 'UG', 'vietnam': 'VN',
  'myanmar': 'MM', 'india': 'IN', 'china': 'CN', 'japan': 'JP',
  'jamaica': 'JM', 'hawaii': 'US', 'united states': 'US', 'ecuador': 'EC',
  'thailand': 'TH', 'laos': 'LA', 'cambodia': 'KH', 'timor-leste': 'TL',
  'congo': 'CD', 'cameroon': 'CM', 'zimbabwe': 'ZW', 'malawi': 'MW',
  'zambia': 'ZM', 'papua new guinea': 'PG', 'dr congo': 'CD',
  'dominican republic': 'DO', 'puerto rico': 'PR', 'philippines': 'PH',
};

export function countryToFlag(country: string): string {
  if (!country) return '';
  const code = COUNTRY_CODES[canonicalizeCountry(country).toLowerCase().trim()];
  if (!code) return '';
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6))
    .join('');
}

// ─── Curated Unsplash Coffee Photos ──────────────────────────────────────────
export const CURATED_PHOTOS = [
  '1495474472287-4d71bcdd2085', // overhead latte art
  '1509042239860-f550ce710b93', // espresso shot close
  '1497935586351-b67a49e012bf', // pour over V60
  '1461023058943-07fcbe16d735', // coffee beans golden
  '1514432324607-a09d9b4aefdd', // latte art swirl
  '1511920170033-f8396924c348', // dark coffee mug
  '1442512595331-e89e73853f31', // morning coffee light
  '1521302200778-33500795e128', // dark espresso moody
  '1485808191679-5f86510bd9d4', // coffee beans macro
  '1501339847302-ac426a4a7cbb', // flat white top
  '1517701604399-3d515b5776ce', // chemex pour over
  '1506619290793-a8ac09c61a39', // aeropress close
];

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getCardPhoto(tastingId: string): string {
  const idx = simpleHash(tastingId) % CURATED_PHOTOS.length;
  return `https://images.unsplash.com/photo-${CURATED_PHOTOS[idx]}?auto=format&fit=crop&w=480&q=75`;
}

// ─── Flavor Wheel ─────────────────────────────────────────────────────────────
export const FLAVOR_WHEEL: Record<string, string[]> = {
  Floral:      ['Jasmine', 'Rose', 'Lavender', 'Elderflower', 'Orange Blossom', 'Chamomile'],
  Fruity:      ['Blueberry', 'Strawberry', 'Cherry', 'Peach', 'Apricot', 'Mango', 'Pineapple', 'Passionfruit', 'Lemon', 'Orange', 'Lime', 'Grapefruit'],
  Sweet:       ['Caramel', 'Honey', 'Toffee', 'Brown Sugar', 'Vanilla', 'Maple', 'Molasses'],
  Chocolatey:  ['Dark Chocolate', 'Milk Chocolate', 'Cocoa', 'Bittersweet'],
  Nutty:       ['Hazelnut', 'Almond', 'Walnut', 'Peanut Butter', 'Macadamia'],
  Spice:       ['Cinnamon', 'Clove', 'Black Pepper', 'Cardamom', 'Star Anise'],
  Earthy:      ['Cedar', 'Oak', 'Tobacco', 'Leather', 'Mushroom'],
  Herbal:      ['Black Tea', 'Green Tea', 'Bergamot', 'Mint', 'Basil'],
};

// ─── Flavor Chip Colors ───────────────────────────────────────────────────────
const CHIP_PALETTES = [
  { bg: 'bg-rose-950/70',    text: 'text-rose-300',    ring: 'ring-rose-800/40'    },
  { bg: 'bg-amber-950/70',   text: 'text-amber-300',   ring: 'ring-amber-800/40'   },
  { bg: 'bg-violet-950/70',  text: 'text-violet-300',  ring: 'ring-violet-800/40'  },
  { bg: 'bg-emerald-950/70', text: 'text-emerald-300', ring: 'ring-emerald-800/40' },
  { bg: 'bg-orange-950/70',  text: 'text-orange-300',  ring: 'ring-orange-800/40'  },
  { bg: 'bg-sky-950/70',     text: 'text-sky-300',     ring: 'ring-sky-800/40'     },
  { bg: 'bg-pink-950/70',    text: 'text-pink-300',    ring: 'ring-pink-800/40'    },
  { bg: 'bg-teal-950/70',    text: 'text-teal-300',    ring: 'ring-teal-800/40'    },
];

export function flavorChipStyle(word: string) {
  return CHIP_PALETTES[simpleHash(word) % CHIP_PALETTES.length];
}

export function parseFlavorDescriptors(flavor: string): string[] {
  if (!flavor) return [];
  return flavor
    .split(/[,;\/]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}

// ─── Brewing Method Icon Key ──────────────────────────────────────────────────
export type BrewIcon =
  | 'pourover' | 'espresso' | 'aeropress' | 'frenchpress'
  | 'coldbrew' | 'chemex' | 'moka' | 'default';

export function getBrewIcon(method: string): BrewIcon {
  const m = method.toLowerCase();
  if (m.includes('v60') || m.includes('pour') || m.includes('drip') || m.includes('kalita'))
    return 'pourover';
  if (m.includes('espresso') || m.includes('ristretto') || m.includes('lungo'))
    return 'espresso';
  if (m.includes('aero'))
    return 'aeropress';
  if (m.includes('french') || m.includes('press'))
    return 'frenchpress';
  if (m.includes('cold'))
    return 'coldbrew';
  if (m.includes('chemex') || m.includes('batch') || m.includes('siphon') || m.includes('filter'))
    return 'chemex';
  if (m.includes('moka'))
    return 'moka';
  return 'default';
}
