"use client"

import { useEffect, useCallback } from "react"

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

export function useNotifications(tasks: Task[]) {
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }

    return false
  }, [])

  const showNotification = useCallback((task: Task, reminder: Reminder) => {
    if (Notification.permission !== "granted") return

    const notification = new Notification(`Reminder: ${task.title}`, {
      body: reminder.message || `Don't forget about this task!`,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: `task-${task.id}-${reminder.id}`,
      requireInteraction: true,
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close()
    }, 10000)
  }, [])

  const checkReminders = useCallback(() => {
    const now = new Date()
    const checkTime = new Date(now.getTime() + 60000) // Check 1 minute ahead

    const getAllTasks = (taskList: Task[]): Task[] => {
      const allTasks: Task[] = []

      const addTask = (task: Task) => {
        allTasks.push(task)
        if (task.subtasks) {
          task.subtasks.forEach(addTask)
        }
      }

      taskList.forEach(addTask)
      return allTasks
    }

    const allTasks = getAllTasks(tasks)

    allTasks.forEach((task) => {
      if (task.completed || !task.reminders) return

      task.reminders.forEach((reminder) => {
        if (!reminder.enabled) return

        const reminderTime = new Date(reminder.datetime)

        // Check if reminder should fire (within the next minute)
        if (reminderTime <= checkTime && reminderTime > now) {
          showNotification(task, reminder)
        }
      })
    })
  }, [tasks, showNotification])

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  useEffect(() => {
    // Check reminders every 30 seconds
    const interval = setInterval(checkReminders, 30000)

    // Also check immediately
    checkReminders()

    return () => clearInterval(interval)
  }, [checkReminders])

  return { requestPermission }
}
