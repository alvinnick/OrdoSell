"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useApp } from "@/context/app-context"
import type { Platform } from "@/context/app-context"
import { STORE_CATEGORY_LABELS } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/create-listing/image-upload"
import { PublishConfirmModal } from "@/components/create-listing/publish-confirm-modal"

const CURRENCIES = ["GBP", "USD", "EUR", "CAD", "AUD"]
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"]

const ALL_PLATFORMS: { id: Platform; label: string }[] = [
  { id: "amazon", label: "Amazon" },
  { id: "ebay", label: "eBay" },
  { id: "etsy", label: "Etsy" },
  { id: "shopify", label: "Shopify" },
]

export default function CreateListingPage() {
  const { connectedAccounts, addListing, stores } = useApp()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState("GBP")
  const [quantity, setQuantity] = useState("1")
  const [condition, setCondition] = useState("")
  const [category, setCategory] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [weight, setWeight] = useState("")
  const [dimensions, setDimensions] = useState("")
  const [sku, setSku] = useState("")
  const [tags, setTags] = useState("")
  const [brand, setBrand] = useState("")
  const [freeShipping, setFreeShipping] = useState(true)
  const [shippingAmount, setShippingAmount] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([])
  const [storeId, setStoreId] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const togglePlatform = (id: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = "Title is required"
    if (title.length > 80) errs.title = "Title must be 80 characters or fewer (eBay limit)"
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errs.price = "Enter a valid price"
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 1) errs.quantity = "Enter a valid quantity"
    if (!condition) errs.condition = "Select a condition"
    if (selectedPlatforms.length === 0) errs.platforms = "Select at least one platform"
    return errs
  }

  const handlePublishClick = () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length === 0) {
      setConfirmOpen(true)
    }
  }

  const handleConfirm = () => {
    addListing({
      title,
      description,
      price: parseFloat(price),
      currency,
      quantity: parseInt(quantity),
      condition,
      category,
      storeId,
      images,
      weight,
      dimensions,
      sku,
      tags,
      brand,
      freeShipping,
      shippingAmount,
      platforms: selectedPlatforms,
    })
    toast.success(`Listing published to ${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? "s" : ""}.`)
    setConfirmOpen(false)
    router.push("/listings")
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-1">
        <h1 className="font-display font-bold text-2xl text-foreground">Create Listing</h1>
        <p className="text-muted-foreground text-sm">Fill in the details below and choose which platforms to publish to.</p>
      </div>

      {/* Basic Info */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">Title</Label>
              <span className={`text-xs ${title.length > 80 ? "text-destructive" : "text-muted-foreground"}`}>
                {title.length}/80
              </span>
            </div>
            <Input
              id="title"
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: "" })) }}
              placeholder="Enter a clear, descriptive title"
              maxLength={100}
            />
            <p className="text-muted-foreground text-xs">eBay enforces a maximum of 80 characters for listing titles</p>
            {errors.title && <p className="text-destructive text-xs">{errors.title}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your item in detail — condition, features, dimensions, etc."
              rows={5}
              className="resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Price</Label>
              <div className="flex gap-2">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-24 shrink-0 bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={e => { setPrice(e.target.value); setErrors(p => ({ ...p, price: "" })) }}
                  placeholder="0.00"
                />
              </div>
              {errors.price && <p className="text-destructive text-xs">{errors.price}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={e => { setQuantity(e.target.value); setErrors(p => ({ ...p, quantity: "" })) }}
                placeholder="1"
              />
              {errors.quantity && <p className="text-destructive text-xs">{errors.quantity}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Condition</Label>
              <Select value={condition} onValueChange={v => { setCondition(v); setErrors(p => ({ ...p, condition: "" })) }}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.condition && <p className="text-destructive text-xs">{errors.condition}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Nike, Apple, Unbranded"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Clothing & Accessories > Men > Tops"
            />
            <p className="text-muted-foreground text-xs">Enter your best category match — you can map it per platform before publishing</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sku">SKU / Internal Reference</Label>
            <Input
              id="sku"
              value={sku}
              onChange={e => setSku(e.target.value)}
              placeholder="e.g. ITEM-001"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="vintage, handmade, leather, gift (comma separated)"
            />
            <p className="text-muted-foreground text-xs">Used by Etsy to improve discoverability. Separate tags with commas.</p>
          </div>
        </CardContent>
      </Card>

      {/* Store Assignment */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base">Store</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {stores.length === 0 ? (
            <div className="flex items-center gap-3 rounded-md border border-border px-4 py-3 text-sm text-muted-foreground">
              No stores created yet.{" "}
              <a href="/stores" className="text-primary hover:underline">
                Create a store
              </a>{" "}
              to assign this listing to a category.
            </div>
          ) : (
            <>
              <Select value={storeId} onValueChange={setStoreId}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Assign to a store (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="">No store</SelectItem>
                  {stores.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {STORE_CATEGORY_LABELS[s.category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Assign this listing to a store to organise it by category.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Images */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base">Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload images={images} onChange={setImages} max={12} />
          <p className="text-xs text-muted-foreground mt-2">First image will be used as the main listing photo. Max 12 images.</p>
        </CardContent>
      </Card>

      {/* Shipping */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base">Shipping & Dimensions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="e.g. 0.5 kg"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={dimensions}
                onChange={e => setDimensions(e.target.value)}
                placeholder="e.g. 30 x 20 x 5 cm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Free Shipping</p>
              <p className="text-xs text-muted-foreground">Toggle off to enter a shipping charge</p>
            </div>
            <Switch checked={freeShipping} onCheckedChange={setFreeShipping} />
          </div>

          {!freeShipping && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="shippingAmount">Shipping Amount ({currency})</Label>
              <Input
                id="shippingAmount"
                type="number"
                min="0"
                step="0.01"
                value={shippingAmount}
                onChange={e => setShippingAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform targeting */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-base">Publish To</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {ALL_PLATFORMS.map(({ id, label }) => {
            const connected = !!connectedAccounts[id]
            const checked = selectedPlatforms.includes(id)

            return (
              <div
                key={id}
                className={`flex items-center justify-between rounded-md border px-4 py-3 transition-colors ${
                  connected
                    ? checked
                      ? "border-primary bg-primary/10"
                      : "border-border"
                    : "border-border opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`platform-${id}`}
                    checked={checked}
                    disabled={!connected}
                    onCheckedChange={() => connected && togglePlatform(id)}
                  />
                  <Label
                    htmlFor={`platform-${id}`}
                    className={`text-sm font-medium cursor-pointer ${!connected ? "cursor-not-allowed" : ""}`}
                  >
                    {label}
                  </Label>
                </div>
                {!connected && (
                  <span className="text-xs text-muted-foreground border border-border rounded px-2 py-0.5">
                    Not Connected
                  </span>
                )}
              </div>
            )
          })}
          {errors.platforms && <p className="text-destructive text-xs">{errors.platforms}</p>}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-3 justify-end pb-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>Cancel</Button>
        <Button onClick={handlePublishClick} size="lg">Publish Listing</Button>
      </div>

      <PublishConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={title}
        price={price}
        currency={currency}
        platforms={selectedPlatforms}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
