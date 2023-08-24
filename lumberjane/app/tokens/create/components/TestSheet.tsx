import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Input,
  ScrollBar,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui'
import { Button, ScrollArea, Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui'
import { SubmitHandler, UseFormReturn } from 'react-hook-form'
import type { TestVariable } from './TokenForm'


interface TestSheetProps {
  form: UseFormReturn<{
    name: string
    description: string
    endpoint: string
    request: string
    expectedResponse: string
    method: string
    logEnabled: boolean
    logResponse: boolean
    key: string
    aiEnabled: boolean
    openAIKey: string
    restrictions: never[]
    authType: string
  }, any, undefined>
  onTest: SubmitHandler<any>
  isTesting: boolean
  testResult: string | null
  testVariables: TestVariable[]
  setTestVariables: (variables: TestVariable[]) => void
}

export default function TestSheet({ form, onTest, isTesting, testResult, testVariables, setTestVariables }: TestSheetProps) {
  const handleAddVariable = () => {
    const newVariables = [...testVariables, { '' : '' }]
    setTestVariables(newVariables)
  }
  
  const handleDeleteVariable = (index: number) => {
    const newVariables = [...testVariables]
    newVariables.splice(index, 1)
    setTestVariables(newVariables)
    console.log(testVariables)
  }

  const handleKeyChange = (index: number, key: string) => {
    const newVariables = [...testVariables]
    // if the old key had a value copy the value
    if (newVariables[index][Object.keys(newVariables[index])[0]]) {
      newVariables[index] = { [key]: newVariables[index][Object.keys(newVariables[index])[0]] }
    } else {
      newVariables[index] = { [key]: '' }
    }
    setTestVariables(newVariables)
    console.log(testVariables)

  }

  const handleValueChange = (index: number, value: string) => {
    const newVariables = [...testVariables]
    newVariables[index] = { [Object.keys(newVariables[index])[0]]: value }
    setTestVariables(newVariables)
    console.log(testVariables)
  }


  return (
    <Sheet>
      <SheetTrigger>
        <TooltipProvider>
          <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="text-xl text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center justify-center gap-2 px-4 py-2 rounded-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
                  </svg>
                  <span>Test Token</span>
                </Button>
              </TooltipTrigger>
            <TooltipContent>
              <p>Test your token</p>
            </TooltipContent>
          </Tooltip>
          </TooltipProvider>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-2/3">
        <SheetHeader className='justify-center'>
          <SheetTitle>Test Your Token</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-center">
          <Accordion type='multiple' className='w-full'>
            <AccordionItem value="testing-variables">
              <AccordionTrigger>Additional Variables</AccordionTrigger>
              <AccordionContent>
                {testVariables.map((testVariable, index) => (
                  <TestVariable
                    key={index}
                    variableKey={Object.keys(testVariable)[0] as string}
                    index={index}
                    value={Object.values(testVariable)[0] as string}
                    onKeyChange={handleKeyChange}
                    onValueChange={handleValueChange}
                    onDelete={handleDeleteVariable}
                  />
                ))}
                <Button onClick={handleAddVariable}>Add Variable</Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="response">
              <AccordionTrigger>Response</AccordionTrigger>
              <AccordionContent>
                {isTesting ? (
                  <div>Loading...</div>
                ) : (
                  <ScrollArea className="h-72 w-full rounded-md border">
                    <pre>{testResult}</pre>
                    <ScrollBar orientation='horizontal' className='w-full' />
                  </ScrollArea>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <SheetFooter className='mt-3'>
          <Button
              onClick={form.handleSubmit(onTest)}
              disabled={isTesting}
            >
              {isTesting ? 'Testing...' : 'Test Token'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}


//Code for the TestVariable component

interface TestVariableProps {
  index: number
  variableKey: string
  value: string
  onKeyChange: (index: number, key: string) => void
  onValueChange: (index: number, value: string) => void
  onDelete: (index: number) => void
}

function TestVariable({ index, variableKey, value, onKeyChange, onValueChange, onDelete }: TestVariableProps) {
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value
    onKeyChange(index, newKey)
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onValueChange(index, newValue)
  }

  const handleDelete = () => {
    onDelete(index)
  }

  return (
    <div className="flex items-center space-x-2 mb-2">
      <Input type="text" placeholder="Key" value={variableKey} onChange={handleKeyChange} onBlur={handleKeyChange} />
      <Input type="text" placeholder="Value" value={value} onChange={handleValueChange} onBlur={handleValueChange} />
      <Button onClick={handleDelete}>Delete</Button>
    </div>
  )
}