"use client"

import { useEffect } from "react"
import { toast } from "@/hooks/use-toast"

interface KeyboardShortcutsProps {
  onAddTask: () => void
  onToggleTheme?: () => void
}

export function KeyboardShortcuts({ onAddTask, onToggleTheme }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Cmd/Ctrl + K - Add new task
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onAddTask()
        toast({
          title: "Quick Add",
          description: "Focus set to new task input",
          duration: 2000,
        })
      }

      // Cmd/Ctrl + D - Toggle theme
      if ((e.metaKey || e.ctrlKey) && e.key === "d" && onToggleTheme) {
        e.preventDefault()
        onToggleTheme()
      }

      // ? - Show shortcuts
      if (e.key === "?" && !e.shiftKey) {
        e.preventDefault()
        toast({
          title: "Keyboard Shortcuts",
          description: "⌘K: Add task • ⌘D: Toggle theme • ?: Show shortcuts",
          duration: 4000,
        })
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onAddTask, onToggleTheme])

  return null
}
