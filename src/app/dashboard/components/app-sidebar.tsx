"use client"

import { logoutAction } from "@/actions/auth-actions"
import type { SessionData } from "@/lib/sessions"
import { cn } from "@/lib/utils"
import {
  Book,
  BookOpen,
  GraduationCap,
  Home,
  LogOut,
  Sparkles,
  Users,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface MenuItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  external?: boolean
}

const commonMenuItems: MenuItem[] = [
  { title: "Beranda", href: "/dashboard", icon: Home },
]

const adminOnlyMenuItems: MenuItem[] = [
  { title: "Jenis Course", href: "/dashboard/courses", icon: Book },
  { title: "Detail Courses", href: "/dashboard/detailcourse", icon: BookOpen },
  { title: "Users", href: "/dashboard/user", icon: Users },
]

const userOnlyMenuItems: MenuItem[] = [
  { title: "Materi Gratis", href: "/dashboard/free", icon: GraduationCap },
  { title: "Materi Premium", href: "/dashboard/premium", icon: GraduationCap },
  {
    title: "Prompt Akademik",
    href: "https://prompt.kelasinovatif.com/",
    icon: Sparkles,
    external: true,
  },
]

interface AppSidebarProps {
  session: SessionData
}

export function AppSidebar({ session }: AppSidebarProps) {
  const pathname = usePathname()

  const menuItems = session?.isAdmin
    ? [...commonMenuItems, ...adminOnlyMenuItems]
    : [...commonMenuItems, ...userOnlyMenuItems]

  const initials = session?.profile?.firstName
    ? session.profile.firstName.substring(0, 1).toUpperCase() +
      (session.profile.lastName
        ? session.profile.lastName.substring(0, 1).toUpperCase()
        : "")
    : "US"

  const fullName = session?.profile?.firstName
    ? `${session.profile.firstName} ${session.profile.lastName || ""}`.trim()
    : "User"

  return (
    <Sidebar collapsible="icon">
      {/* Logo header */}
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-4 py-0">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Image
            src="/images/logo_kelas_inovatif_light.webp"
            alt="Kelas Inovatif Logo"
            width={160}
            height={36}
            className="h-9 w-auto object-contain group-data-[collapsible=icon]:hidden"
            priority
          />
          {/* Ikon saat collapsed */}
          <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground group-data-[collapsible=icon]:flex">
            <span className="text-sm font-bold">KI</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Menu utama */}
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href)

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      "h-10 px-3 text-sidebar-foreground",
                      isActive &&
                        "border-l-[3px] border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <Link
                      href={item.href}
                      {...(item.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      <item.icon
                        className={cn(
                          "size-4",
                          isActive
                            ? "text-sidebar-primary"
                            : "text-sidebar-foreground/60"
                        )}
                      />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Pengaturan */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            Pengaturan
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.includes("/dashboard/profile")}
                tooltip="Profil"
                className={cn(
                  "h-10 px-3 text-sidebar-foreground",
                  pathname.includes("/dashboard/profile") &&
                    "border-l-[3px] border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <Link href="/dashboard/profile">
                  <span
                    className={cn(
                      "material-icons-round text-[18px]",
                      pathname.includes("/dashboard/profile")
                        ? "text-sidebar-primary"
                        : "text-sidebar-foreground/60"
                    )}
                  >
                    person
                  </span>
                  <span className="font-medium">Profil</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: user info + logout */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* User info row */}
            <div className="flex items-center gap-3 px-1 py-1 group-data-[collapsible=icon]:justify-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sidebar-primary to-emerald-700 text-sm font-bold text-white shadow">
                {initials}
              </div>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-medium uppercase text-sidebar-foreground">
                  {fullName}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/60">
                  Member Premium
                </p>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <SidebarMenuButton
                  tooltip="Keluar"
                  className="h-9 text-red-300 hover:bg-red-500/20 hover:text-white"
                >
                  <LogOut className="size-4" />
                  <span>Keluar</span>
                </SidebarMenuButton>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin keluar dari akun ini?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={async () => {
                      await logoutAction()
                    }}
                  >
                    Ya, Keluar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
