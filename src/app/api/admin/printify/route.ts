import { NextRequest, NextResponse } from 'next/server'
import {
  getShops,
  getBlueprints,
  getBlueprintProviders,
  getProviderVariants,
  getProducts,
  getImages,
  uploadImageFromUrl,
  createProduct,
  publishProduct,
} from '@/lib/printify'
import { PRINTIFY_SHOP_ID } from '@/lib/printify-products'

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false
  const auth = req.headers.get('authorization')
  return auth === 'Bearer ' + secret
}

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

      case 'images':
        return NextResponse.json(await getImages())

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
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

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action } = body

    switch (action) {
      case 'upload-image': {
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

      case 'create-product': {
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

      case 'publish-product': {
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

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
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