"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface SuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
}

export function SuccessDialog({ open, onOpenChange, email }: SuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <DialogTitle className="text-2xl mb-2">¡Felicitaciones!</DialogTitle>
            <p className="text-gray-600">
              Has completado tu registro exitosamente. Tu cuenta está lista para usar.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Te enviamos un email de confirmación a {email}
            </p>
          </div>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-green-600 hover:bg-green-700"
          >
            Iniciar Sesión
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
