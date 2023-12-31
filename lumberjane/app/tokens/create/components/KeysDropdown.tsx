'use client'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {   
  Popover,
  PopoverContent,
  PopoverTrigger,  
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  Button,} from "@/components/ui"
import { useEffect, useState } from "react"
import { ChevronsUpDown } from "lucide-react"
import KeyAddDialog from "@/components/client/KeyAddDialog"
import type { Key, KeyId } from "@/types"
  
//This component is a shadcn dropdown menu that displays the user's keys. Each key will be displayed by it's name
//and when hovered will display the description as a tooltip. When clicked the 'selectKey' callback will be execute
//at the end the dropdown will have a 'create new key' button that will execute the 'createKey' callback  

//Props for typescript
type KeyDropdownProps = {
  onValueChange(value: string): void
  addNewKey: () => void
}

type DropdownKey = {
  id: KeyId
  name: string
  description: string
}

export default function KeyDropdown({ onValueChange, addNewKey } : KeyDropdownProps) {
  const [keys, setKeys] = useState<DropdownKey[]>([])
  const [open, setOpen] = useState(false)
  const [pickedKey, setPickedKey] = useState<Key | null>(null)



  const handleAddKey = (key: Key) => {
    if(!key || !key.id) return
    setPickedKey(key)
    setOpen(false)
    onValueChange(key.id)
  }

  //Fetch the user's session and get keys from the database on mount
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const supabase = createClientComponentClient()
        const { data, error } = await supabase.auth.getSession()
        if (error || !data || !data.session) {
          console.log("Error fetching session.")
          throw error || new Error("Error fetching session.")
        }
        const user = data.session.user || null
        if (!user) {
          throw new Error("User is not logged in.")
        }
  
        const { data: keys, error: keyError } = await supabase.from("keys").select("*").eq("userId", user.id)
        if (keyError) {
          console.log("Error fetching keys.")
          throw keyError
        }
  
        // Update keys with name and description
        const dropdownKeys: DropdownKey[] = []
        for (const key of keys) {
          dropdownKeys.push({
            id: key.id,
            name: key.name,
            description: key.description,
          })
        }
  
        setKeys(dropdownKeys)
  
      } catch(err) {
        console.log("Error fetching keys.")
        console.log(err)
      }
    }
    fetchKeys()
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {pickedKey ? pickedKey.name : "Select key..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search key..." />
          <CommandEmpty>No keys found.</CommandEmpty>
          <CommandGroup>
            <CommandItem onSelect={() => {
                }}
                >
                  <KeyAddDialog onAddKey={handleAddKey}><p> + Add New Key </p></KeyAddDialog>
            </CommandItem>
            {keys.map((key) => (
              <CommandItem
                key={key.id}
                value={key.name}
                onSelect={() => {
                  setPickedKey(key)
                  setOpen(false)
                  onValueChange(key.id)
                }}
              >
                {key.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


