"use client"

import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/context/app-context"
import type { ShopifyCredentials } from "@/context/app-context"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function ShopifyModal({ open, onOpenChange }: Props) {
  const { connectAccount } = useApp()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ShopifyCredentials>()

  const onSubmit = (data: ShopifyCredentials) => {
    connectAccount("shopify", data)
    toast.success("Shopify store connected successfully.")
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card text-card-foreground">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-md bg-[#96BF48] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <DialogTitle className="font-display text-lg">Connect Shopify</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Enter your Shopify store credentials. Find them at{" "}
            <a
              href="https://admin.shopify.com/store/[your-store]/settings/apps/development"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Shopify Admin → Apps → Develop Apps
            </a>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              placeholder="your-store-name"
              {...register("storeName", {
                required: "Store name is required",
                pattern: {
                  value: /^[a-zA-Z0-9-]+$/,
                  message: "Only letters, numbers and hyphens",
                },
              })}
            />
            {errors.storeName && <p className="text-destructive text-xs">{errors.storeName.message}</p>}
            <p className="text-muted-foreground text-xs">
              The subdomain of your store — e.g. <span className="font-mono">my-store</span> from{" "}
              <span className="font-mono">my-store.myshopify.com</span>
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              {...register("apiKey", {
                required: "API Key is required",
                minLength: { value: 10, message: "Too short" },
              })}
            />
            {errors.apiKey && <p className="text-destructive text-xs">{errors.apiKey.message}</p>}
            <p className="text-muted-foreground text-xs">Found under Apps → Develop Apps → your app → API credentials</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apiSecretKey">API Secret Key</Label>
            <Input
              id="apiSecretKey"
              type="password"
              placeholder="shpss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              {...register("apiSecretKey", {
                required: "API Secret Key is required",
                minLength: { value: 10, message: "Too short" },
              })}
            />
            {errors.apiSecretKey && <p className="text-destructive text-xs">{errors.apiSecretKey.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="accessToken">Admin API Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              {...register("accessToken", {
                required: "Access Token is required",
                minLength: { value: 10, message: "Too short" },
              })}
            />
            {errors.accessToken && <p className="text-destructive text-xs">{errors.accessToken.message}</p>}
            <p className="text-muted-foreground text-xs">
              Generated when you install your custom app. Required scopes:{" "}
              <span className="font-mono">read_products, write_products</span>
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Connect Shopify</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
