// ---------------------------------------------------------------------------
// Printify product mapping for welp. merch
//
// Maps our merch catalog item IDs â Printify product + variant IDs.
// After creating products in Printify, fill in the product_id and variant_id
// for each entry. The variant_id is the default size/color to fulfill.
//
// Shop ID: 26575604
// ---------------------------------------------------------------------------

export const PRINTIFY_SHOP_ID = 26575604

export interface PrintifyProductMapping {
  /** Our internal merch item ID (matches merch-items.ts) */
  merchItemId: string
  /** Printify product ID (filled in after creating in Printify) */
  printifyProductId: string | null
  /** Default variant ID to use for orders */
  defaultVariantId: number | null
  /** Human-readable note about the product */
  note: string
  /** Design filename used */
  designFile: string
}

/**
 * Product mapping table.
 * After creating each product in Printify, update the printifyProductId
 * and defaultVariantId fields.
 */
export const PRINTIFY_PRODUCTS: PrintifyProductMapping[] = [
  // ââ The Essentials ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
    merchItemId: 'crew-couch-black',
    printifyProductId: '69ad0420a58961e1690168ce',
    defaultVariantId: 25428, // Black / M (shares product with crew-spite for now)
    note: 'Couch Companion crewneck, black (white text)',
    designFile: 'welp_wordmark_white.png',
  },
  {
    merchItemId: 'hat-dad-black',
    printifyProductId: '69ad04a45ef4eca23b03ae44',
    defaultVariantId: 105372, // Black / One size
    note: 'Dad hat, black (white embroidered welp.)',
    designFile: 'hat_welp_white.png',
  },
  {
    merchItemId: 'mug-morning-white',
    printifyProductId: '69ad04a94f892b151f0fcf91',
    defaultVariantId: 71302, // 11oz / Blue accent
    note: 'Morning Mood 11oz accent mug (dark text)',
    designFile: 'mug_welp_dark.png',
  },
  {
    merchItemId: 'tote-carry-all',
    printifyProductId: '69ad04b12571c7daeb008ba4',
    defaultVariantId: 70646, // One size / Cream
    note: 'Carry-All cotton tote (dark text)',
    designFile: 'tote_welp_dark.png',
  },

  // ââ The Statements ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    merchItemId: 'tee-start-over',
    printifyProductId: '69ad19e2b3472339850520c6',
    defaultVariantId: 12125, // Black / M
    note: 'Time to Start Over tee, black (white text)',
    designFile: 'tee_start_over.png',
  },
  {
    merchItemId: 'crew-spite',
    printifyProductId: '69ad0420a58961e1690168ce',
    defaultVariantId: 25426, // Sport Grey / M
    note: 'Built with Spite crewneck, sport grey (light gray text)',
    designFile: 'crew_spite.png',
  },
  {
    merchItemId: 'mug-still-here',
    printifyProductId: '69ad04ad8c8b40ac4a0c3d48',
    defaultVariantId: 71304, // 11oz / Pink accent
    note: 'Still Here Still Good accent mug (white text)',
    designFile: 'mug_still_here.png',
  },

  // ââ The Petty Collection ââââââââââââââââââââââââââââââââââââââââââââââââ
  {
    merchItemId: 'tee-kept-pots',
    printifyProductId: '69ad19d0b360648baa02132d',
    defaultVariantId: 12125, // Black / M
    note: 'He Kept the Pots tee, black (rose gold text)',
    designFile: 'tee_kept_pots.png',
  },
  {
    merchItemId: 'crew-funded-blush',
    printifyProductId: '69ad0424295a70101209a39c',
    defaultVariantId: 25428, // Black / M
    note: 'Funded by Friends crewneck, black (dark rose text)',
    designFile: 'crew_funded.png',
  },
  {
    merchItemId: 'tee-main-character',
    printifyProductId: '69ad19fa2571c7daeb009097',
    defaultVariantId: 12101, // White / M
    note: 'Main Character Energy tee, white (dark text)',
    designFile: 'tee_main_character.png',
  },
  {
    merchItemId: 'hat-dad-rose',
    printifyProductId: '69ad04a45ef4eca23b03ae44',
    defaultVariantId: 105372, // Black / One size (same hat product, rose TBD)
    note: 'Dad hat, black (white embroidered welp.)',
    designFile: 'hat_welp_white.png',
  },
  {
    merchItemId: 'sticker-pack',
    printifyProductId: '69ad04b2a028393ce202e6c4',
    defaultVariantId: 45750, // 3" Ã 3" / White
    note: 'welp. rose kiss-cut sticker',
    designFile: 'sticker_welp_rose.png',
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
