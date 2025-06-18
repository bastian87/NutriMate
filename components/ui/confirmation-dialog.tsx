"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog" // Added DialogFooter
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation" // For redirecting to login

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email?: string
}

export function ConfirmationDialog({ open, onOpenChange, email }: ConfirmationDialogProps) {
  const router = useRouter()

  const handleGotIt = () => {
    onOpenChange(false)
    router.push("/login") // Redirect to login page after closing dialog
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pt-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-2xl font-semibold text-center">Account Created!</DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex justify-center mt-6">
          <Button onClick={handleGotIt} className="w-full sm:w-auto">
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
