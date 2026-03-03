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
import type { EtsyCredentials } from "@/context/app-context"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function EtsyModal({ open, onOpenChange }: Props) {
  const { connectAccount } = useApp()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EtsyCredentials>()

  const onSubmit = (data: EtsyCredentials) => {
    connectAccount("etsy", data)
    toast.success("Etsy account connected successfully.")
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card text-card-foreground">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-md bg-[#F56400] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">Etsy</span>
            </div>
            <DialogTitle className="font-display text-lg">Connect Etsy</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Enter your Etsy API credentials. Find them at{" "}
            <a href="https://www.etsy.com/developers" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              etsy.com/developers
            </a>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apiKey">API Key (Keystring)</Label>
            <Input
              id="apiKey"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
              {...register("apiKey", { required: "API Key is required", minLength: { value: 10, message: "Too short" } })}
            />
            {errors.apiKey && <p className="text-destructive text-xs">{errors.apiKey.message}</p>}
            <p className="text-muted-foreground text-xs">Found in your Etsy App's detail page under API Key String</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sharedSecret">Shared Secret</Label>
            <Input
              id="sharedSecret"
              type="password"
              placeholder="xxxxxxxxxxxxxxxx"
              {...register("sharedSecret", { required: "Shared Secret is required", minLength: { value: 10, message: "Too short" } })}
            />
            {errors.sharedSecret && <p className="text-destructive text-xs">{errors.sharedSecret.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="oauthAccessToken">OAuth Access Token</Label>
            <Input
              id="oauthAccessToken"
              type="password"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              {...register("oauthAccessToken", { required: "OAuth Access Token is required", minLength: { value: 10, message: "Too short" } })}
            />
            {errors.oauthAccessToken && <p className="text-destructive text-xs">{errors.oauthAccessToken.message}</p>}
            <p className="text-muted-foreground text-xs">Generated via the OAuth 1.0 flow in your Etsy developer app</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="oauthAccessTokenSecret">OAuth Access Token Secret</Label>
            <Input
              id="oauthAccessTokenSecret"
              type="password"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              {...register("oauthAccessTokenSecret", { required: "Token Secret is required", minLength: { value: 10, message: "Too short" } })}
            />
            {errors.oauthAccessTokenSecret && <p className="text-destructive text-xs">{errors.oauthAccessTokenSecret.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="shopId">Shop ID</Label>
            <Input
              id="shopId"
              placeholder="e.g. 12345678"
              {...register("shopId", { required: "Shop ID is required" })}
            />
            {errors.shopId && <p className="text-destructive text-xs">{errors.shopId.message}</p>}
            <p className="text-muted-foreground text-xs">Found in your Etsy shop URL: etsy.com/shop/YourShopName (use numeric ID from API response)</p>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Connect Etsy</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
