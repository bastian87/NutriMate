"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { onboardingService, type OnboardingData } from "@/lib/services/onboarding-service"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

// Componentes de pasos
import { WelcomeStep } from "./steps/welcome-step"
import { PersonalInfoStep } from "./steps/personal-info-step"
import { HealthMetricsStep } from "./steps/health-metrics-step"
import { GoalsStep } from "./steps/goals-step"
import { PreferencesStep } from "./steps/preferences-step"
import { CreateAccountStep } from "./steps/create-account-step"

export function OnboardingWizard() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>(() => {
    // Inicializar con datos vacíos o datos guardados
    const savedData = onboardingService.getOnboardingData()
    return Object.keys(savedData).length > 0 ? savedData : {
      full_name: '',
      username: '',
      email: '',
      age: undefined,
      gender: '',
      height: undefined,
      weight: undefined,
      activity_level: '',
      health_goal: '',
      calorie_target: undefined,
      dietary_preferences: [],
      excluded_ingredients: [],
      include_snacks: false,
      max_prep_time: 60,
      macro_priority: 'balanced',
      allergies: [],
      intolerances: []
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)

  const steps = onboardingService.getOnboardingSteps()

  // Cargar datos guardados al montar el componente
  useEffect(() => {
    const savedData = onboardingService.getOnboardingData()
    const savedStep = onboardingService.getCurrentStep()
    
    setOnboardingData(savedData)
    
    // Encontrar el índice del paso guardado
    const stepIndex = steps.findIndex(step => step.id === savedStep)
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex)
    }
  }, [])


  // Guardar datos cuando cambien (evitar guardar en el primer render)
  useEffect(() => {
    // Solo guardar si no es el estado inicial vacío
    const hasValidData = Object.keys(onboardingData).some(key => {
      const value = onboardingData[key as keyof typeof onboardingData]
      return value !== undefined && value !== '' && value !== null && 
             (Array.isArray(value) ? value.length > 0 : true)
    })
    
    if (hasValidData) {
      onboardingService.saveOnboardingData(onboardingData)
    }
  }, [onboardingData])

  // Guardar paso actual
  useEffect(() => {
    onboardingService.saveCurrentStep(steps[currentStep]?.id || 'welcome')
  }, [currentStep])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleDataChange = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }))
  }

  const handleCreateAccount = async () => {
    console.log("🚀 handleCreateAccount called")
    console.log("📊 Current onboarding data:", onboardingData)
    
    setIsCreatingAccount(true)
    
    try {
      console.log("🔄 Calling onboardingService.createAccountAndFinalize()")
      const result = await onboardingService.createAccountAndFinalize()
      console.log("📋 Result from createAccountAndFinalize:", result)
      
      if (result.success) {
        console.log("✅ Account created successfully")
        toast({
          title: "¡Cuenta creada exitosamente!",
          description: "Tu plan personalizado ha sido guardado.",
        })
        
        // Redirigir al dashboard
        router.push("/dashboard")
      } else {
        console.log("❌ Account creation failed:", result.error)
        toast({
          title: "Error al crear la cuenta",
          description: result.error || "Ocurrió un error inesperado",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error creating account:", error)
      toast({
        title: "Error al crear la cuenta",
        description: "Ocurrió un error inesperado. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingAccount(false)
    }
  }

  const renderStep = () => {
    const step = steps[currentStep]
    
    switch (step.id) {
      case 'welcome':
        return <WelcomeStep data={onboardingData} onChange={handleDataChange} />
      case 'personal-info':
        return <PersonalInfoStep data={onboardingData} onChange={handleDataChange} />
      case 'health-metrics':
        return <HealthMetricsStep data={onboardingData} onChange={handleDataChange} />
      case 'goals':
        return <GoalsStep data={onboardingData} onChange={handleDataChange} />
      case 'preferences':
        return <PreferencesStep data={onboardingData} onChange={handleDataChange} />
      case 'create-account':
        return <CreateAccountStep 
          data={onboardingData} 
          onChange={handleDataChange}
          onCreateAccount={handleCreateAccount}
          isLoading={isCreatingAccount}
        />
      default:
        return <WelcomeStep data={onboardingData} onChange={handleDataChange} />
    }
  }

  const isStepValid = () => {
    const step = steps[currentStep]
    
    switch (step.id) {
      case 'welcome':
        return true
      case 'personal-info':
        return !!(onboardingData.full_name && onboardingData.username && onboardingData.email && onboardingData.password)
      case 'health-metrics':
        return !!(onboardingData.age && onboardingData.gender && onboardingData.height && onboardingData.weight)
      case 'goals':
        return !!(onboardingData.activity_level && onboardingData.health_goal)
      case 'preferences':
        return true // Opcional
      case 'create-account':
        return onboardingService.isOnboardingComplete()
      default:
        return false
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {steps[currentStep]?.title}
          </h1>
          <p className="text-gray-600">
            {steps[currentStep]?.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Paso {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(progress)}% completado</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation - Solo mostrar si no es el paso final */}
        {currentStep !== steps.length - 1 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
