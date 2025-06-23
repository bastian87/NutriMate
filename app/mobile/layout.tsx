import type { Metadata } from "next"
import MobileLayoutClient from "./MobileLayoutClient"

export const metadata: Metadata = {
  title: "NutriMate Mobile",
  description: "Mobile version of NutriMate",
}

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return <MobileLayoutClient>{children}</MobileLayoutClient>
}
