"use client"

import { useState } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Store as StoreIcon,
  Package,
} from "lucide-react"
import { useApp } from "@/context/app-context"
import type { Store, Platform } from "@/context/app-context"
import {
  STORE_CATEGORY_LABELS,
  STORE_CATEGORY_COLORS,
} from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StoreFormModal } from "@/components/stores/store-form-modal"

const PLATFORM_META: Record<Platform, { label: string; color: string; abbr: string }> = {
  amazon:  { label: "Amazon",  color: "#FF9900", abbr: "AMZ" },
  ebay:    { label: "eBay",    color: "#E53238", abbr: "eBay" },
  etsy:    { label: "Etsy",    color: "#F56400", abbr: "Etsy" },
  shopify: { label: "Shopify", color: "#96BF48", abbr: "SHF" },
}

export default function StoresPage() {
  const { stores, listings, deleteStore } = useApp()

  const [formOpen, setFormOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Store | null>(null)

  const handleEdit = (store: Store) => {
    setEditingStore(store)
    setFormOpen(true)
  }

  const handleCreate = () => {
    setEditingStore(null)
    setFormOpen(true)
  }

  const handleDelete = () => {
    if (confirmDelete) {
      deleteStore(confirmDelete.id)
      setConfirmDelete(null)
    }
  }

  const listingCountForStore = (storeId: string) =>
    listings.filter(l => l.storeId === storeId).length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Stores</h1>
          <p className="text-muted-foreground text-sm">
            {stores.length} store{stores.length !== 1 ? "s" : ""} — organise your listings by type
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          New Store
        </Button>
      </div>

      {/* Empty state */}
      {stores.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <StoreIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">No stores yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create a store to categorise and channel your listings by type.
              </p>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Create your first store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map(store => {
            const listingCount = listingCountForStore(store.id)
            const catColor = STORE_CATEGORY_COLORS[store.category]

            return (
              <Card
                key={store.id}
                className="bg-card border-border relative overflow-hidden flex flex-col"
              >
                {/* Category accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: catColor }}
                />

                <CardContent className="flex flex-col gap-4 pt-6 pb-4 flex-1">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${catColor}25` }}
                      >
                        <StoreIcon
                          className="w-5 h-5"
                          style={{ color: catColor }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-foreground text-sm leading-tight truncate">
                          {store.name}
                        </p>
                        <Badge
                          className="mt-1 text-[10px] font-semibold px-1.5 py-0 border-0"
                          style={{
                            backgroundColor: `${catColor}25`,
                            color: catColor,
                          }}
                        >
                          {STORE_CATEGORY_LABELS[store.category]}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEdit(store)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="sr-only">Edit store</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => setConfirmDelete(store)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Delete store</span>
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  {store.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {store.description}
                    </p>
                  )}

                  {/* Footer row */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                    {/* Listing count */}
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Package className="w-3.5 h-3.5" />
                      <span className="text-xs">
                        {listingCount} listing{listingCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Platform chips */}
                    {store.platforms.length > 0 ? (
                      <div className="flex items-center gap-1">
                        {store.platforms.map(p => {
                          const meta = PLATFORM_META[p]
                          return (
                            <span
                              key={p}
                              title={meta.label}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: `${meta.color}20`,
                                color: meta.color,
                              }}
                            >
                              {meta.abbr}
                            </span>
                          )
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No platforms</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <StoreFormModal
        open={formOpen}
        onOpenChange={open => {
          setFormOpen(open)
          if (!open) setEditingStore(null)
        }}
        editingStore={editingStore}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!confirmDelete} onOpenChange={open => !open && setConfirmDelete(null)}>
        <AlertDialogContent className="bg-card border-border text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete &quot;{confirmDelete?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently remove the store. Listings assigned to it will become unassigned.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary text-foreground border-border hover:bg-secondary/80">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
              onClick={handleDelete}
            >
              Delete Store
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
