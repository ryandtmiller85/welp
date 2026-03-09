// ---------------------------------------------------------------------------
// Merch catalog — welp. branded swag
//
// Synced with Printify shop (12 products). Every item has a real mockup URL.
// Variant data sourced from Printify API — size IDs are Printify variant IDs.
// ---------------------------------------------------------------------------

export interface SizeVariant {
  label: string
  variantId: number
}

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
  /** Printify product ID (extracted from imageUrl for convenience) */
  printifyProductId?: string
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
  /** Available sizes for this product */
  variants: SizeVariant[]
  /** Index into variants[] for the default size (used for mockups) */
  defaultVariantIndex: number
  /** Additional product photos from Printify (different angles) */
  galleryImages?: { label: string; url: string }[]
}

// ---------------------------------------------------------------------------
// Printify variant ID reference (from API):
//
// White tees: S=12102, M=12101, L=12100, XL=12103, 2XL=12104
// Black tees: S=12126, M=12125, L=12124, XL=12127, 2XL=12128
// Crewneck (Sport Grey): S=25395, M=25426, L=25457, XL=25488, 2XL=25519
// ---------------------------------------------------------------------------

const WHITE_TEE_SIZES: SizeVariant[] = [
  { label: 'S', variantId: 12102 },
  { label: 'M', variantId: 12101 },
  { label: 'L', variantId: 12100 },
  { label: 'XL', variantId: 12103 },
  { label: '2XL', variantId: 12104 },
]

const BLACK_TEE_SIZES: SizeVariant[] = [
  { label: 'S', variantId: 12126 },
  { label: 'M', variantId: 12125 },
  { label: 'L', variantId: 12124 },
  { label: 'XL', variantId: 12127 },
  { label: '2XL', variantId: 12128 },
]

const CREWNECK_SIZES: SizeVariant[] = [
  { label: 'S', variantId: 25395 },
  { label: 'M', variantId: 25426 },
  { label: 'L', variantId: 25457 },
  { label: 'XL', variantId: 25488 },
  { label: '2XL', variantId: 25519 },
]

// ---------------------------------------------------------------------------
// Gallery image helpers — Printify mockup URLs with correct subvariant IDs
// ---------------------------------------------------------------------------

function teeGallery(productId: string, variantId: number, slug: string) {
  const base = `https://images-api.printify.com/mockup/${productId}/${variantId}`
  return [
    { label: 'Front', url: `${base}/92570/${slug}.jpg?camera_label=front` },
    { label: 'Back', url: `${base}/92571/${slug}.jpg?camera_label=back` },
    { label: 'Flat Lay', url: `${base}/102005/${slug}.jpg?camera_label=front-2` },
    { label: 'Folded', url: `${base}/102001/${slug}.jpg?camera_label=folded` },
  ]
}

function crewneckGallery(productId: string, variantId: number, slug: string) {
  const base = `https://images-api.printify.com/mockup/${productId}/${variantId}`
  return [
    { label: 'Front', url: `${base}/98502/${slug}.jpg?camera_label=front` },
    { label: 'Back', url: `${base}/98503/${slug}.jpg?camera_label=back` },
    { label: 'Folded', url: `${base}/100648/${slug}.jpg?camera_label=folded` },
    { label: 'Lifestyle', url: `${base}/98504/${slug}.jpg?camera_label=person-1` },
  ]
}

function mugGallery(productId: string, variantId: number, slug: string) {
  const base = `https://images-api.printify.com/mockup/${productId}/${variantId}`
  return [
    { label: 'Front', url: `${base}/${variantId === 71305 ? 12363 : 12360}/${slug}.jpg?camera_label=front` },
    { label: 'Left', url: `${base}/${variantId === 71305 ? 12367 : 12364}/${slug}.jpg?camera_label=left` },
    { label: 'Right', url: `${base}/${variantId === 71305 ? 12371 : 12368}/${slug}.jpg?camera_label=right` },
    { label: 'Lifestyle', url: `${base}/${variantId === 71305 ? 12375 : 12372}/${slug}.jpg?camera_label=context` },
  ]
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
    printifyProductId: '69ad0379581a48c85001c2b0',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad0379581a48c85001c2b0/12125/92570/welp-wordmark-tee-dark.jpg?camera_label=front',
    color: '#111111',
    design: { type: 'wordmark', text: 'welp.', textColor: '#ffffff' },
    badge: 'Best Seller',
    variants: BLACK_TEE_SIZES,
    defaultVariantIndex: 1, // M
    galleryImages: teeGallery('69ad0379581a48c85001c2b0', 12125, 'welp-wordmark-tee-dark'),
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
    printifyProductId: '69ad19eed9d11928ed08b72a',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad19eed9d11928ed08b72a/12101/92570/welp-wordmark-tee-white.jpg?camera_label=front',
    color: '#f8fafc',
    design: { type: 'wordmark', text: 'welp.', textColor: '#0f172a' },
    variants: WHITE_TEE_SIZES,
    defaultVariantIndex: 1, // M
    galleryImages: teeGallery('69ad19eed9d11928ed08b72a', 12101, 'welp-wordmark-tee-white'),
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
    printifyProductId: '69ad04a45ef4eca23b03ae44',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad04a45ef4eca23b03ae44/105372/102307/welp-dad-cap.jpg?camera_label=front',
    color: '#222222',
    design: {
      type: 'wordmark',
      text: 'welp.',
      textColor: '#ffffff',
      fontSize: '14px',
    },
    variants: [{ label: 'One Size', variantId: 105372 }],
    defaultVariantIndex: 0,
    galleryImages: [
      { label: 'Front', url: 'https://images-api.printify.com/mockup/69ad04a45ef4eca23b03ae44/105372/102307/welp-dad-cap.jpg?camera_label=front' },
      { label: 'Back', url: 'https://images-api.printify.com/mockup/69ad04a45ef4eca23b03ae44/105372/102724/welp-dad-cap.jpg?camera_label=back' },
      { label: 'Left', url: 'https://images-api.printify.com/mockup/69ad04a45ef4eca23b03ae44/105372/112104/welp-dad-cap.jpg?camera_label=left' },
      { label: 'Right', url: 'https://images-api.printify.com/mockup/69ad04a45ef4eca23b03ae44/105372/112107/welp-dad-cap.jpg?camera_label=right' },
    ],
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
    printifyProductId: '69ad04a94f892b151f0fcf91',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad04a94f892b151f0fcf91/71302/12360/welp-accent-mug.jpg?camera_label=front',
    color: '#ffffff',
    design: {
      type: 'wordmark',
      text: 'welp.',
      textColor: '#0f172a',
      fontSize: '24px',
    },
    variants: [{ label: '11oz', variantId: 71302 }],
    defaultVariantIndex: 0,
    galleryImages: [
      { label: 'Front', url: 'https://images-api.printify.com/mockup/69ad04a94f892b151f0fcf91/71302/12360/welp-accent-mug.jpg?camera_label=front' },
      { label: 'Left', url: 'https://images-api.printify.com/mockup/69ad04a94f892b151f0fcf91/71302/12364/welp-accent-mug.jpg?camera_label=left' },
      { label: 'Right', url: 'https://images-api.printify.com/mockup/69ad04a94f892b151f0fcf91/71302/12368/welp-accent-mug.jpg?camera_label=right' },
      { label: 'Lifestyle', url: 'https://images-api.printify.com/mockup/69ad04a94f892b151f0fcf91/71302/12372/welp-accent-mug.jpg?camera_label=context' },
    ],
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
    printifyProductId: '69ad04b12571c7daeb008ba4',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad04b12571c7daeb008ba4/70646/11317/welp-tote-bag.jpg?camera_label=front',
    color: '#d4c5a9',
    design: {
      type: 'wordmark',
      text: 'welp.',
      textColor: '#1a1a1a',
      fontSize: '22px',
    },
    variants: [{ label: 'One Size', variantId: 70646 }],
    defaultVariantIndex: 0,
    galleryImages: [
      { label: 'Front', url: 'https://images-api.printify.com/mockup/69ad04b12571c7daeb008ba4/70646/11317/welp-tote-bag.jpg?camera_label=front' },
      { label: 'Back', url: 'https://images-api.printify.com/mockup/69ad04b12571c7daeb008ba4/70646/11319/welp-tote-bag.jpg?camera_label=back' },
    ],
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
    printifyProductId: '69ad04b2a028393ce202e6c4',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad04b2a028393ce202e6c4/45750/16655/welp-sticker.jpg?camera_label=front',
    color: '#f43f5e',
    design: {
      type: 'wordmark',
      text: 'welp.',
      textColor: '#ffffff',
      fontSize: '18px',
    },
    variants: [
      { label: '3" × 3"', variantId: 45750 },
      { label: '4" × 4"', variantId: 45752 },
    ],
    defaultVariantIndex: 0,
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
    printifyProductId: '69ae058c63b683ea0d0cf4c6',
    imageUrl:
      'https://images-api.printify.com/mockup/69ae058c63b683ea0d0cf4c6/12101/92570/welp-definition-tee.jpg?camera_label=front',
    color: '#f8fafc',
    design: {
      type: 'multi-line',
      text: '**welp**\n/welp/ interjection',
      subtext: '1. an acceptance of the unavoidable.',
      textColor: '#374151',
    },
    badge: 'New',
    variants: WHITE_TEE_SIZES,
    defaultVariantIndex: 1, // M
    galleryImages: teeGallery('69ae058c63b683ea0d0cf4c6', 12101, 'welp-definition-tee'),
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
    printifyProductId: '69ad19e2b3472339850520c6',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad19e2b3472339850520c6/12125/92570/welp-time-to-start-over-tee.jpg?camera_label=front',
    color: '#111111',
    design: {
      type: 'centered-text',
      text: 'welp.',
      subtext: 'TIME TO START OVER',
      textColor: '#ffffff',
    },
    variants: BLACK_TEE_SIZES,
    defaultVariantIndex: 1, // M
    galleryImages: teeGallery('69ad19e2b3472339850520c6', 12125, 'welp-time-to-start-over-tee'),
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
    printifyProductId: '69ad0420a58961e1690168ce',
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
    variants: CREWNECK_SIZES,
    defaultVariantIndex: 2, // L (index 2 in crewneck sizes)
    galleryImages: crewneckGallery('69ad0420a58961e1690168ce', 25457, 'built-with-spite-crewneck'),
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
    printifyProductId: '69ae2583b347233985055a72',
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
    variants: [{ label: '11oz', variantId: 71305 }],
    defaultVariantIndex: 0,
    galleryImages: mugGallery('69ae2583b347233985055a72', 71305, 'everything-is-fine-mug'),
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
    printifyProductId: '69ad19d0b360648baa02132d',
    imageUrl:
      'https://images-api.printify.com/mockup/69ad19d0b360648baa02132d/12125/92570/he-kept-the-pots-tee.jpg?camera_label=front',
    color: '#111111',
    design: {
      type: 'multi-line',
      text: 'He kept\nthe pots.',
      subtext: '\u2014 welp.',
      textColor: '#fda4af',
    },
    badge: 'New',
    variants: BLACK_TEE_SIZES,
    defaultVariantIndex: 1, // M
    galleryImages: teeGallery('69ad19d0b360648baa02132d', 12125, 'he-kept-the-pots-tee'),
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
    printifyProductId: '69ae058763b683ea0d0cf4c4',
    imageUrl:
      'https://images-api.printify.com/mockup/69ae058763b683ea0d0cf4c4/12101/92570/everything-is-fine-tee.jpg?camera_label=front',
    color: '#f8fafc',
    design: {
      type: 'centered-text',
      text: 'Everything is fine.',
      subtext: '(Terms and conditions apply.)',
      textColor: '#111111',
    },
    badge: 'New',
    variants: WHITE_TEE_SIZES,
    defaultVariantIndex: 1, // M
    galleryImages: teeGallery('69ae058763b683ea0d0cf4c4', 12101, 'everything-is-fine-tee'),
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
