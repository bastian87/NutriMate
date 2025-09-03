'use client';

/**
 * First time coachmark component for plate builder
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserPrefs } from '@/lib/hooks/useUserPrefs';

/**
 * FirstTimeCoachmark component
 */
export default function FirstTimeCoachmark() {
  const { prefs, markPlateCoachmarkSeen } = useUserPrefs();
  const [isOpen, setIsOpen] = useState(false);

  // Show coachmark if user hasn't seen it
  useEffect(() => {
    if (!prefs.hasSeenPlateCoachmark) {
      setIsOpen(true);
    }
  }, [prefs.hasSeenPlateCoachmark]);

  /**
   * Handle closing the coachmark
   */
  const handleClose = async () => {
    await markPlateCoachmarkSeen();
    setIsOpen(false);
  };

  if (prefs.hasSeenPlateCoachmark) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            ¡Bienvenido al Constructor de Platos! 🍽️
          </DialogTitle>
          <DialogDescription className="text-center">
            Aprende cómo construir un plato balanceado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plate visualization */}
          <div className="relative w-64 h-64 mx-auto">
            {/* Plate background */}
            <div className="absolute inset-0 rounded-full border-4 border-gray-300 bg-gray-50"></div>
            
            {/* Quarter sections */}
            <div className="absolute inset-2 grid grid-cols-2 gap-1">
              {/* Top left - Carbs */}
              <div className="bg-yellow-100 border border-yellow-300 rounded-tl-full flex items-center justify-center">
                <div className="text-center p-2">
                  <div className="text-xs font-semibold text-yellow-800">Carbohidratos</div>
                  <div className="text-xs text-yellow-600">25%</div>
                </div>
              </div>
              
              {/* Top right - Protein */}
              <div className="bg-red-100 border border-red-300 rounded-tr-full flex items-center justify-center">
                <div className="text-center p-2">
                  <div className="text-xs font-semibold text-red-800">Proteína</div>
                  <div className="text-xs text-red-600">25%</div>
                </div>
              </div>
              
              {/* Bottom left - Fat */}
              <div className="bg-blue-100 border border-blue-300 rounded-bl-full flex items-center justify-center">
                <div className="text-center p-2">
                  <div className="text-xs font-semibold text-blue-800">Grasas</div>
                  <div className="text-xs text-blue-600">25%</div>
                </div>
              </div>
              
              {/* Bottom right - Vegetables & Fruits */}
              <div className="bg-green-100 border border-green-300 rounded-br-full flex items-center justify-center">
                <div className="text-center p-2">
                  <div className="text-xs font-semibold text-green-800">Verduras</div>
                  <div className="text-xs text-green-600">25%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <div className="text-sm text-gray-700">
              <strong>Objetivo:</strong> Llena cada sección del plato con ingredientes del grupo correspondiente.
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  Carbohidratos
                </Badge>
                <span className="text-xs text-gray-600">Arroz, avena, papa, pan integral</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  Proteína
                </Badge>
                <span className="text-xs text-gray-600">Pollo, huevo, atún, lentejas, tofu</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Grasas
                </Badge>
                <span className="text-xs text-gray-600">Aceite de oliva, aguacate, almendras</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Verduras & Frutas
                </Badge>
                <span className="text-xs text-gray-600">Espinaca, brócoli, tomate, manzana</span>
              </div>
            </div>
          </div>

          {/* Success criteria */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-sm font-semibold text-green-800 mb-1">
              ✅ Día exitoso cuando:
            </div>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Tienes al menos un ingrediente de cada grupo</li>
              <li>• No excedes tu objetivo de calorías</li>
              <li>• No agregas extras (dulces, snacks)</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center">
            <Button onClick={handleClose} className="w-full">
              ¡Entendido, empecemos!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
