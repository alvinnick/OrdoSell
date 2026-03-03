"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useApp } from "@/context/app-context"
import type { EbayCredentials } from "@/context/app-context"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

type FormValues = Omit<EbayCredentials, "environment">

export function EbayModal({ open, onOpenChange }: Props) {
  const { connectAccount } = useApp()
  const [isProduction, setIsProduction] = useState(true)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>()

  const onSubmit = (data: FormValues) => {
    connectAccount("ebay", { ...data, environment: isProduction ? "production" : "sandbox" })
    toast.success("eBay account connected successfully.")
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card text-card-foreground">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-md bg-[#E53238] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">eBay</span>
            </div>
            <DialogTitle className="font-display text-lg">Connect eBay</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Enter your eBay Developer credentials. Find them at{" "}
            <a href="https://developer.ebay.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              developer.ebay.com
            </a>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="appId">App ID (Client ID)</Label>
            <Input
              id="appId"
              placeholder="YourApp-YourProd-PRD-xxxxxxxxxxxx-xxxxxxxx"
              {...register("appId", { required: "App ID is required", minLength: { value: 10, message: "Too short" } })}
            />
            {errors.appId && <p className="text-destructive text-xs">{errors.appId.message}</p>}
            <p className="text-muted-foreground text-xs">Found in My Account → Application Keys</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="certId">Cert ID (Client Secret)</Label>
            <Input
              id="certId"
              type="password"
              placeholder="PRD-xxxxxxxxxxxxxxxxxxxx-xxxxxxxx-xxxx-xxxx"
              {...register("certId", { required: "Cert ID is required", minLength: { value: 10, message: "Too short" } })}
            />
            {errors.certId && <p className="text-destructive text-xs">{errors.certId.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="devId">Dev ID</Label>
            <Input
              id="devId"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              {...register("devId", { required: "Dev ID is required", minLength: { value: 10, message: "Too short" } })}
            />
            {errors.devId && <p className="text-destructive text-xs">{errors.devId.message}</p>}
            <p className="text-muted-foreground text-xs">Your unique developer identifier (same across apps)</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="userAuthToken">User Auth Token (OAuth)</Label>
            <Input
              id="userAuthToken"
              type="password"
              placeholder="v^1.1#i^1#r^1#f^0#I^3#p^3#t^H4sIAAAA..."
              {...register("userAuthToken", { required: "User Auth Token is required", minLength: { value: 20, message: "Too short" } })}
            />
            {errors.userAuthToken && <p className="text-destructive text-xs">{errors.userAuthToken.message}</p>}
            <p className="text-muted-foreground text-xs">Generate via OAuth in the eBay Developer Console under User Tokens</p>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Environment</p>
              <p className="text-xs text-muted-foreground">{isProduction ? "Production (live marketplace)" : "Sandbox (testing environment)"}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sandbox</span>
              <Switch checked={isProduction} onCheckedChange={setIsProduction} />
              <span className="text-xs text-muted-foreground">Production</span>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Connect eBay</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
