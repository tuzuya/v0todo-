"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Tag, Plus, X, Check } from "lucide-react"

interface TaskTagEditorProps {
  taskTags: string[]
  allTags: string[]
  onUpdateTags: (tags: string[]) => void
}

export function TaskTagEditor({ taskTags, allTags, onUpdateTags }: TaskTagEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newTag, setNewTag] = useState("")

  const addTag = (tag: string) => {
    if (tag.trim() && !taskTags.includes(tag.trim())) {
      onUpdateTags([...taskTags, tag.trim()])
    }
  }

  const removeTag = (tagToRemove: string) => {
    onUpdateTags(taskTags.filter((tag) => tag !== tagToRemove))
  }

  const addNewTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim())
      setNewTag("")
      setIsOpen(false)
    }
  }

  const availableTags = allTags.filter((tag) => !taskTags.includes(tag))

  return (
    <div className="space-y-2">
      {/* Current Tags */}
      {taskTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {taskTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary">
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add Tags */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs bg-transparent">
            <Tag className="h-3 w-3 mr-1" />
            Add tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command>
            <div className="flex items-center border-b px-3">
              <CommandInput placeholder="Search or create tag..." value={newTag} onValueChange={setNewTag} />
              {newTag.trim() && !allTags.includes(newTag.trim()) && (
                <Button onClick={addNewTag} size="sm" className="ml-2 h-6 px-2 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Create
                </Button>
              )}
            </div>
            <CommandList>
              {availableTags.length > 0 ? (
                <CommandGroup>
                  {availableTags.map((tag) => (
                    <CommandItem
                      key={tag}
                      onSelect={() => {
                        addTag(tag)
                        setIsOpen(false)
                      }}
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      {tag}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty>{newTag.trim() ? "Press Create to add this tag" : "No tags available"}</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
