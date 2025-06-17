"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail } from "lucide-react"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email?: string
}

export function ConfirmationDialog({ open, onOpenChange, email }: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-xl">Account Created Successfully!</DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>We'll send a confirmation email to:</span>
            </div>
            {email && <div className="font-medium text-foreground">{email}</div>}
            <div className="text-sm text-muted-foreground mt-3">
              Please check your inbox and click the confirmation link to activate your account.
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
