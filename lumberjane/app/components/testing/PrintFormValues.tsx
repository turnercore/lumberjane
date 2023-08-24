'use client'
import { useState } from "react"
import { Button, Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, ScrollArea, ScrollBar } from "@/components/ui"
import type { UseFormReturn } from 'react-hook-form'

type Props = {
  form: UseFormReturn<any>
}

function PrintFormValues({ form }: Props) {
  const [formVariables, setFormVariables] = useState("")

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setFormVariables(JSON.stringify(form.getValues(), null, 2))
    }
  }

  return (
    <>
      <Dialog onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant='outline'>
            Print Form Values
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-full max-h-full h-2/3 w-2/3">
          <DialogHeader> 
            <DialogTitle>Form Values</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-full w-full rounded-md border">
            <pre>{formVariables}</pre>
            <ScrollBar orientation='horizontal' className='w-full' />
          </ScrollArea>
        <DialogFooter>
          <DialogClose>
            <Button>
              Ok, thanks.
            </Button>
          </DialogClose>
        </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PrintFormValues