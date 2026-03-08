import { NextRequest, NextResponse } from 'next/server'
import {
  getShops,
  getBlueprints,
  getBlueprintProviders,
  getProviderVariants,
  getProducts,
  getProduct,
  getImages,
  uploadImageFromUrl,
  uploadImageBase64,
  createProduct,
  updateProduct,
  deleteProduct,
  unpublishProduct,
  notifyPublishingSucceeded,
  publishProduct,
} from '@/lib/printify'
import { PRINTIFY_SHOP_ID } from '@/lib/printify-products'

// Simple admin key check — supports GET and POST actions — use ADMIN_SECRET env var
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false // must be configured
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

/**
 * GET /api/admin/printify?action=shops|blueprints|providers|variants|products|images
 *
 * Query Printify API for catalog data and existing products.
 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || 'shops'

  try {
    switch (action) {
      case 'shops':
        return NextResponse.json(await getShops())

      case 'blueprints': {
        const blueprints = await getBlueprints()
        // Optionally filter by search term
        const q = searchParams.get('q')?.toLowerCase()
        const filtered = q
          ? blueprints.filter(
              (b: any) =>
                b.title.toLowerCase().includes(q) ||
                b.brand?.toLowerCase().includes(q)
            )
          : blueprints
        return NextResponse.json(filtered.slice(0, 50))
      }

      case 'providers': {
        const bpId = parseInt(searchParams.get('blueprint_id') || '0')
        if (!bpId) {
          return NextResponse.json(
            { error: 'blueprint_id required' },
            { status: 400 }
          )
        }
        return NextResponse.json(await getBlueprintProviders(bpId))
      }

      case 'variants': {
        const bpId2 = parseInt(searchParams.get('blueprint_id') || '0')
        const ppId = parseInt(searchParams.get('provider_id') || '0')
        if (!bpId2 || !ppId) {
          return NextResponse.json(
            { error: 'blueprint_id and provider_id required' },
            { status: 400 }
          )
        }
        return NextResponse.json(await getProviderVariants(bpId2, ppId))
      }

      case 'products':
        return NextResponse.json(await getProducts(PRINTIFY_SHOP_ID))

      case 'product': {
        // Get a single product by ID
        const productId = searchParams.get('product_id')
        if (!productId) {
          return NextResponse.json({ error: 'product_id required' }, { status: 400 })
        }
        const product = await getProduct(PRINTIFY_SHOP_ID, productId)
        return NextResponse.json(product)
      }

      case 'images':
        return NextResponse.json(await getImages())

            default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Printify API error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/printify
 *
 * Actions: upload-image, create-product, publish-product
 */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action } = body

    switch (action) {
      case 'upload-image': {
        // Upload image from a URL
        const { fileName, url } = body
        if (!fileName || !url) {
          return NextResponse.json(
            { error: 'fileName and url required' },
            { status: 400 }
          )
        }
        const image = await uploadImageFromUrl(fileName, url)
        return NextResponse.json(image)
      }

      case 'upload-image-base64': {
        // Upload image from base64 data
        const { fileName: b64FileName, base64 } = body
        if (!b64FileName || !base64) {
          return NextResponse.json(
            { error: 'fileName and base64 required' },
            { status: 400 }
          )
        }
        const b64Image = await uploadImageBase64(b64FileName, base64)
        return NextResponse.json(b64Image)
      }

      case 'create-product': {
        // Create a product in Printify
        const { product } = body
        if (!product) {
          return NextResponse.json(
            { error: 'product payload required' },
            { status: 400 }
          )
        }
        const created = await createProduct(PRINTIFY_SHOP_ID, product)
        return NextResponse.json(created)
      }

      case 'update-product': {
        // Update an existing product
        const { productId: updateProdId, data: updateData } = body
        if (!updateProdId || !updateData) {
          return NextResponse.json(
            { error: 'productId and data required' },
            { status: 400 }
          )
        }
        const updated = await updateProduct(PRINTIFY_SHOP_ID, updateProdId, updateData)
        return NextResponse.json(updated)
      }

      case 'publish-product': {
        // Publish a product
        const { productId } = body
        if (!productId) {
          return NextResponse.json(
            { error: 'productId required' },
            { status: 400 }
          )
        }
        await publishProduct(PRINTIFY_SHOP_ID, productId)
        return NextResponse.json({ success: true })
      }

      
      case 'delete-product': {
        const { productId: delProdId } = body
        if (!delProdId) {
          return NextResponse.json({ error: 'productId required' }, { status: 400 })
        }
        await deleteProduct(PRINTIFY_SHOP_ID, delProdId)
        return NextResponse.json({ success: true })
      }

      case 'unpublish-product': {
        const { productId: unpubProdId } = body
        if (!unpubProdId) {
          return NextResponse.json({ error: 'productId required' }, { status: 400 })
        }
        await unpublishProduct(PRINTIFY_SHOP_ID, unpubProdId)
        return NextResponse.json({ success: true })
      }

      case 'notify-publishing-succeeded': {
        const { productId: notifyProdId, externalId } = body
        if (!notifyProdId) {
          return NextResponse.json({ error: 'productId required' }, { status: 400 })
        }
        await notifyPublishingSucceeded(PRINTIFY_SHOP_ID, notifyProdId, externalId || notifyProdId)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Printify API error' },
      { status: 500 }
    )
  }
}
