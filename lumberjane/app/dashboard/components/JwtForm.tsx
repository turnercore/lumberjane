'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui";
import { useState } from "react";
import type { KeyId } from "@/types"
import KeysDropdown from "./KeysDropdown";

const jwtSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
  // Add other fields as needed
});

export default function JwtForm() {
  const [selectedKey, setSelectedKey] = useState<KeyId>('');
  
  const addNewKey = () => {
    console.log("Adding new key!");
  }


  const form = useForm({
    resolver: zodResolver(jwtSchema),
  });

  const onSubmit = (data: any) => {
    console.log(data);
    // Handle submission logic here
  };

  return (
    <Card >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="General OpenAI Integration" {...field} />
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="This is a general integration for OpenAI." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <KeysDropdown setSelectedKey={setSelectedKey} addNewKey={addNewKey} />
          {/* Other sections will go here */}
          <Button type="submit">Create JWT</Button>
        </form>
      </Form>
    </Card>
  );
}
