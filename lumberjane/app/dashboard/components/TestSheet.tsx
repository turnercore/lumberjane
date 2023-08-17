import { Button, ScrollArea, Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui";
import { SubmitHandler, UseFormReturn } from "react-hook-form";


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
}, any, undefined>
  onTest: SubmitHandler<any>;
  isTesting: boolean;
  testResult: string | null;
}

export default function TestSheet({form, onTest, isTesting, testResult} : TestSheetProps)  {
  return (
    <Sheet>
    <SheetTrigger>
      <Button type="button">
          Test
      </Button>
    </SheetTrigger>
    <SheetContent side='bottom' className=" h-2/3">
      <SheetHeader>
        <SheetTitle>Test JWT</SheetTitle>
        
        <SheetDescription>
        {Object.keys(form.formState.errors).length > 0
          ? Object.values(form.formState.errors).map((error, index) => (
              <div key={index}>{error.message}</div>
            ))
          :
          <div>
            <h2>'Create a token and test it here.'</h2>
            <Button onClick={form.handleSubmit(onTest)}> Test Token</Button>
          </div>
        }
        </SheetDescription>
      </SheetHeader>
      {isTesting && <div>Loading...</div>}
      {!isTesting && <ScrollArea className="h-72 w-full rounded-md border"><pre>{testResult}</pre></ScrollArea>}
      <SheetFooter>
      </SheetFooter>
    </SheetContent>
  </Sheet>
  )
}