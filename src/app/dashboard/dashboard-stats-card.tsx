"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, UserPlus, Film, ShieldCheck } from "lucide-react"

interface DashboardStats {
  totalUsers: number
  newUsersThisWeek: number
  totalRecordings: number
  activePremiumAccess: number
}

interface DashboardStatsCardProps {
  stats: DashboardStats
}

export function DashboardStatsCard({ stats }: DashboardStatsCardProps) {
  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString("id-ID"),
      icon: Users,
      description: "Pengguna terdaftar",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Users Baru",
      value: `+${stats.newUsersThisWeek}`,
      icon: UserPlus,
      description: "7 hari terakhir",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Rekaman",
      value: stats.totalRecordings.toLocaleString("id-ID"),
      icon: Film,
      description: "Semua course detail",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Akses Premium",
      value: stats.activePremiumAccess.toLocaleString("id-ID"),
      icon: ShieldCheck,
      description: "Akses rekaman aktif",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.label} className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">
                    {card.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">
                    {card.value}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">
                    {card.description}
                  </p>
                </div>
                <div className={`rounded-lg p-2 shrink-0 ${card.bg}`}>
                  <Icon className={`size-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
