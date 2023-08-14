'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  Textarea,
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Switch,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { FieldValues, useForm } from "react-hook-form";
import { useState } from "react";
import type { JwtTokenRequest, KeyId } from "@/types"
import KeysDropdown from "./KeysDropdown";
import { useRouter } from "next/navigation";
import RestrictionsDropdown from "./RestrictionsDropdown";

const expectedResponseExplainer: string = `
(Optional) Expected response from the endpoint. 
Format should be a JSON string with types instead of values.
Example:  { "name" : "string", "age" : "number" } 
Only fields here will be returned. You can omit fields to make sure they are not returned with the response.
You can enable AI Assist to help find fields and make sure the response conforms to expected response.
If the fields cannot be found the server will return an error and no data.
`;



const isValidJSON = (value: string) => {
  if(value == '') return true;
  else {
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  }
};

const jwtSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).default(''),
  description: z.string().default('').optional(),
  endpoint: z.string().url({
    message: "Endpoint must be a valid URL.",
  }),
  request: z.string().min(2, {
    message: "Request must be at least 2 characters.",
  }).refine(isValidJSON, {
    message: "Request must be a valid JSON object.",
  }).default(''),
  expectedResponse: z.string().refine(isValidJSON, {
    message: "Expected Response must be a valid JSON object.",
  }).default('').optional(),
  method: z.enum(["POST", "GET", "DELETE", "PUT", "PATCH"]).default("POST"),
  logEnabled: z.boolean().default(false),
  logResponse: z.boolean().default(false),
  key: z.string().min(5, { message: "You must select an API key to use for the request." }),
  aiEnabled: z.boolean().default(false),
  openAIKey: z.string().optional().default(''),
});


export default function JwtForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addNewKey = () => {
    console.log("Adding new key!");
    //For now redirect to the /keys page
    router.push("/keys");
  }

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(jwtSchema),
    defaultValues: {
      name: "",
      description: "",
      endpoint: "",
      request: "",
      expectedResponse: "",
      method: "POST",
      logEnabled: false,
      logResponse: false,
      key: "",
      aiEnabled: false,
      openAIKey: "",
      restrictions: [],
    },

  });

  const onSubmit = async (data: FieldValues) => {
    console.log('Submitting form data:', data);
    //TODO ADD TOAST
    setIsLoading(true);
  
    // Check if AI Assist is enabled and validate the openAIKey field
    if (data.aiEnabled && (!data.openAIKey || data.openAIKey.length < 5)) {
      // Handle the validation error for openAIKey
      console.error("You must select an OpenAI key to use for the AI assist.");
      setIsLoading(false);
      return;
    }
  
    // Validate the rest of the data using jwtSchema
    const result = jwtSchema.safeParse(data);
  
    if (!result.success) {
      // Handle other validation errors
      console.error("Validation errors:", result.error);
      setIsLoading(false);
      return;
    }

    const jwtData: JwtTokenRequest = {
      name: data.name,
      description: data.description || '',
      endpoint: data.endpoint,
      method: data.method,
      request: data.request,
      expectedResponse: data.expectedResponse || '',
      key: data.key,
      restrictions: data.restrictions || [],
      logResponse: data.logResponse || false,
      logEnabled: data.logEnabled || false,
      aiEnabled: data.aiEnabled || false,
      openAIKey: data.openAIKey || '',
    };
  
    // Continue processing the valid data
    // Handle submission logic here
    //send data to api (/api/v1/jwt/create)
    const response = await fetch('/api/v1/jwt/create', {
      method: 'POST',
      body: JSON.stringify(jwtData),
    });

    const responseData = await response.json();
    console.log(responseData);
    setIsLoading(false);

  };
  
  return (
    <Card className="mx-auto max-w-3xl mb-20 p-3">
      <h1 className='text-center text-xl'>Create a New Request Token</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Lumberjane token." {...field} />
                </FormControl>
                <FormDescription>Name for the Token.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Description to help you remember what the token is for and who should use it." {...field} />
                </FormControl>
                <FormDescription>(Optional) description for the Token.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />         
          
          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key:</FormLabel>
                <FormControl>
                  <KeysDropdown onValueChange={field.onChange} addNewKey={addNewKey} />
                </FormControl>
                <FormDescription>API Key to use for the request.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endpoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endpoint</FormLabel>
                <FormControl>
                  <Input placeholder="https://api.example.com" {...field} />
                </FormControl>
                <FormDescription>Endpoint to use for the request, include the full url.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logEnabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Log Request</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={(checked) => form.setValue("logEnabled", checked)} />
                </FormControl>
                <FormDescription>Log who makes requests with the Token.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("logEnabled") && (
            <FormField
              control={form.control}
              name="logResponse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Log Response</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={(checked) => form.setValue("logResponse", checked)} />
                  </FormControl>
                  <FormDescription>Log the response recieved from the request. CAREFUL! This may contain sensitive information.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="aiEnabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AI Assist</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={(checked) => form.setValue("aiEnabled", checked)} />
                </FormControl><br />
                <FormDescription>Enable AI assist for the Token. This will use OpenAI to parse response into expected format. Must include expected response when using AI Assist.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("aiEnabled") && (
            <FormField
              control={form.control}
              name="openAIKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI Key</FormLabel>
                  <FormControl>
                    <KeysDropdown onValueChange={field.onChange} addNewKey={addNewKey} />
                  </FormControl>
                  <FormDescription>
                    (Required if AI Assist is on) Your OpenAI key to use for the AI assist. Add an OpenAI API Key to your account if you don't have one.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            )} 

          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Methods</SelectLabel>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                  </Select>
                  <FormDescription>Method to use for the request.</FormDescription>
                  <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="request"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Request</FormLabel>
                <FormControl>
                  <Textarea placeholder='{"key": "value"}' {...field} />
                </FormControl>
                <FormDescription>Request to send to the endpoint.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expectedResponse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Response</FormLabel>
                <FormControl>
                  <Textarea placeholder='{"key": "value"}' {...field} />
                </FormControl>
                <FormDescription>{expectedResponseExplainer}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="restrictions"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RestrictionsDropdown onValueChange={field.onChange} />
                </FormControl>
                <FormDescription>(Optional) restrictions for the Token. These will be applied to every request.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Other sections will go here */}
          <div className="flex justify-center">
            <Button type="submit" disabled={isLoading ? true : false} variant='outline' className="text-xl bg-green-200">Create Token</Button>
          </div>
        </form>
      </Form>
    </Card>
  );  
}