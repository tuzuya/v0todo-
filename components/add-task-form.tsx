"use client"

import type React from "react"

import { useState, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, CalendarIcon, Tag, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ColorPicker } from "./color-picker"
import { ReminderPicker } from "./reminder-picker"

interface Reminder {
  id: string
  datetime: Date
  type: "specific" | "before_due" | "recurring"
  message?: string
  enabled: boolean
}

interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: Date
  tags?: string[]
  color?: string
  priority?: "low" | "medium" | "high"
  dueDate?: Date
  reminders?: Reminder[]
  subtasks?: Task[]
}

interface AddTaskFormProps {
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => void
}

export const AddTaskForm = forwardRef<HTMLInputElement, AddTaskFormProps>(({ onAddTask }, ref) => {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | undefined>()
  const [dueDate, setDueDate] = useState<Date>()
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [color, setColor] = useState<string>()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = () => {
    if (title.trim()) {
      onAddTask({
        title: title.trim(),
        completed: false,
        priority,
        dueDate,
        tags: tags.length > 0 ? tags : undefined,
        color,
        reminders: reminders.length > 0 ? reminders : undefined,
      })

      // Reset form
      setTitle("")
      setPriority(undefined)
      setDueDate(undefined)
      setTags([])
      setColor(undefined)
      setReminders([])
      setIsExpanded(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Card
      className={cn(
        "mb-6 shadow-sm border-2 border-dashed border-border transition-all duration-300",
        "hover:border-primary/50 hover:shadow-md focus-within:border-primary/70 focus-within:shadow-lg",
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main Input */}
          <div className="flex gap-2">
            <Input
              ref={ref}
              placeholder="Add a new task..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsExpanded(true)}
              className={cn(
                "flex-1 border-0 shadow-none text-base placeholder:text-muted-foreground/60",
                "focus:ring-2 focus:ring-primary/20 transition-all duration-200",
              )}
            />
            <Button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className={cn(
                "px-4 shadow-sm transition-all duration-200",
                "hover:scale-105 active:scale-95 disabled:hover:scale-100",
              )}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Expanded Options */}
          {isExpanded && (
            <div className="space-y-3 pt-2 border-t border-border/50 animate-in slide-in-from-top-2 fade-in duration-300">
              {/* Priority, Due Date, Color & Reminders */}
              <div className="flex gap-2 flex-wrap">
                <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                  <SelectTrigger className="w-32 hover:border-primary/50 transition-colors duration-200">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal transition-all duration-200 hover:border-primary/50",
                        !dueDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                  </PopoverContent>
                </Popover>

                <ColorPicker color={color} onColorChange={setColor} />

                <ReminderPicker reminders={reminders} dueDate={dueDate} onRemindersChange={setReminders} />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 flex-1">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                      className="border-0 shadow-none text-sm focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                  <Button
                    onClick={addTag}
                    disabled={!newTag.trim()}
                    variant="outline"
                    size="sm"
                    className="hover:scale-105 active:scale-95 transition-all duration-200 bg-transparent"
                  >
                    Add
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={cn(
                          "text-xs px-2 py-1 bg-primary/10 text-primary transition-all duration-200",
                          "animate-in fade-in slide-in-from-bottom-1 hover:scale-105",
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive transition-colors duration-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsExpanded(false)
                    setPriority(undefined)
                    setDueDate(undefined)
                    setTags([])
                    setColor(undefined)
                    setReminders([])
                  }}
                  className="hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!title.trim()}
                  size="sm"
                  className="hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Add Task
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

AddTaskForm.displayName = "AddTaskForm"
