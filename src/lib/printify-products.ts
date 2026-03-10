// ---------------------------------------------------------------------------
// Printify product mapping for welp. merch
//
// Maps our merch catalog item IDs â Printify product + variant IDs.
// All 12 products are live in Printify with working mockup images.
//
// Shop ID: 26575604
// ---------------------------------------------------------------------------

export const PRINTIFY_SHOP_ID = 26575604

export interface PrintifyProductMapping {
  /** Our internal merch item ID (matches merch-items.ts) */
  merchItemId: string
  /** Printify product ID */
  printifyProductId: string | null
  /** Default variant ID to use for orders */
  defaultVariantId: number | null
  /** Human-readable note about the product */
  note: string
  /** Design filename used */
  designFile: string
}

/**
 * Product mapping table â 12 products synced with Printify.
 */
export const PRINTIFY_PRODUCTS: PrintifyProductMapping[] = [
  // ââ The Essentials ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    merchItemId: 'tee-og-black',
    printifyProductId: '69ad0379581a48c85001c2b0',
    defaultVariantId: 12125, // Black / M
    note: 'OG welp. wordmark on black tee (white text)',
    designFile: 'welp_wordmark_white.png',
  },
  {
    merchItemId: 'tee-og-white',
    printifyProductId: '69ad19eed9d11928ed08b72a',
    defaultVariantId: 12101, // White / M
    note: 'OG welp. wordmark on white tee (dark text)',
    designFile: 'welp_wordmark_dark.png',
  },
  {
    merchItemId: 'hat-dad-black',
    printifyProductId: '69ad04a45ef4eca23b03ae44',
    defaultVariantId: 105372, // Black / One size
    note: 'Dad hat, black (white embroidered welp.)',
    designFile: 'hat_welp_white.png',
  },
  {
    merchItemId: 'mug-accent',
    printifyProductId: '69ad04a94f892b151f0fcf91',
    defaultVariantId: 71302, // 11oz / Blue accent
    note: 'welp. Accent Mug 11oz (dark text)',
    designFile: 'mug_welp_dark.png',
  },
  {
    merchItemId: 'tote-carry-all',
    printifyProductId: '69ad04b12571c7daeb008ba4',
    defaultVariantId: 70646, // One size / Cream
    note: 'Carry-All cotton tote (dark text)',
    designFile: 'tote_welp_dark.png',
  },
  {
    merchItemId: 'sticker-welp',
    printifyProductId: '69ad04b2a028393ce202e6c4',
    defaultVariantId: 45750, // 3" Ã 3" / White
    note: 'welp. kiss-cut sticker',
    designFile: 'sticker_welp_rose.png',
  },

  // ââ The Statements ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    merchItemId: 'tee-definition',
    printifyProductId: '69ae058c63b683ea0d0cf4c6',
    defaultVariantId: 12100, // White / M
    note: 'welp. Definition Tee (dictionary-style on white)',
    designFile: 'tee_definition.png',
  },
  {
    merchItemId: 'tee-start-over',
    printifyProductId: '69ad19e2b3472339850520c6',
    defaultVariantId: 12124, // Black / M
    note: 'Time to Start Over tee, black (white text)',
    designFile: 'tee_start_over.png',
  },
  {
    merchItemId: 'crew-spite',
    printifyProductId: '69ad0420a58961e1690168ce',
    defaultVariantId: 25457, // Sport Grey / M
    note: 'Built with Spite crewneck, sport grey',
    designFile: 'crew_spite.png',
  },
  {
    merchItemId: 'mug-everything-fine',
    printifyProductId: '69ae2583b347233985055a72',
    defaultVariantId: 71305, // 11oz / Red accent
    note: 'Everything is Fine accent mug (red accent)',
    designFile: 'mug_everything_fine.png',
  },
  {
    merchItemId: 'tote-definition',
    printifyProductId: '69ae5866d9d11928ed08faa6',
    defaultVariantId: 70646, // Natural (Cream) / One size
    note: 'welp. Definition Tote, cream + black variants',
    designFile: 'tote_definition.png',
  },

  // ââ The Petty Collection ââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    merchItemId: 'tee-kept-pots',
    printifyProductId: '69ad19d0b360648baa02132d',
    defaultVariantId: 12124, // Black / M
    note: 'He Kept the Pots tee, black (rose gold text)',
    designFile: 'tee_kept_pots.png',
  },
  {
    merchItemId: 'tee-everything-fine',
    printifyProductId: '69ae058763b683ea0d0cf4c4',
    defaultVariantId: 12100, // White / M
    note: 'Everything is Fine tee, white (dark text)',
    designFile: 'tee_everything_fine.png',
  },
]

/** Look up the Printify mapping for a merch item */
export function getPrintifyMapping(
  merchItemId: string
): PrintifyProductMapping | undefined {
  return PRINTIFY_PRODUCTS.find((p) => p.merchItemId === merchItemId)
}

/** Check if all products have been created in Printify */
export function allProductsMapped(): boolean {
  return PRINTIFY_PRODUCTS.every(
    (p) => p.printifyProductId !== null && p.defaultVariantId !== null
  )
}

/** Get all unmapped products */
export function getUnmappedProducts(): PrintifyProductMapping[] {
  return PRINTIFY_PRODUCTS.filter(
    (p) => p.printifyProductId === null || p.defaultVariantId === null
  )
}
