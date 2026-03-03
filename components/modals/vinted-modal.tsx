"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function VintedModal({ open, onOpenChange }: Props) {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")

  const handleWaitlist = () => {
    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email address.")
      return
    }
    setEmailError("")
    toast.success("You've been added to the Vinted integration waitlist.")
    setEmail("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-md bg-[#09B1BA] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <DialogTitle className="font-display text-lg">Connect Vinted</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Vinted API integration status
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-amber-500/40 bg-amber-500/10">
          <Info className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-amber-200 text-sm">
            Vinted does not currently offer an official public API. Integration requires Vinted partnership access or a verified third-party integration agreement. Contact{" "}
            <a href="mailto:partnerships@vinted.com" className="underline">partnerships@vinted.com</a>{" "}
            to apply for API access.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3 mt-2">
          <p className="text-sm text-muted-foreground">
            Join the waitlist and we'll notify you as soon as Vinted API access becomes available through OrdoSell.
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vintedEmail">Email Address</Label>
            <Input
              id="vintedEmail"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError("") }}
            />
            {emailError && <p className="text-destructive text-xs">{emailError}</p>}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="button" onClick={handleWaitlist}>Join Waitlist</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
