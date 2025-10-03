"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  hover?: boolean
}

export const AnimatedCard = React.memo(({ 
  children, 
  className = "", 
  delay = 0,
  hover = true 
}: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay,
        ease: "easeOut"
      }}
      className={className}
    >
      <Card className={`h-full transition-transform duration-150 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/20 ${hover ? 'cursor-pointer' : ''}`}>
        {children}
      </Card>
    </motion.div>
  )
})

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: string
  chart?: React.ReactNode
  delay?: number
}

export const MetricCard = React.memo(({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  chart,
  delay = 0 
}: MetricCardProps) => {
  return (
    <AnimatedCard delay={delay} hover={false}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-gray-600 dark:text-gray-400">{title}</CardTitle>
          <div className={`w-4 h-4 ${color}`}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-medium">{value}</div>
            {subtitle && (
              <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
            )}
          </div>
          {chart && (
            <div className="ml-4">
              {chart}
            </div>
          )}
        </div>
      </CardContent>
    </AnimatedCard>
  )
})
