"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/context/app-context"
import {
  STORE_CATEGORY_LABELS,
  type Store,
  type StoreCategory,
  type Platform,
} from "@/context/app-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const ALL_CATEGORIES = Object.keys(STORE_CATEGORY_LABELS) as StoreCategory[]

const PLATFORM_META: Record<Platform, { label: string; color: string; abbr: string }> = {
  amazon:  { label: "Amazon",  color: "#FF9900", abbr: "AMZ" },
  ebay:    { label: "eBay",    color: "#E53238", abbr: "eBay" },
  etsy:    { label: "Etsy",    color: "#F56400", abbr: "Etsy" },
  shopify: { label: "Shopify", color: "#96BF48", abbr: "SHF" },
}

const ALL_PLATFORMS: Platform[] = ["amazon", "ebay", "etsy", "shopify"]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingStore?: Store | null
}

export function StoreFormModal({ open, onOpenChange, editingStore }: Props) {
  const { addStore, updateStore } = useApp()

  const [name, setName] = useState("")
  const [category, setCategory] = useState<StoreCategory | "">("")
  const [description, setDescription] = useState("")
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when editing
  useEffect(() => {
    if (editingStore) {
      setName(editingStore.name)
      setCategory(editingStore.category)
      setDescription(editingStore.description)
      setPlatforms(editingStore.platforms)
    } else {
      setName("")
      setCategory("")
      setDescription("")
      setPlatforms([])
    }
    setErrors({})
  }, [editingStore, open])

  const togglePlatform = (p: Platform) => {
    setPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = "Store name is required"
    if (!category) errs.category = "Select a category"
    return errs
  }

  const handleSubmit = () => {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    if (editingStore) {
      updateStore(editingStore.id, {
        name: name.trim(),
        category: category as StoreCategory,
        description: description.trim(),
        platforms,
      })
    } else {
      addStore({
        name: name.trim(),
        category: category as StoreCategory,
        description: description.trim(),
        platforms,
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-card-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editingStore ? "Edit Store" : "Create Store"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-name">Store Name</Label>
            <Input
              id="store-name"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })) }}
              placeholder="e.g. My Furniture Store"
            />
            {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={v => { setCategory(v as StoreCategory); setErrors(p => ({ ...p, category: "" })) }}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {ALL_CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>
                    {STORE_CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-destructive text-xs">{errors.category}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="store-desc">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              id="store-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this store's focus"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Platforms */}
          <div className="flex flex-col gap-2">
            <Label>Associated Platforms <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PLATFORMS.map(p => {
                const meta = PLATFORM_META[p]
                const checked = platforms.includes(p)
                return (
                  <label
                    key={p}
                    className={`flex items-center gap-2.5 rounded-md border px-3 py-2.5 cursor-pointer transition-colors ${
                      checked ? "border-primary bg-primary/10" : "border-border hover:bg-secondary/50"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => togglePlatform(p)}
                      className="shrink-0"
                    />
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-[9px] shrink-0"
                        style={{ backgroundColor: meta.color }}
                      >
                        {meta.abbr.slice(0, 1)}
                      </span>
                      <span className="text-sm font-medium">{meta.label}</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {editingStore ? "Save Changes" : "Create Store"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
