"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Palette, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color?: string
  onColorChange: (color: string | undefined) => void
  className?: string
}

const PRESET_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Green", value: "#10b981" },
  { name: "Yellow", value: "#f59e0b" },
  { name: "Red", value: "#ef4444" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Orange", value: "#f97316" },
  { name: "Emerald", value: "#059669" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Violet", value: "#7c3aed" },
]

export function ColorPicker({ color, onColorChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState(color || "#3b82f6")

  const handlePresetColor = (presetColor: string) => {
    onColorChange(presetColor)
    setCustomColor(presetColor)
    setIsOpen(false)
  }

  const handleCustomColor = () => {
    onColorChange(customColor)
    setIsOpen(false)
  }

  const handleRemoveColor = () => {
    onColorChange(undefined)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-8 px-3 gap-2", className)}>
          <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: color || "#e5e7eb" }} />
          <Palette className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Preset Colors</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor.value}
                  onClick={() => handlePresetColor(presetColor.value)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 border-border hover:scale-110 transition-transform relative",
                    color === presetColor.value && "ring-2 ring-primary ring-offset-2",
                  )}
                  style={{ backgroundColor: presetColor.value }}
                  title={presetColor.name}
                >
                  {color === presetColor.value && <Check className="h-4 w-4 text-white absolute inset-0 m-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Custom Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-12 h-8 p-1 border rounded"
              />
              <Input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1 h-8 text-sm"
              />
              <Button onClick={handleCustomColor} size="sm" className="h-8 px-3">
                Apply
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveColor}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Remove Color
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
