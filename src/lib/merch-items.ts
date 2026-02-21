// ---------------------------------------------------------------------------
// Merch catalog – welp. branded swag
//
// Each item has a `buyUrl` placeholder. Replace with real store links once
// you've set up a print-on-demand provider (Printful, Printify, Spring, etc.)
// ---------------------------------------------------------------------------

export interface MerchItem {
  id: string
  title: string
  description: string
  price: number
  comparePrice?: number
  category: 'tees' | 'sweatshirts' | 'hats' | 'mugs' | 'totes' | 'stickers'
  collection: 'essentials' | 'statements' | 'petty'
  buyUrl: string
  /** Hex color of the product for the mockup */
  color: string
  /** Design details for the CSS mockup */
  design: {
    type: 'wordmark' | 'centered-text' | 'multi-line'
    text: string
    subtext?: string
    textColor: string
    fontSize?: string
  }
  badge?: 'Best Seller' | 'New' | 'Limited'
}

export const MERCH_ITEMS: MerchItem[] = [
  // ── The Essentials ────────────────────────────────────────────────────────
  {
    id: 'tee-og-black',
    title: 'The OG — Black Tee',
    description: '"welp." left chest. That\'s it. That\'s the shirt.',
    price: 29.99,
    comparePrice: 34.99,
    category: 'tees',
    collection: 'essentials',
    buyUrl: '#',
    color: '#111111',
    design: { type: 'wordmark', text: 'welp.', textColor: '#ffffff' },
    badge: 'Best Seller',
  },
  {
    id: 'tee-og-white',
    title: 'The OG — White Tee',
    description: 'Same energy, brighter outlook. Black wordmark on white heavyweight cotton.',
    price: 29.99,
    comparePrice: 34.99,
    category: 'tees',
    collection: 'essentials',
    buyUrl: '#',
    color: '#f8fafc',
    design: { type: 'wordmark', text: 'welp.', textColor: '#0f172a' },
  },
  {
    id: 'crew-couch-black',
    title: 'The Couch Companion — Black',
    description: 'Oversized, fleece-lined, made for the healing era. The hero piece.',
    price: 52.99,
    comparePrice: 59.99,
    category: 'sweatshirts',
    collection: 'essentials',
    buyUrl: '#',
    color: '#1c1c1c',
    design: { type: 'wordmark', text: 'welp.', textColor: '#ffffff' },
    badge: 'Best Seller',
  },
  {
    id: 'hat-dad-black',
    title: 'The Conversation Starter — Black',
    description: 'Embroidered "welp." on unstructured cotton. Someone asks. You tell the story.',
    price: 26.99,
    comparePrice: 29.99,
    category: 'hats',
    collection: 'essentials',
    buyUrl: '#',
    color: '#222222',
    design: { type: 'wordmark', text: 'welp.', textColor: '#ffffff', fontSize: '14px' },
  },
  {
    id: 'mug-morning-white',
    title: 'The Morning Mood — White',
    description: '11oz ceramic. For the "I woke up single and I\'m fine" morning coffee.',
    price: 19.99,
    comparePrice: 24.99,
    category: 'mugs',
    collection: 'essentials',
    buyUrl: '#',
    color: '#ffffff',
    design: { type: 'wordmark', text: 'welp.', textColor: '#0f172a', fontSize: '24px' },
  },
  {
    id: 'tote-carry-all',
    title: 'The Carry-All',
    description: 'Heavy-duty natural canvas. For groceries, gym clothes, or emotional baggage.',
    price: 18.99,
    comparePrice: 22.99,
    category: 'totes',
    collection: 'essentials',
    buyUrl: '#',
    color: '#d4c5a9',
    design: { type: 'wordmark', text: 'welp.', textColor: '#1a1a1a', fontSize: '22px' },
  },

  // ── The Statements ────────────────────────────────────────────────────────
  {
    id: 'tee-start-over',
    title: '"Time to Start Over" Tee',
    description: 'Centered wordmark with the mission statement beneath. The manifesto, worn.',
    price: 31.99,
    comparePrice: 36.99,
    category: 'tees',
    collection: 'statements',
    buyUrl: '#',
    color: '#111111',
    design: {
      type: 'centered-text',
      text: 'welp.',
      subtext: 'TIME TO START OVER',
      textColor: '#ffffff',
    },
    badge: 'New',
  },
  {
    id: 'crew-spite',
    title: '"Built with Spite and ❤️" Crewneck',
    description: 'The footer line everyone loves. Charcoal crewneck, centered chest print.',
    price: 52.99,
    comparePrice: 59.99,
    category: 'sweatshirts',
    collection: 'statements',
    buyUrl: '#',
    color: '#374151',
    design: {
      type: 'centered-text',
      text: 'Built with spite and',
      subtext: '❤️',
      textColor: '#d1d5db',
    },
  },
  {
    id: 'mug-still-here',
    title: '"Still Here. Still Good." Mug — Matte Black',
    description: 'Matte black ceramic. "welp." up top, affirmation below.',
    price: 21.99,
    comparePrice: 26.99,
    category: 'mugs',
    collection: 'statements',
    buyUrl: '#',
    color: '#111111',
    design: {
      type: 'multi-line',
      text: 'welp.',
      subtext: 'still here. still good.',
      textColor: '#ffffff',
    },
  },

  // ── The Petty Collection ──────────────────────────────────────────────────
  {
    id: 'tee-kept-pots',
    title: '"He Kept the Pots." Tee',
    description: 'The Kitchen Reset tagline. Rose gold on black. A whole mood.',
    price: 31.99,
    comparePrice: 36.99,
    category: 'tees',
    collection: 'petty',
    buyUrl: '#',
    color: '#111111',
    design: {
      type: 'multi-line',
      text: 'He kept\nthe pots.',
      subtext: '— welp.',
      textColor: '#fda4af',
    },
    badge: 'New',
  },
  {
    id: 'crew-funded-blush',
    title: '"Funded by My Friends" Crewneck — Blush',
    description: 'Because when your friends literally buy you a new life, you wear the receipt.',
    price: 52.99,
    comparePrice: 59.99,
    category: 'sweatshirts',
    collection: 'petty',
    buyUrl: '#',
    color: '#ffe4e6',
    design: {
      type: 'multi-line',
      text: 'This sweatshirt\nwas funded by\nmy friends.',
      subtext: 'welp.',
      textColor: '#9f1239',
    },
  },
  {
    id: 'tee-main-character',
    title: '"Main Character Energy" Tee — White',
    description: 'All caps, spaced out, very much "I\'m the protagonist now."',
    price: 31.99,
    comparePrice: 36.99,
    category: 'tees',
    collection: 'petty',
    buyUrl: '#',
    color: '#f8fafc',
    design: {
      type: 'centered-text',
      text: 'MAIN CHARACTER',
      subtext: 'ENERGY ✦ SINCE 2026',
      textColor: '#0f172a',
    },
  },
  {
    id: 'hat-dad-rose',
    title: 'The Conversation Starter — Rose',
    description: 'Embroidered "welp." on dusty rose unstructured cotton.',
    price: 26.99,
    comparePrice: 29.99,
    category: 'hats',
    collection: 'petty',
    buyUrl: '#',
    color: '#be123c',
    design: { type: 'wordmark', text: 'welp.', textColor: '#ffffff', fontSize: '14px' },
  },
  {
    id: 'sticker-pack',
    title: 'welp. Sticker Pack — 8 Stickers',
    description: 'Logo, taglines, badges. Laptop-ready, water-bottle-approved.',
    price: 9.99,
    comparePrice: 14.99,
    category: 'stickers',
    collection: 'essentials',
    buyUrl: '#',
    color: '#f43f5e',
    design: { type: 'wordmark', text: 'welp.', textColor: '#ffffff', fontSize: '18px' },
  },
]

export const MERCH_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'tees', label: 'Tees' },
  { id: 'sweatshirts', label: 'Sweatshirts' },
  { id: 'hats', label: 'Hats' },
  { id: 'mugs', label: 'Mugs' },
  { id: 'totes', label: 'Totes' },
  { id: 'stickers', label: 'Stickers' },
] as const

export const MERCH_COLLECTIONS = [
  { id: 'all', label: 'All', description: 'The full catalog' },
  { id: 'essentials', label: 'The Essentials', description: 'Clean logo pieces' },
  { id: 'statements', label: 'The Statements', description: 'Tagline-driven designs' },
  { id: 'petty', label: 'The Petty Collection', description: 'The viral ones' },
] as const
