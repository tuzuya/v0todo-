"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AnimatedTaskCard } from "@/components/animated-task-card"
import { AddTaskForm } from "@/components/add-task-form"
import { TagManager } from "@/components/tag-manager"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { useNotifications } from "@/hooks/use-notifications"
import { Toaster } from "@/components/ui/toaster"

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

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTaskIds, setNewTaskIds] = useState<Set<string>>(new Set())
  const addTaskFormRef = useRef<HTMLInputElement>(null)

  useNotifications(tasks)

  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }

    setNewTaskIds((prev) => new Set([...prev, newTask.id]))
    setTimeout(() => {
      setNewTaskIds((prev) => {
        const updated = new Set(prev)
        updated.delete(newTask.id)
        return updated
      })
    }, 3000)

    setTasks((prev) => [newTask, ...prev])
  }

  const focusAddTask = () => {
    addTaskFormRef.current?.focus()
  }

  const toggleTask = (id: string) => {
    const updateTaskRecursively = (taskList: Task[]): Task[] => {
      return taskList.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, completed: !task.completed }

          if (updatedTask.completed && updatedTask.subtasks) {
            updatedTask.subtasks = updatedTask.subtasks.map((subtask) => ({
              ...subtask,
              completed: true,
              subtasks: subtask.subtasks ? subtask.subtasks.map((st) => ({ ...st, completed: true })) : undefined,
            }))
          }

          return updatedTask
        }

        if (task.subtasks) {
          const updatedSubtasks = updateTaskRecursively(task.subtasks)
          const updatedTask = { ...task, subtasks: updatedSubtasks }

          if (updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed) && !updatedTask.completed) {
            updatedTask.completed = true
          } else if (updatedSubtasks.some((st) => !st.completed) && updatedTask.completed) {
            updatedTask.completed = false
          }

          return updatedTask
        }

        return task
      })
    }

    setTasks(updateTaskRecursively)
  }

  const deleteTask = (id: string) => {
    const deleteTaskRecursively = (taskList: Task[]): Task[] => {
      return taskList
        .filter((task) => task.id !== id)
        .map((task) => ({
          ...task,
          subtasks: task.subtasks ? deleteTaskRecursively(task.subtasks) : undefined,
        }))
    }

    setTasks(deleteTaskRecursively)
  }

  const addSubtask = (parentId: string, title: string) => {
    const addSubtaskRecursively = (taskList: Task[]): Task[] => {
      return taskList.map((task) => {
        if (task.id === parentId) {
          const newSubtask: Task = {
            id: crypto.randomUUID(),
            title,
            completed: false,
            createdAt: new Date(),
          }

          setNewTaskIds((prev) => new Set([...prev, newSubtask.id]))
          setTimeout(() => {
            setNewTaskIds((prev) => {
              const updated = new Set(prev)
              updated.delete(newSubtask.id)
              return updated
            })
          }, 3000)

          return {
            ...task,
            subtasks: [...(task.subtasks || []), newSubtask],
          }
        }

        if (task.subtasks) {
          return {
            ...task,
            subtasks: addSubtaskRecursively(task.subtasks),
          }
        }

        return task
      })
    }

    setTasks(addSubtaskRecursively)
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updateTaskRecursively = (taskList: Task[]): Task[] => {
      return taskList.map((task) => {
        if (task.id === id) {
          return { ...task, ...updates }
        }

        if (task.subtasks) {
          return {
            ...task,
            subtasks: updateTaskRecursively(task.subtasks),
          }
        }

        return task
      })
    }

    setTasks(updateTaskRecursively)
  }

  const countTasksRecursively = (taskList: Task[]): { total: number; completed: number } => {
    let total = 0
    let completed = 0

    taskList.forEach((task) => {
      total++
      if (task.completed) completed++

      if (task.subtasks) {
        const subtaskCounts = countTasksRecursively(task.subtasks)
        total += subtaskCounts.total
        completed += subtaskCounts.completed
      }
    })

    return { total, completed }
  }

  const { total: totalCount, completed: completedCount } = countTasksRecursively(tasks)

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }

    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const aPriority = priorityOrder[a.priority || "low"]
    const bPriority = priorityOrder[b.priority || "low"]

    if (aPriority !== bPriority) {
      return bPriority - aPriority
    }

    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime()
    }

    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  const getAllTags = (taskList: Task[]): string[] => {
    const tags = new Set<string>()

    const extractTags = (task: Task) => {
      task.tags?.forEach((tag) => tags.add(tag))
      task.subtasks?.forEach(extractTags)
    }

    taskList.forEach(extractTags)
    return Array.from(tags).sort()
  }

  const allTags = getAllTags(tasks)

  const filterTasksByTags = (taskList: Task[]): Task[] => {
    if (selectedTags.length === 0) return taskList

    return taskList
      .filter((task) => {
        const taskMatchesTags = task.tags?.some((tag) => selectedTags.includes(tag)) || false
        const subtaskMatchesTags = task.subtasks ? filterTasksByTags(task.subtasks).length > 0 : false

        return taskMatchesTags || subtaskMatchesTags
      })
      .map((task) => ({
        ...task,
        subtasks: task.subtasks ? filterTasksByTags(task.subtasks) : undefined,
      }))
  }

  const filteredTasks = filterTasksByTags(sortedTasks)

  return (
    <>
      <KeyboardShortcuts onAddTask={focusAddTask} />
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2 text-balance animate-in fade-in slide-in-from-top-4 duration-700">
              My Tasks
            </h1>
            <p className="text-muted-foreground text-pretty animate-in fade-in slide-in-from-top-4 duration-700 delay-150">
              Stay organized and productive with your personal task manager
            </p>
            {totalCount > 0 && (
              <div className="mt-4 flex items-center justify-center gap-4 text-sm animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full transition-all duration-300 hover:scale-105">
                  {completedCount} of {totalCount} completed
                </div>
                {completedCount > 0 && (
                  <div className="text-muted-foreground">{Math.round((completedCount / totalCount) * 100)}% done</div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar with Tag Manager */}
            <div className="lg:col-span-1 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <TagManager
                    tasks={tasks}
                    selectedTags={selectedTags}
                    onTagFilter={setSelectedTags}
                    onUpdateTaskTags={(taskId, tags) => updateTask(taskId, { tags })}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
              {/* Add Task Form */}
              <AddTaskForm onAddTask={addTask} ref={addTaskFormRef} allTags={allTags} />

              {/* Tasks List */}
              <div className="space-y-4">
                {selectedTags.length > 0 && (
                  <div className="text-sm text-muted-foreground animate-in fade-in duration-300">
                    Showing {filteredTasks.length} of {tasks.length} tasks matching selected tags
                  </div>
                )}

                {tasks.length === 0 ? (
                  <Card className="border-dashed hover:border-primary/50 transition-colors duration-300">
                    <CardContent className="p-12 text-center">
                      <div className="text-muted-foreground space-y-2 animate-in fade-in zoom-in duration-500">
                        <p className="text-lg font-medium">No tasks yet</p>
                        <p className="text-sm">Add your first task above to get started!</p>
                        <p className="text-xs text-muted-foreground/60 mt-4">
                          Tip: Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘K</kbd> to quickly add a
                          task
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : filteredTasks.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-12 text-center">
                      <div className="text-muted-foreground space-y-2 animate-in fade-in zoom-in duration-500">
                        <p className="text-lg font-medium">No tasks match the selected tags</p>
                        <p className="text-sm">Try adjusting your tag filters or add new tasks</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredTasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <AnimatedTaskCard
                          task={task}
                          onToggle={toggleTask}
                          onDelete={deleteTask}
                          onAddSubtask={addSubtask}
                          onUpdateTask={updateTask}
                          allTags={allTags}
                          isNew={newTaskIds.has(task.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  )
}
