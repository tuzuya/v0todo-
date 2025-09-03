"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, Plus, X, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: Date
  tags?: string[]
  color?: string
  priority?: "low" | "medium" | "high"
  dueDate?: Date
  subtasks?: Task[]
}

interface TagManagerProps {
  tasks: Task[]
  selectedTags: string[]
  onTagFilter: (tags: string[]) => void
  onUpdateTaskTags: (taskId: string, tags: string[]) => void
}

export function TagManager({ tasks, selectedTags, onTagFilter, onUpdateTaskTags }: TagManagerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Extract all unique tags from tasks (including subtasks)
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

  // Get tag usage statistics
  const getTagStats = (tag: string): number => {
    let count = 0

    const countTag = (task: Task) => {
      if (task.tags?.includes(tag)) count++
      task.subtasks?.forEach(countTag)
    }

    tasks.forEach(countTag)
    return count
  }

  const toggleTag = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]

    onTagFilter(newSelectedTags)
  }

  const clearAllFilters = () => {
    onTagFilter([])
  }

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by Tags</span>
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedTags.length} active
            </Badge>
          )}
        </div>

        {selectedTags.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className="text-xs px-2 py-1 bg-primary text-primary-foreground cursor-pointer hover:bg-primary/80"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      {/* Available Tags */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {allTags.slice(0, 8).map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={cn(
                  "text-xs px-2 py-1 cursor-pointer transition-colors",
                  selectedTags.includes(tag)
                    ? "bg-primary text-primary-foreground hover:bg-primary/80"
                    : "hover:bg-primary/10 hover:text-primary",
                )}
                onClick={() => toggleTag(tag)}
              >
                {tag} ({getTagStats(tag)})
              </Badge>
            ))}
          </div>

          {allTags.length > 8 && (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs bg-transparent">
                  <Plus className="h-3 w-3 mr-1" />
                  Show all tags ({allTags.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <Command>
                  <CommandInput placeholder="Search tags..." />
                  <CommandList>
                    <CommandEmpty>No tags found.</CommandEmpty>
                    <CommandGroup>
                      {allTags.map((tag) => (
                        <CommandItem
                          key={tag}
                          onSelect={() => {
                            toggleTag(tag)
                            setIsOpen(false)
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", selectedTags.includes(tag) ? "opacity-100" : "opacity-0")}
                          />
                          <span className="flex-1">{tag}</span>
                          <Badge variant="secondary" className="text-xs">
                            {getTagStats(tag)}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
    </div>
  )
}
