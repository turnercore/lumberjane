'use client'
import React, { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  DialogFooter,
  DialogClose,
  Switch,
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  Input,
  Label,
  FormLabel,
} from '@/components/ui'
import { Key } from '@/types'
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FieldValues, useForm } from "react-hook-form"
import { v4 as uuidv4, validate as uuidValidate } from 'uuid'

type KeyAddDialogProps = {
  onAddKey?: (key: Key) => void
  children: React.ReactNode
}

const KeySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1, 'Name your key!'),
    description: z.string().optional(),
    decryptedValue: z.string().min(1, 'Enter a key!'),
    isSecret: z.boolean(),
    password: z.string().optional(),
  })
  .superRefine((obj, ctx) => {
    if (obj.isSecret && !obj.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password is required when isSecret is true',
        path: ['password'],
      })
    }
    if (!uuidValidate(obj.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid UUID',
        path: ['id'],
      })
    }
  })

const KeyAddDialog = ({ onAddKey, children }: KeyAddDialogProps) => {

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(KeySchema),
    defaultValues: {
      id: uuidv4(),
      name: '',
      description: '',
      decryptedValue: '',
      isSecret: false,
      password: '',
    },

  })

  //On mount set a random uuid for the key id
  useEffect(() => {
    form.setValue('id', uuidv4())
  }, [form])

  const onSubmit = (data: FieldValues) => {
    fetch('/api/v1/keys/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Add key to state
          if (onAddKey) onAddKey(data.key)
        } else {
          console.log('Error creating key!')
        }
      })
      .catch((error: any) => {
        console.log('Error creating key!')
      })
    
    
    // Update parent
    const key: Key = {
      id: data.id,
      name: data.name,
      description: data.description,
      decryptedValue: data.decryptedValue,
      isSecret: data.isSecret
    }

    if (onAddKey) onAddKey(key)
    //If no onAddKey, refresh page to make sure the new key is in the list
    else window.location.reload()

    form.reset()
    // Get a new uuid for the next key
    form.setValue('id', uuidv4())
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Key</DialogTitle>
          <DialogDescription>Fill in the details for the new key.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="text" placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="text" placeholder="Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="decryptedValue"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="text" placeholder="Key" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isSecret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Double Encrypt Key</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={(checked) => form.setValue("isSecret", checked)} />
                </FormControl>
                <FormDescription>
                  This will encrypt the key in the database. The key will be decrypted when it is requested.
                  The keys are already encrypted in the database by default, but this will encrypt the key with a password that you specify.
                  Use this if you want the key to be inaccessable to database administrators.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('isSecret') && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Double-Encryption Password
                  </FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Password" {...field} />
                  </FormControl>
                  <FormDescription>
                    <h4>Extra password used to double-encrypt the key.</h4>
                    <p className="font-bold text-red-500"> WARNING: If you lose this password the key will be unrecoverable.</p>
                    <p>You must include this password as a &apostoken_password&apos field in your request with ANY TOKEN made with this key.</p>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit">Confirm</Button>
            </DialogClose>
          </DialogFooter>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default KeyAddDialog
