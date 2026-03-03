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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useApp } from "@/context/app-context"
import type { AmazonCredentials } from "@/context/app-context"

const MARKETPLACES = [
  { id: "ATVPDKIKX0DER", label: "US (amazon.com)" },
  { id: "A1F83G8C2ARO7P", label: "UK (amazon.co.uk)" },
  { id: "A2EUQ1WTGCTBG2", label: "CA (amazon.ca)" },
  { id: "A1PA6795UKMFR9", label: "DE (amazon.de)" },
  { id: "A13V1IB3VIYZZH", label: "FR (amazon.fr)" },
  { id: "APJ6JRA9NG5V4", label: "IT (amazon.it)" },
  { id: "A1RKKUPIHCS9HS", label: "ES (amazon.es)" },
]

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function AmazonModal({ open, onOpenChange }: Props) {
  const { connectAccount } = useApp()
  const [marketplace, setMarketplace] = useState("")

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AmazonCredentials>()

  const onSubmit = (data: AmazonCredentials) => {
    if (!marketplace) return
    connectAccount("amazon", { ...data, marketplaceId: marketplace })
    toast.success("Amazon account connected successfully.")
    reset()
    setMarketplace("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card text-card-foreground">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-md bg-[#FF9900] flex items-center justify-center shrink-0">
              <span className="text-black font-bold text-xs">AMZ</span>
            </div>
            <DialogTitle className="font-display text-lg">Connect Amazon SP-API</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Enter your Amazon SP-API credentials. Find them at{" "}
            <a href="https://sellercentral.amazon.com/apps/manage" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Seller Central → Apps & Services
            </a>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sellerId">Seller ID</Label>
            <Input
              id="sellerId"
              placeholder="e.g. A2XXXXXXXXXXXXX"
              {...register("sellerId", { required: "Seller ID is required", minLength: { value: 5, message: "Too short" } })}
            />
            {errors.sellerId && <p className="text-destructive text-xs">{errors.sellerId.message}</p>}
            <p className="text-muted-foreground text-xs">Found in Seller Central → Account Info → Business Information</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mwsAuthToken">MWS Auth Token</Label>
            <Input
              id="mwsAuthToken"
              placeholder="amzn.mws.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              {...register("mwsAuthToken", { required: "MWS Auth Token is required" })}
            />
            {errors.mwsAuthToken && <p className="text-destructive text-xs">{errors.mwsAuthToken.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="awsAccessKeyId">AWS Access Key ID</Label>
            <Input
              id="awsAccessKeyId"
              placeholder="AKIAIOSFODNN7EXAMPLE"
              {...register("awsAccessKeyId", { required: "AWS Access Key ID is required", minLength: { value: 16, message: "Too short" } })}
            />
            {errors.awsAccessKeyId && <p className="text-destructive text-xs">{errors.awsAccessKeyId.message}</p>}
            <p className="text-muted-foreground text-xs">Found in AWS IAM → Users → Security credentials</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="awsSecretAccessKey">AWS Secret Access Key</Label>
            <Input
              id="awsSecretAccessKey"
              type="password"
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              {...register("awsSecretAccessKey", { required: "AWS Secret Access Key is required", minLength: { value: 20, message: "Too short" } })}
            />
            {errors.awsSecretAccessKey && <p className="text-destructive text-xs">{errors.awsSecretAccessKey.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Marketplace</Label>
            <Select value={marketplace} onValueChange={setMarketplace}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select a marketplace" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {MARKETPLACES.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!marketplace && <p className="text-muted-foreground text-xs">The primary marketplace you sell on</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="refreshToken">Refresh Token</Label>
            <Input
              id="refreshToken"
              type="password"
              placeholder="Atzr|IwEBIxxxxxxxxxxxxxxxxxxxxx"
              {...register("refreshToken", { required: "Refresh Token is required", minLength: { value: 10, message: "Too short" } })}
            />
            {errors.refreshToken && <p className="text-destructive text-xs">{errors.refreshToken.message}</p>}
            <p className="text-muted-foreground text-xs">Generated during SP-API application authorization flow</p>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!marketplace}>Connect Amazon</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
