'use client'
import { Key, KeyId } from "@/types"
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
import { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

//This component is a shadcn dropdown menu that displays the user's keys. Each key will be displayed by it's name
//and when hovered will display the description as a tooltip. When clicked the 'selectKey' callback will be execute
//at the end the dropdown will have a 'create new key' button that will execute the 'createKey' callback  

//Props for typescript
type KeyDropdownProps = {
  setSelectedKey: (keyId: KeyId) => void
  addNewKey: () => void
};

type DropdownKey = {
  id: KeyId
  name: string
  description: string
}

export default function KeyDropdown({ setSelectedKey, addNewKey } : KeyDropdownProps) {
  const supabase = createClientComponentClient()
  const [keys, setKeys] = useState<DropdownKey[]>([])
  const [open, setOpen] = useState(false)
  const [pickedKey, setPickedKey] = useState<Key | null>(null)

  const fetchKeys = async () => {
    try {
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

  //Fetch the user's session and get keys from the database on mount
  useEffect(() => {
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
            {keys.map((key) => (
              <CommandItem
                key={key.id}
                value={key.name}
                onSelect={() => {
                  setPickedKey(key);
                  setOpen(false);
                  setSelectedKey(key.id);
                }}
              >
                {key.name}
              </CommandItem>
            ))}
            <CommandItem onSelect={() => {
              addNewKey();
              setOpen(false);
              setPickedKey(null);
            }}
            >+ Add New Key</CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


