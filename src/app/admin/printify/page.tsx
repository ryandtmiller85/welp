"use client"

import { useState, useRef } from "react"

const ADMIN_SECRET = "" // Will be entered in the UI

interface MerchProduct {
  merchItemId: string
  title: string
  description: string
  designFile: string
  category: string
  color: string
}

const PRODUCTS: MerchProduct[] = [
  // Essentials
  { merchItemId: "tee-og-black", title: "welp. Wordmark Tee — Dark", description: "welp. wordmark white on black", designFile: "welp_wordmark_white.png", category: "tees", color: "Black" },
  { merchItemId: "tee-og-white", title: "welp. Wordmark Tee — White", description: "welp. wordmark dark on white", designFile: "welp_wordmark_dark.png", category: "tees", color: "White" },
  { merchItemId: "hat-dad-black", title: "welp. Dad Cap", description: "welp. embroidered white on black", designFile: "hat_welp_white.png", category: "hats", color: "Black" },
  { merchItemId: "mug-accent", title: "welp. Accent Mug", description: "welp. dark on white 11oz accent mug", designFile: "mug_welp_dark.png", category: "mugs", color: "White" },
  { merchItemId: "tote-carry-all", title: "welp. Tote Bag", description: "welp. dark on natural canvas", designFile: "tote_welp_dark.png", category: "totes", color: "Natural" },
  { merchItemId: "sticker-welp", title: "welp. Sticker", description: "Kiss-cut logo sticker", designFile: "sticker_welp_rose.png", category: "stickers", color: "" },
  // Statements
  { merchItemId: "tee-definition", title: "welp. Definition Tee", description: "Dictionary-style definition on white", designFile: "tee_definition.png", category: "tees", color: "White" },
  { merchItemId: "tee-start-over", title: "welp. Time to Start Over Tee", description: "welp. + TIME TO START OVER, white on black", designFile: "tee_start_over.png", category: "tees", color: "Black" },
  { merchItemId: "crew-spite", title: "Built with Spite Crewneck", description: "Centered chest print on charcoal", designFile: "crew_spite.png", category: "sweatshirts", color: "Charcoal Heather" },
  { merchItemId: "mug-everything-fine", title: "Everything is Fine Mug", description: "Everything is fine. (Terms apply.) Red accent", designFile: "mug_everything_fine.png", category: "mugs", color: "White" },
  // Petty
  { merchItemId: "tee-kept-pots", title: "He Kept the Pots Tee", description: "Rose gold text on black", designFile: "tee_kept_pots.png", category: "tees", color: "Black" },
  { merchItemId: "tee-everything-fine", title: "Everything is Fine Tee", description: "Everything is fine. (Terms apply.) on white", designFile: "tee_everything_fine.png", category: "tees", color: "White" },
]

interface UploadedImage {
  id: string
  preview_url: string
  file_name: string
}

interface ProductStatus {
  merchItemId: string
  imageId?: string
  imagePreview?: string
  printifyProductId?: string
  status: "pending" | "uploading" | "uploaded" | "creating" | "created" | "error"
  error?: string
}

export default function PrintifyAdminPage() {
  const [secret, setSecret] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [statuses, setStatuses] = useState<Record<string, ProductStatus>>({})
  const [shopInfo, setShopInfo] = useState<any>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  async function authenticate() {
    try {
      const res = await fetch("/api/admin/printify?action=shops", {
        headers: { Authorization: `Bearer ${secret}` },
      })
      if (res.ok) {
        const data = await res.json()
        setShopInfo(data[0])
        setAuthenticated(true)
      } else {
        alert("Invalid admin secret")
      }
    } catch {
      alert("Authentication failed")
    }
  }

  async function uploadDesign(merchItemId: string, file: File) {
    setStatuses((prev) => ({
      ...prev,
      [merchItemId]: { merchItemId, status: "uploading" },
    }))

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/admin/printify/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}` },
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Upload failed")
      }

      const image: UploadedImage = await res.json()

      setStatuses((prev) => ({
        ...prev,
        [merchItemId]: {
          merchItemId,
          imageId: image.id,
          imagePreview: image.preview_url,
          status: "uploaded",
        },
      }))
    } catch (err: any) {
      setStatuses((prev) => ({
        ...prev,
        [merchItemId]: {
          merchItemId,
          status: "error",
          error: err.message,
        },
      }))
    }
  }

  function handleFileSelect(merchItemId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      uploadDesign(merchItemId, file)
    }
  }

  function getStatusBadge(status?: ProductStatus) {
    if (!status) return <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">Pending</span>
    switch (status.status) {
      case "uploading":
        return <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded animate-pulse">Uploading...</span>
      case "uploaded":
        return <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">Image Uploaded</span>
      case "creating":
        return <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded animate-pulse">Creating...</span>
      case "created":
        return <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">Created</span>
      case "error":
        return <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">Error: {status.error}</span>
      default:
        return <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">Pending</span>
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-96">
          <h1 className="text-xl font-bold mb-4">Printify Admin Setup</h1>
          <p className="text-sm text-slate-500 mb-4">Enter the admin secret to manage Printify products.</p>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && authenticate()}
            placeholder="Admin Secret"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-3"
          />
          <button
            onClick={authenticate}
            className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800"
          >
            Authenticate
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Printify Product Setup</h1>
            <p className="text-sm text-slate-500">
              Shop: {shopInfo?.title} (ID: {shopInfo?.id})
            </p>
          </div>
          <div className="text-sm text-slate-500">
            {Object.values(statuses).filter((s) => s.status === "uploaded" || s.status === "created").length} / {PRODUCTS.length} ready
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-amber-800 mb-1">How to use</h3>
          <p className="text-sm text-amber-700">
            For each product below, upload the corresponding design file from your welp-designs folder.
            The design will be uploaded to Printify. Then go to Printify to finish creating each product
            (select colors, sizes, set pricing). Note the Printify product ID for each item.
          </p>
        </div>

        <div className="space-y-3">
          {PRODUCTS.map((product) => {
            const status = statuses[product.merchItemId]
            return (
              <div
                key={product.merchItemId}
                className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{product.title}</span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{product.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Design file: <code className="bg-slate-100 px-1 rounded">{product.designFile}</code>
                    {product.color && <> · Color: <strong>{product.color}</strong></>}
                  </p>
                </div>

                {status?.imagePreview && (
                  <img
                    src={status.imagePreview}
                    alt="preview"
                    className="w-12 h-12 object-contain bg-slate-100 rounded"
                  />
                )}

                <div className="flex items-center gap-2">
                  {getStatusBadge(status)}

                  <input
                    type="file"
                    accept="image/png"
                    ref={(el) => { fileInputRefs.current[product.merchItemId] = el }}
                    onChange={(e) => handleFileSelect(product.merchItemId, e)}
                    className="hidden"
                  />

                  {(!status || status.status === "pending" || status.status === "error") && (
                    <button
                      onClick={() => fileInputRefs.current[product.merchItemId]?.click()}
                      className="text-xs px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                    >
                      Upload Design
                    </button>
                  )}

                  {status?.imageId && (
                    <span className="text-xs text-slate-400">
                      ID: {status.imageId.substring(0, 8)}...
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="font-medium mb-3">Uploaded Image IDs</h3>
          <p className="text-xs text-slate-500 mb-3">
            Copy these IDs for reference when creating products in Printify.
          </p>
          <pre className="text-xs bg-slate-50 p-3 rounded-lg overflow-x-auto">
            {JSON.stringify(
              Object.values(statuses)
                .filter((s) => s.imageId)
                .map((s) => ({ merchItemId: s.merchItemId, imageId: s.imageId })),
              null,
              2
            ) || "[]"}
          </pre>
        </div>
      </div>
    </div>
  )
}