"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Bell, BellOff, CalendarIcon } from "lucide-react"
import { format, addMinutes, addHours, addDays, isBefore } from "date-fns"
import { cn } from "@/lib/utils"

interface Reminder {
  id: string
  datetime: Date
  type: "specific" | "before_due" | "recurring"
  message?: string
  enabled: boolean
}

interface ReminderPickerProps {
  reminders: Reminder[]
  dueDate?: Date
  onRemindersChange: (reminders: Reminder[]) => void
  className?: string
}

export function ReminderPicker({ reminders, dueDate, onRemindersChange, className }: ReminderPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reminderType, setReminderType] = useState<"specific" | "before_due">("specific")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState("09:00")
  const [beforeDueAmount, setBeforeDueAmount] = useState("1")
  const [beforeDueUnit, setBeforeDueUnit] = useState<"minutes" | "hours" | "days">("hours")

  const addReminder = () => {
    let reminderDate: Date

    if (reminderType === "specific") {
      if (!selectedDate) return
      const [hours, minutes] = selectedTime.split(":").map(Number)
      reminderDate = new Date(selectedDate)
      reminderDate.setHours(hours, minutes, 0, 0)
    } else {
      if (!dueDate) return
      const amount = Number.parseInt(beforeDueAmount)
      switch (beforeDueUnit) {
        case "minutes":
          reminderDate = addMinutes(dueDate, -amount)
          break
        case "hours":
          reminderDate = addHours(dueDate, -amount)
          break
        case "days":
          reminderDate = addDays(dueDate, -amount)
          break
        default:
          return
      }
    }

    // Don't add reminders in the past
    if (isBefore(reminderDate, new Date())) {
      return
    }

    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      datetime: reminderDate,
      type: reminderType,
      enabled: true,
    }

    onRemindersChange([...reminders, newReminder])
    setIsOpen(false)
  }

  const removeReminder = (id: string) => {
    onRemindersChange(reminders.filter((r) => r.id !== id))
  }

  const toggleReminder = (id: string) => {
    onRemindersChange(reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  }

  const activeReminders = reminders.filter((r) => r.enabled)
  const hasReminders = reminders.length > 0

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 px-3 gap-2", hasReminders && "text-primary border-primary/50")}
          >
            {hasReminders ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
            {activeReminders.length > 0 && <span className="text-xs">{activeReminders.length}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Add Reminder</Label>
              <Select value={reminderType} onValueChange={(value: "specific" | "before_due") => setReminderType(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="specific">Specific Date & Time</SelectItem>
                  {dueDate && <SelectItem value="before_due">Before Due Date</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {reminderType === "specific" && (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !selectedDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => isBefore(date, new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-sm">Time</Label>
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {reminderType === "before_due" && dueDate && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-sm">Amount</Label>
                    <Input
                      type="number"
                      min="1"
                      value={beforeDueAmount}
                      onChange={(e) => setBeforeDueAmount(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm">Unit</Label>
                    <Select
                      value={beforeDueUnit}
                      onValueChange={(value: "minutes" | "hours" | "days") => setBeforeDueUnit(value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={addReminder}
              disabled={(reminderType === "specific" && !selectedDate) || (reminderType === "before_due" && !dueDate)}
              className="w-full"
              size="sm"
            >
              Add Reminder
            </Button>

            {reminders.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-sm font-medium">Current Reminders</Label>
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReminder(reminder.id)}
                        className="h-6 w-6 p-0"
                      >
                        {reminder.enabled ? (
                          <Bell className="h-3 w-3 text-primary" />
                        ) : (
                          <BellOff className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                      <span className={cn(!reminder.enabled && "text-muted-foreground line-through")}>
                        {format(reminder.datetime, "MMM d, h:mm a")}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReminder(reminder.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
