"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Trash2, Clock, MoreVertical, ChevronDown, Plus, Edit, Palette, Bell, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, isWithinInterval, addMinutes } from "date-fns"
import { TaskTagEditor } from "./task-tag-editor"
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

interface TaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onAddSubtask: (parentId: string, title: string) => void
  onUpdateTask: (id: string, updates: Partial<Task>) => void
  allTags: string[]
  depth?: number
  isNew?: boolean
}

export function AnimatedTaskCard({
  task,
  onToggle,
  onDelete,
  onAddSubtask,
  onUpdateTask,
  allTags,
  depth = 0,
  isNew = false,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [isEditingColor, setIsEditingColor] = useState(false)
  const [isEditingReminders, setIsEditingReminders] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const [showNewBadge, setShowNewBadge] = useState(isNew)

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setShowNewBadge(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isNew])

  useEffect(() => {
    if (task.completed && !justCompleted) {
      setJustCompleted(true)
      const timer = setTimeout(() => setJustCompleted(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [task.completed, justCompleted])

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800"
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const isOverdue = task.dueDate && task.dueDate < new Date() && !task.completed
  const hasSubtasks = task.subtasks && task.subtasks.length > 0
  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0

  const getUpcomingReminder = () => {
    if (!task.reminders || task.completed) return null

    const now = new Date()
    const nextHour = addMinutes(now, 60)

    return task.reminders
      .filter((r) => r.enabled)
      .find((r) => isWithinInterval(new Date(r.datetime), { start: now, end: nextHour }))
  }

  const upcomingReminder = getUpcomingReminder()
  const activeReminders = task.reminders?.filter((r) => r.enabled) || []

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle.trim())
      setNewSubtaskTitle("")
      setIsAddingSubtask(false)
      setIsExpanded(true)
    }
  }

  const handleDelete = () => {
    setIsDeleting(true)
    setTimeout(() => onDelete(task.id), 300)
  }

  const handleToggle = () => {
    onToggle(task.id)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddSubtask()
    } else if (e.key === "Escape") {
      setIsAddingSubtask(false)
      setNewSubtaskTitle("")
    }
  }

  const handleUpdateTags = (newTags: string[]) => {
    onUpdateTask(task.id, { tags: newTags })
    setIsEditingTags(false)
  }

  const handleUpdateColor = (newColor: string | undefined) => {
    onUpdateTask(task.id, { color: newColor })
    setIsEditingColor(false)
  }

  const handleUpdateReminders = (newReminders: Reminder[]) => {
    onUpdateTask(task.id, { reminders: newReminders })
    setIsEditingReminders(false)
  }

  const getCardStyle = () => {
    if (!task.color) return {}

    return {
      borderLeftColor: depth > 0 ? task.color : undefined,
      borderTopColor: depth === 0 ? task.color : undefined,
      borderTopWidth: depth === 0 ? "3px" : undefined,
      backgroundColor: `${task.color}08`,
      boxShadow: task.color ? `0 0 0 1px ${task.color}20` : undefined,
    }
  }

  return (
    <div
      className={cn(
        "space-y-2 transition-all duration-500 ease-out",
        isNew && "animate-in slide-in-from-top-2 fade-in duration-700",
        isDeleting && "animate-out slide-out-to-right-2 fade-out duration-300 scale-95",
      )}
    >
      <Card
        className={cn(
          "transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:scale-[1.02] group relative overflow-hidden",
          "hover:-translate-y-1 active:scale-[0.98] active:transition-transform active:duration-75",
          task.completed && "opacity-70 hover:opacity-90 scale-[0.98]",
          justCompleted && "animate-pulse bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
          isOverdue && "border-destructive/50 bg-destructive/5 animate-pulse",
          upcomingReminder && "ring-2 ring-primary/50 ring-offset-1 animate-pulse",
          depth > 0 && "ml-6 border-l-4",
          depth === 0 && "shadow-sm border-t-4",
          !task.color && depth > 0 && "border-l-primary/30",
          !task.color && depth === 0 && "border-t-primary/30",
        )}
        style={getCardStyle()}
      >
        {justCompleted && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-purple-400/20 animate-pulse" />
        )}

        {showNewBadge && (
          <div className="absolute -top-1 -right-1 z-10">
            <Badge className="bg-primary text-primary-foreground animate-bounce shadow-lg">
              <Sparkles className="h-3 w-3 mr-1" />
              New
            </Badge>
          </div>
        )}

        <CardContent className="p-4 relative z-10">
          <div className="flex items-start gap-3">
            {hasSubtasks && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "h-5 w-5 p-0 mt-0.5 text-muted-foreground hover:text-foreground transition-all duration-200",
                  "hover:scale-110 active:scale-95",
                )}
              >
                <div className={cn("transition-transform duration-200", isExpanded ? "rotate-0" : "-rotate-90")}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </Button>
            )}

            <div className="relative">
              <Checkbox
                checked={task.completed}
                onCheckedChange={handleToggle}
                className={cn(
                  "h-5 w-5 mt-0.5 transition-all duration-300 hover:scale-110 active:scale-95",
                  task.completed && "animate-in zoom-in duration-200",
                )}
                style={{
                  borderColor: task.color && !task.completed ? task.color : undefined,
                  backgroundColor: task.completed && task.color ? task.color : undefined,
                }}
              />
              {justCompleted && <div className="absolute inset-0 animate-ping rounded border-2 border-green-400" />}
            </div>

            <div className="flex-1 space-y-2">
              {/* Task Title with Color Indicator */}
              <div className="flex items-center gap-2">
                {task.color && (
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full border border-white shadow-sm transition-all duration-200",
                      "hover:scale-125 hover:shadow-md",
                    )}
                    style={{ backgroundColor: task.color }}
                  />
                )}
                <span
                  className={cn(
                    "font-medium transition-all duration-300 text-balance",
                    task.completed && "line-through text-muted-foreground",
                    justCompleted && "text-green-600 dark:text-green-400",
                  )}
                >
                  {task.title}
                </span>
                {task.priority && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-2 py-0.5 transition-all duration-200 hover:scale-105",
                      getPriorityColor(task.priority),
                    )}
                  >
                    {task.priority}
                  </Badge>
                )}
                {activeReminders.length > 0 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-2 py-0.5 transition-all duration-200 hover:scale-105",
                      upcomingReminder
                        ? "bg-primary/10 text-primary border-primary/50 animate-pulse"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Bell className="h-3 w-3 mr-1" />
                    {activeReminders.length}
                  </Badge>
                )}
              </div>

              {(task.tags && task.tags.length > 0) || isEditingTags ? (
                <div className="space-y-2">
                  {!isEditingTags ? (
                    <div className="flex flex-wrap gap-1 items-center">
                      {task.tags!.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className={cn(
                            "text-xs px-2 py-0.5 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer",
                            "transition-all duration-200 hover:scale-105 active:scale-95",
                            "animate-in fade-in slide-in-from-bottom-1",
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
                          onClick={() => setIsEditingTags(true)}
                        >
                          {tag}
                        </Badge>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingTags(true)}
                        className={cn(
                          "h-6 w-6 p-0 text-muted-foreground hover:text-primary transition-all duration-200",
                          "opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95",
                        )}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                      <TaskTagEditor taskTags={task.tags || []} allTags={allTags} onUpdateTags={handleUpdateTags} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingTags(true)}
                    className="h-6 text-xs text-muted-foreground hover:text-primary hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add tags
                  </Button>
                </div>
              )}

              {/* Due Date & Created Time */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {task.dueDate && (
                  <div
                    className={cn(
                      "flex items-center gap-1 transition-colors duration-200",
                      isOverdue && "text-destructive font-medium animate-pulse",
                    )}
                  >
                    <Clock className="h-3 w-3" />
                    <span>Due {formatDistanceToNow(task.dueDate, { addSuffix: true })}</span>
                  </div>
                )}
                <span>Created {formatDistanceToNow(task.createdAt, { addSuffix: true })}</span>
              </div>

              {upcomingReminder && (
                <div className="flex items-center gap-1 text-xs text-primary font-medium animate-pulse">
                  <Bell className="h-3 w-3" />
                  <span>Reminder in {formatDistanceToNow(new Date(upcomingReminder.datetime))}</span>
                </div>
              )}

              {hasSubtasks && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%`,
                        backgroundColor: task.color || "hsl(var(--primary))",
                      }}
                    />
                  </div>
                  <span className="text-muted-foreground font-medium">
                    {completedSubtasks}/{totalSubtasks} subtasks
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              className={cn(
                "flex items-center gap-1 transition-all duration-300",
                "opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0",
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingSubtask(true)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:scale-110 active:scale-95 transition-all duration-200"
                title="Add subtask"
              >
                <Plus className="h-4 w-4" />
              </Button>

              <div className="relative">
                {isEditingColor ? (
                  <div className="animate-in zoom-in duration-200">
                    <ColorPicker color={task.color} onColorChange={handleUpdateColor} className="h-8 w-8 p-0" />
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingColor(true)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:scale-110 active:scale-95 transition-all duration-200"
                    title="Change color"
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="relative">
                {isEditingReminders ? (
                  <div className="animate-in zoom-in duration-200">
                    <ReminderPicker
                      reminders={task.reminders || []}
                      dueDate={task.dueDate}
                      onRemindersChange={handleUpdateReminders}
                      className="h-8 w-8 p-0"
                    />
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingReminders(true)}
                    className={cn(
                      "h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:scale-110 active:scale-95 transition-all duration-200",
                      activeReminders.length > 0 && "text-primary",
                    )}
                    title="Manage reminders"
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-200"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:scale-110 active:scale-95 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isAddingSubtask && (
            <div className="mt-3 pl-8 flex gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
              <Input
                placeholder="Add a subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 h-8 text-sm focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                autoFocus
              />
              <Button
                onClick={handleAddSubtask}
                disabled={!newSubtaskTitle.trim()}
                size="sm"
                className="h-8 px-3 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Add
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddingSubtask(false)
                  setNewSubtaskTitle("")
                }}
                size="sm"
                className="h-8 px-3 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {hasSubtasks && (
        <div
          className={cn(
            "space-y-2 transition-all duration-300 ease-out overflow-hidden",
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {task.subtasks!.map((subtask, index) => (
            <div
              key={subtask.id}
              className="animate-in slide-in-from-left-2 fade-in duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <AnimatedTaskCard
                task={subtask}
                onToggle={onToggle}
                onDelete={onDelete}
                onAddSubtask={onAddSubtask}
                onUpdateTask={onUpdateTask}
                allTags={allTags}
                depth={depth + 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
