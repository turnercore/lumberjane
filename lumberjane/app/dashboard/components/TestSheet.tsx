import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Input,
} from '@/components/ui';
import { Button, ScrollArea, Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import type { TestVariable } from './JwtForm';


interface TestSheetProps {
  form: UseFormReturn<{
    name: string;
    description: string;
    endpoint: string;
    request: string;
    expectedResponse: string;
    method: string;
    logEnabled: boolean;
    logResponse: boolean;
    key: string;
    aiEnabled: boolean;
    openAIKey: string;
    restrictions: never[];
    authType: string;
  }, any, undefined>;
  onTest: SubmitHandler<any>;
  isTesting: boolean;
  testResult: string | null;
  testVariables: TestVariable[];
  setTestVariables: (variables: TestVariable[]) => void;
}

export default function TestSheet({ form, onTest, isTesting, testResult, testVariables, setTestVariables }: TestSheetProps) {
  const handleAddVariable = () => {
    const newVariables = [...testVariables, { '' : '' }];
    setTestVariables(newVariables);
  };
  
  const handleDeleteVariable = (index: number) => {
    const newVariables = [...testVariables];
    newVariables.splice(index, 1);
    setTestVariables(newVariables);
    console.log(testVariables);
  };

  const handleKeyChange = (index: number, key: string) => {
    const newVariables = [...testVariables];
    // if the old key had a value copy the value
    if (newVariables[index][Object.keys(newVariables[index])[0]]) {
      newVariables[index] = { [key]: newVariables[index][Object.keys(newVariables[index])[0]] };
    } else {
      newVariables[index] = { [key]: '' };
    }
    setTestVariables(newVariables);
    console.log(testVariables);

  };

  const handleValueChange = (index: number, value: string) => {
    const newVariables = [...testVariables];
    newVariables[index] = { [Object.keys(newVariables[index])[0]]: value };
    setTestVariables(newVariables);
    console.log(testVariables);
  };


  return (
    <Sheet>
      <SheetTrigger>
        <Button type="button">Test</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-2/3">
        <SheetHeader className='justify-center'>
          <SheetTitle>Test Your Token</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            onClick={form.handleSubmit(onTest)}
            disabled={isTesting}
          >
            {isTesting ? 'Testing...' : 'Test Token'}
          </button>
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
                  </ScrollArea>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <SheetFooter></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}


//Code for the TestVariable component

interface TestVariableProps {
  index: number;
  variableKey: string;
  value: string;
  onKeyChange: (index: number, key: string) => void;
  onValueChange: (index: number, value: string) => void;
  onDelete: (index: number) => void;
}

function TestVariable({ index, variableKey, value, onKeyChange, onValueChange, onDelete }: TestVariableProps) {
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    onKeyChange(index, newKey);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onValueChange(index, newValue);
  };

  const handleDelete = () => {
    onDelete(index);
  };

  return (
    <div className="flex items-center space-x-2 mb-2">
      <Input type="text" placeholder="Key" value={variableKey} onChange={handleKeyChange} onBlur={handleKeyChange} />
      <Input type="text" placeholder="Value" value={value} onChange={handleValueChange} onBlur={handleValueChange} />
      <Button onClick={handleDelete}>Delete</Button>
    </div>
  );
}