"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WalletConnectButton } from "./wallet-connect-button"
import { Shield, LayoutDashboard, FilePlus } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/care-quest", label: "Home", icon: Shield },
  { href: "/care-quest/register", label: "Register Project", icon: FilePlus },
  { href: "/care-quest/dashboard", label: "Dashboard", icon: LayoutDashboard },
]

export function CareQuestNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/care-quest"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <Shield className="h-6 w-6 text-emerald-400" />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              CARE QUEST
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-6">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-emerald-400",
                  pathname === href ? "text-emerald-400" : "text-slate-400"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
            <WalletConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
