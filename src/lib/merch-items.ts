// ---------------------------------------------------------------------------
// Merch catalog — welp. branded swag
//
// Synced with Printify shop (12 products). Every item has a real mockup URL.
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
  /** Printify product mockup image URL */
  imageUrl?: string
  /** Hex color of the product for the mockup (fallback) */
  color: string
  /** Design details for the CSS mockup (fallback) */
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
  // —— The Essentials ————————————————————————————————————————————————————————
  {
    id: 'tee-og-black',
    title: 'welp. Wordmark Tee — Dark',
    description: '"welp." left chest. That\'s it. That\'s the shirt.',
    price: 29.99,
    comparePrice: 34.99,
    category: 'tees',
    collection: 'essentials',
    buyUrl: '#',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad19eed9d11928ed08b72a/12100/92570/welp-wordmark-tee-dark.jpg?camera_label=front',
    color: '#111111',
    design: { type: 'wordmark', text: 'welp.', textColor: '#ffffff' },
    badge: 'Best Seller',
  },
  {
    id: 'tee-og-white',
    title: 'welp. Wordmark Tee — White',
    description:
      'Same energy, brighter outlook. Black wordmark on white heavyweight cotton.',
    price: 29.99,
    comparePrice: 34.99,
    category: 'tees',
    collection: 'essentials',
    buyUrl: '#',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad0379581a48c85001c2b0/12124/92570/welp-wordmark-tee-white.jpg?camera_label=front',
    color: '#f8fafc',
    design: { type: 'wordmark', text: 'welp.', textColor: '#0f172a' },
  },
  {
    id: 'hat-dad-black',
    title: 'welp. Dad Cap',
    description:
      'Embroidered "welp." on unstructured cotton. Someone asks. You tell the story.',
    price: 26.99,
    comparePrice: 29.99,
    category: 'hats',
    collection: 'essentials',
    buyUrl: '#',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad04a45ef4eca23b03ae44/105372/102307/welp-dad-cap.jpg?camera_label=front',
    color: '#222222',
    design: {
      type: 'wordmark',
      text: 'welp.',
      textColor: '#ffffff',
      fontSize: '14px',
    },
  },
  {
    id: 'mug-accent',
    title: 'welp. Accent Mug',
    description:
      '11oz ceramic with color accent. For the "I woke up single and I\'m fine" morning coffee.',
    price: 19.99,
    comparePrice: 24.99,
    category: 'mugs',
    collection: 'essentials',
    buyUrl: '#',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad04a94f892b151f0fcf91/71302/12360/welp-accent-mug.jpg?camera_label=front',
    color: '#ffffff',
    design: {
      type: 'wordmark',
      text: 'welp.',
      textColor: '#0f172a',
      fontSize: '24px',
    },
  },
  {
    id: 'tote-carry-all',
    title: 'welp. Tote Bag',
    description:
      'Heavy-duty canvas. For groceries, gym clothes, or emotional baggage.',
    price: 18.99,
    comparePrice: 22.99,
    category: 'totes',
    collection: 'essentials',
    buyUrl: '#',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad04b12571c7daeb008ba4/70646/11317/welp-tote-bag.jpg?camera_label=front',
    color: '#d4c5a9',
    design: {
      type: 'wordmark',
      text: 'welp.',
      textColor: '#1a1a1a',
      fontSize: '22px',
    },
  },
  {
    id: 'sticker-welp',
    title: 'welp. Sticker',
    description:
      'Logo sticker. Laptop-ready, water-bottle-approved.',
    price: 4.99,
    comparePrice: 6.99,
    category: 'stickers',
    collection: 'essentials',
    buyUrl: '#',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad04b2a028393ce202e6c4/45750/16655/welp-sticker.jpg?camera_label=front',
    color: '#f43f5e',
    design: {
      type: 'wordmark',
      text: 'welp.',
      textColor: '#ffffff',
      fontSize: '18px',
    },
  },

  // —— The Statements ————————————————————————————————————————————————————————
  {
    id: 'tee-definition',
    title: 'welp. Definition Tee',
    description:
      'Dictionary-style definition: "an acceptance of the unavoidable." The intellectual\'s breakup shirt.',
    price: 31.99,
    comparePrice: 36.99,
    category: 'tees',
    collection: 'statements',
    buyUrl: '#',
    imageUrl:
      'https://images-api.printify.com/mockup/69ae058c63b683ea0d0cf4c6/12100/92570/welp-definition-tee.jpg?camera_label=front',
    color: '#f8fafc',
    design: {
      type: 'multi-line',
      text: '**welp**\n/welp/ interjection',
      subtext: '1. an acceptance of the unavoidable.',
      textColor: '#374151',
    },
    badge: 'New',
  },
  {
    id: 'tee-start-over',
    title: 'welp. Time to Start Over Tee',
    description:
      'Centered wordmark with the mission statement beneath. The manifesto, worn.',
    price: 31.99,
    comparePrice: 36.99,
    category: 'tees',
    collection: 'statements',
    buyUrl: '#',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad19e2b3472339850520c6/12124/92570/welp-time-to-start-over-tee.jpg?camera_label=front',
    color: '#111111',
    design: {
      type: 'centered-text',
      text: 'welp.',
      subtext: 'TIME TO START OVER',
      textColor: '#ffffff',
    },
  },
  {
    id: 'crew-spite',
    title: 'Built with Spite Crewneck',
    description:
      'The footer line everyone loves. Crewneck, centered chest print with a heart.',
    price: 52.99,
    comparePrice: 59.99,
    category: 'sweatshirts',
    collection: 'statements',
    buyUrl: '#',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad0420a58961e1690168ce/25457/98502/built-with-spite-crewneck.jpg?camera_label=front',
    color: '#374151',
    design: {
      type: 'centered-text',
      text: 'Built with spite and',
      subtext: '\u2764\uFE0F',
      textColor: '#d1d5db',
    },
    badge: 'Best Seller',
  },
  {
    id: 'mug-everything-fine',
    title: 'Everything is Fine Mug',
    description:
      '"Everything is fine. (Terms and conditions apply.)" White ceramic with red accent.',
    price: 21.99,
    comparePrice: 26.99,
    category: 'mugs',
    collection: 'statements',
    buyUrl: '#',
    imageUrl:
      'https://images-api.printify.com/mockup/69ae2583b347233985055a72/71305/12363/everything-is-fine-mug.jpg?camera_label=front',
    color: '#ffffff',
    design: {
      type: 'multi-line',
      text: 'Everything is fine.',
      subtext: '(Terms and conditions apply.)',
      textColor: '#111111',
    },
    badge: 'New',
  },

  // —— The Petty Collection ——————————————————————————————————————————————————
  {
    id: 'tee-kept-pots',
    title: 'He Kept the Pots Tee',
    description:
      'The Kitchen Reset tagline. Rose on black. A whole mood.',
    price: 31.99,
    comparePrice: 36.99,
    category: 'tees',
    collection: 'petty',
    buyUrl: '#',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad19d0b360648baa02132d/12124/92570/he-kept-the-pots-tee.jpg?camera_label=front',
    color: '#111111',
    design: {
      type: 'multi-line',
      text: 'He kept\nthe pots.',
      subtext: '\u2014 welp.',
      textColor: '#fda4af',
    },
    badge: 'New',
  },
  {
    id: 'tee-everything-fine',
    title: 'Everything is Fine Tee',
    description:
      '"Everything is fine." The shirt you wear when it is absolutely not fine.',
    price: 31.99,
    comparePrice: 36.99,
    category: 'tees',
    collection: 'petty',
    buyUrl: '#',
    imageUrl:
      'https://images-api.printify.com/mockup/69ae058763b683ea0d0cf4c4/12100/92570/everything-is-fine-tee.jpg?camera_label=front',
    color: '#f8fafc',
    design: {
      type: 'centered-text',
      text: 'Everything is fine.',
      subtext: '(Terms and conditions apply.)',
      textColor: '#111111',
    },
    badge: 'New',
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
  {
    id: 'statements',
    label: 'The Statements',
    description: 'Tagline-driven designs',
  },
  {
    id: 'petty',
    label: 'The Petty Collection',
    description: 'The viral ones',
  },
] as const
