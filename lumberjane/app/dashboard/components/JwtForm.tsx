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
import type { TokenFormFields } from "@/types"
import KeysDropdown from "./KeysDropdown";
import { useRouter } from "next/navigation";
import RestrictionsDropdown from "./RestrictionsDropdown";
import { set } from "date-fns";
import TestSheet from "./TestSheet";
import { pokeApiExampleSnorlax, pokeApiExampleSnorlaxNameOnly } from "./examples/tokenExamples";
import { fromTheme } from "tailwind-merge";

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
    message: ")Endpoint must be a valid URL.",
  }),
  request: z.string().default('').optional(),
  expectedResponse: z.string().refine(isValidJSON, {
    message: "Expected Response must be a valid JSON object.",
  }).default('').optional(),
  method: z.enum(["POST", "GET", "DELETE", "PUT", "PATCH"]).default("POST"),
  logEnabled: z.boolean().default(false),
  logResponse: z.boolean().default(false),
  key: z.string().optional().default(''),
  restrictions: z.array(z.string()).default([]),
  authType: z.enum(["bearer", "none"]).default("bearer"),
  aiEnabled: z.boolean().default(false),
  openAIKey: z.string().optional().default(''),
}).superRefine((obj, ctx) => {
  if (obj.authType === "bearer" && obj.key.length < 5) {
    ctx.addIssue({
      path: ['key'],
      message: "You must select an API key to use for the request.",
      code: z.ZodIssueCode.custom,
    });
  }
  if (obj.method === "POST" && (!obj.request || !isValidJSON(obj.request))) {
    ctx.addIssue({
      path: ['request'],
      message: "Request must be a valid JSON object for POST method.",
      code: z.ZodIssueCode.custom,
    });
  }
});


export default function JwtForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const addNewKey = () => {
    console.log("Adding new key!");
    //For now redirect to the /keys page
    //This will instead be a sheet that pops up to add a new key
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
      authType: "bearer",
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

    const formData: TokenFormFields = {
      name: data.name,
      authType: data.authType || 'bearer',
      description: data.description || '',
      endpoint: data.endpoint,
      method: data.method,
      request: data.request ? JSON.parse(data.request) : undefined,
      expectedResponse: data.expectedResponse ? JSON.parse(data.expectedResponse) : undefined,
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
      body: JSON.stringify(formData),
    });

    const responseData = await response.json();
    console.log(responseData);
    setIsLoading(false);

  };
  

  const onTest = async (data: FieldValues) => {
    console.log("TESTING JWT", data);
    try {
      setIsLoading(true);
      setIsTesting(true);
      setTestResult(null);
      setTestError(null);
      const response = await fetch("/api/v1/jwt/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setTestResult(result.response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTesting(false);
      setIsLoading(false);
    }
  };

  const handleClearForm = () => {
    form.reset();
  };

  const handleFillForm = (details: Partial<TokenFormFields>) => {
    form.reset();
    if(details.name) form.setValue("name", details.name);
    if(details.description) form.setValue("description", details.description);
    if(details.endpoint) form.setValue("endpoint", details.endpoint);
    if(details.request) form.setValue("request", JSON.stringify(details.request, null, 2));
    if(details.expectedResponse) form.setValue("expectedResponse", JSON.stringify(details.expectedResponse, null, 2));
    if(details.method) form.setValue("method", details.method);
    if(details.logEnabled) form.setValue("logEnabled", details.logEnabled);
    if(details.logResponse) form.setValue("logResponse", details.logResponse);
    if(details.key) form.setValue("key", details.key);
    // @ts-ignore
    if(details.restrictions) form.setValue("restrictions", details.restrictions); 
    if(details.authType) form.setValue("authType", details.authType);
    if(details.aiEnabled) form.setValue("aiEnabled", details.aiEnabled);
    if(details.openAIKey) form.setValue("openAIKey", details.openAIKey);
  };

  return (
    <div>
    <Card className="mx-auto max-w-3xl mb-20 p-3">
      <h1 className='text-center text-xl'>Create a New Request Token</h1>
      <div className="flex gap-4">
        <Button onClick={handleClearForm}>Clear Form</Button>
        <Button onClick={() => handleFillForm(pokeApiExampleSnorlaxNameOnly)}>PokeAPI Example</Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
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
            render={({ field }) => (
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
            name="authType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auth Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>API Authentication Type</SelectLabel>
                      <SelectItem value="bearer">Bearer-Token</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                  </Select>
                  <FormDescription>Auth Type to use for the request.</FormDescription>
                  <FormMessage />
              </FormItem>
            )}
          />  

          {form.watch("authType") === "bearer" && (
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
        )}

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
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
            render={({ field }) => (
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
            <TestSheet form={form} onTest={onTest} isTesting={isTesting}/>
          </div>
        </form>
      </Form>
    </Card>

    </div>
  );  
}