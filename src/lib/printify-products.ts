export const PRINTIFY_SHOP_ID = 26575604

export interface PrintifyProductMapping {
  merchItemId: string
  printifyProductId: string | null
  defaultVariantId: number | null
  note: string
  designFile: string
}

export const PRINTIFY_PRODUCTS: PrintifyProductMapping[] = [
  {
    merchItemId: 'tee-og-black',
    printifyProductId: null,
    defaultVariantId: null,
    note: 'OG welp. wordmark on black tee (white text)',
    designFile: 'welp_wordmark_white.png',
  },
  {
    merchItemId: 'tee-og-white',
    printifyProductId: null,
    defaultVariantId: null,
    note: 'OG welp. wordmark on white tee (dark text)',
    designFile: 'welp_wordmark_dark.png',
  },
  {
    merchItemId: 'crew-couch-black',
    printifyProductId: null,
    defaultVariantId: null,
    note: 'Couch Companion crewneck, black (white text)',
    designFile: 'welp_wordmark_white.png',
  },
  {
    merchItemId: 'hat-dad-black',
    printifyProductId: null,
    defaultVariantId: null,
    note: 'Dad hat, black (white embroidered welp.)',
    designFile: 'hat_welp_white.png',
  },
  {
    merchItemId: 'mug-morning-white',
    printifyProductId: null,
    defaultVariantId: null,
    note: 'Morning Mood 11oz white mug (dark text)',
    designFile: 'mug_welp_dark.png',
  },
  {
    merchItemId: 'tote-carry-all',
    printifyProductId: null,
    defaultVariantId: null,
    note: 'Carry-All natural canvas tote (dark text)',
    designFile: 'tote_welp_dark.png',
  },
  {
    merchItemId: 'tee-start-over',
    printifyProductId: null,
    defaultVariantId: null,
    note: 'Time to Start Over tee, black (white text)',
    designFile: 'tee_start_over.png',
  },
  {
    merchItemId: 'crew-spite',
    printifyProductId: null,
    defaultVariantId: null,
    note: 'Built with Spite crewneck, charcoal (light gray text)',
    designFile: 'crew_spite.png',
  },
  {
    merchItemId: 'mug-still-here',
    printifyProductId: null,
    defaultVariantId: null,
    note: 'Still Here Still Good matte black mug (white text)',
    designFile: 'mug_still_here.png',
  },
  {
    merchItemId: 'tee-kept-pots',
    printifyProductId: null,
    defaultVariantId: null,
    note: 'He Kept the Pots tee, black (rose gold text)',
    designFile: 'tee_kept_pots.png',
  },
  {
    merchItemId: 'crew-funded-blush',
    printifyProductId: null,
    defaultVariantId: null,
    note: 'Funded by Friends crewneck, blush (dark rose text)',
    designFile: 'crew_funded.png',
  },
  {
    merchItemId: 'tee-main-character',
    printifyProductId: null,
    defaultVariantId: null,
    note: 'Main Character Energy tee, white (dark text)',
    designFile: 'tee_main_character.png',
  },
  {
    merchItemId: 'hat-dad-rose',
    printifyProductId: null,
    defaultVariantId: null,
    note: 'Dad hat, rose (white embroidered welp.)',
    designFile: 'hat_welp_white.png',
  },
  {
    merchItemId: 'sticker-pack',
    printifyProductId: null,
    defaultVariantId: null,
    note: 'Sticker pack 8-count (welp. rose is the featured sticker)',
    designFile: 'sticker_welp_rose.png',
  },
]

export function getPrintifyMapping(merchItemId: string): PrintifyProductMapping | undefined {
  return PRINTIFY_PRODUCTS.find((p) => p.merchItemId === merchItemId)
}

export function allProductsMapped(): boolean {
  return PRINTIFY_PRODUCTS.every(
    (p) => p.printifyProductId !== null && p.defaultVariantId !== null
  )
}

export function getUnmappedProducts(): PrintifyProductMapping[] {
  return PRINTIFY_PRODUCTS.filter(
    (p) => p.printifyProductId === null || p.defaultVariantId === null
  )
}