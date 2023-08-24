import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui"
import { exampleTokens } from "./examples/exampleTokens"
import { TokenFormFields } from "@/types"

type TestCase = Partial<TokenFormFields>

export function TestCasesCombobox({
  handleFillForm,
  handleClearForm,
}: {
  handleFillForm: (testCase: any) => void
  handleClearForm: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <div className="flex gap-4 justify-between">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
            defaultValue=''
          >
            {value
              ? exampleTokens.find((testCase: TestCase) => testCase.name === value)?.name
              : "Token Templates..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Example Tokens" />
            <CommandEmpty>No Templates Found...</CommandEmpty>
            <CommandGroup>
              {exampleTokens.map((testCase: TestCase) => (
                <CommandItem
                  key={testCase.name}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                    handleClearForm() // Clear the form first
                    handleFillForm(testCase) // Call the handler with the selected test case
                  }}
                >
                  <Check
                    className={value === testCase.name ? "opacity-100" : "opacity-0"}
                  />
                  {testCase.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <Button onClick={handleClearForm}>Clear Form</Button>
    </div>
  )
}
