"use client"

import { useRouter } from "next/navigation"
import { signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </Button>
  )
}
