"use client"

import { useState } from "react"
import { User, Settings, Heart, Bell, Shield, HelpCircle, LogOut, Edit3, Camera } from "lucide-react"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { useLanguage } from "@/lib/i18n/context"
import Link from "next/link"

export default function MobileAccountPage() {
  const { user, signOut } = useAuthContext()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("profile")

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
  const userEmail = user?.email || 'usuario@ejemplo.com'

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const menuItems = [
    {
      id: "profile",
      title: "Perfil",
      icon: User,
      description: "Información personal y preferencias"
    },
    {
      id: "settings",
      title: "Configuración",
      icon: Settings,
      description: "Ajustes de la aplicación"
    },
    {
      id: "notifications",
      title: "Notificaciones",
      icon: Bell,
      description: "Gestionar alertas y recordatorios"
    },
    {
      id: "privacy",
      title: "Privacidad",
      icon: Shield,
      description: "Control de datos y privacidad"
    },
    {
      id: "help",
      title: "Ayuda",
      icon: HelpCircle,
      description: "Soporte y preguntas frecuentes"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con foto de perfil */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 px-6 py-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-10 w-10" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Camera className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{userName}</h1>
            <p className="text-green-100 text-sm">{userEmail}</p>
            <button className="mt-2 flex items-center space-x-1 text-green-100 hover:text-white transition-colors">
              <Edit3 className="h-4 w-4" />
              <span className="text-sm">Editar perfil</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex space-x-1 overflow-x-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === item.id
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div className="px-6 py-4">
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-4">Información personal</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={userName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-4">Preferencias nutricionales</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Objetivo calórico diario</span>
                  <span className="font-medium text-gray-900">2,000 cal</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Restricciones dietéticas</span>
                  <span className="text-sm text-gray-500">Ninguna</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Nivel de actividad</span>
                  <span className="text-sm text-gray-500">Moderado</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-4">Preferencias de la app</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Idioma</span>
                  <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                    <option>Español</option>
                    <option>English</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Tema</span>
                  <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                    <option>Claro</option>
                    <option>Oscuro</option>
                    <option>Automático</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Unidades</span>
                  <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                    <option>Métrico (kg, cm)</option>
                    <option>Imperial (lb, ft)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-4">Notificaciones push</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Recordatorios de comidas</p>
                    <p className="text-sm text-gray-500">Te recordamos cuándo es hora de comer</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Actualizaciones de metas</p>
                    <p className="text-sm text-gray-500">Progreso hacia tus objetivos</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Nuevas recetas</p>
                    <p className="text-sm text-gray-500">Recomendaciones personalizadas</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-4">Privacidad y seguridad</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Perfil público</p>
                    <p className="text-sm text-gray-500">Permitir que otros vean tu perfil</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Análisis de uso</p>
                    <p className="text-sm text-gray-500">Ayudar a mejorar la app</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Marketing</p>
                    <p className="text-sm text-gray-500">Recibir ofertas y promociones</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "help" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-4">Soporte</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <p className="font-medium text-gray-900">Preguntas frecuentes</p>
                  <p className="text-sm text-gray-500">Respuestas a dudas comunes</p>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <p className="font-medium text-gray-900">Contactar soporte</p>
                  <p className="text-sm text-gray-500">Envía un mensaje al equipo</p>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <p className="font-medium text-gray-900">Tutorial de la app</p>
                  <p className="text-sm text-gray-500">Aprende a usar todas las funciones</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botón de cerrar sesión */}
      <div className="px-6 pb-6">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}