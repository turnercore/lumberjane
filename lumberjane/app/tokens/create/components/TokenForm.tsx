'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FieldValues, useForm } from "react-hook-form";
import {
  Card,
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
  RadioGroup,
  Label,
  RadioGroupItem,
  CardHeader,  
} from "@/components/ui";
import { useState } from "react";
import type { TokenFormFields } from "@/types"
import KeysDropdown from "./KeysDropdown";
import { useRouter } from "next/navigation";
import RestrictionsDropdown from "./RestrictionsDropdown";
import TestSheet from "./TestSheet";
import  { TestCasesCombobox } from "./TestCasesCombobox";
import CodeEditor from '@uiw/react-textarea-code-editor';
import { isValidJSON, convertToJSON } from "@/utils/jsonUtils";

//for testing
import PrintFormValues from '@/components/testing/PrintFormValues';


const expectedResponseExplainer: string = `
(Optional) Expected response from the endpoint. 
Format should be a JSON string with types instead of values.
Example:  { "name" : "string", "age" : "number" } 
Only fields here will be returned. You can omit fields to make sure they are not returned with the response.
You can enable AI Assist to help find fields and make sure the response conforms to expected response.
If the fields cannot be found the server will return an error and no data.
`;

//Zod validation schema
const tokenSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).default(''),
  description: z.string().default('').optional(),
  endpoint: z.string().url({
    message: "Endpoint must be a valid URL.",
  }),
  request: z.string().default('').optional(),
  expectedResponse: z.string().default('').optional(),
  method: z.enum(["POST", "GET", "DELETE", "PUT", "PATCH"]).default("POST"),
  logEnabled: z.boolean().default(true),
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
  if (obj.expectedResponse && !isValidJSON(obj.expectedResponse)) {
    ctx.addIssue({
      path: ['expectedResponse'],
      message: "Expected Response must be a valid JSON object.",
      code: z.ZodIssueCode.custom,
    });
  }
});

export type TestVariable = Record<string, string>;

export default function tokenForm() {
  let isDebugEnabled = true;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testVariables, setTestVariables] = useState<TestVariable[]>([]);

  const setTokenFormFields = (data: FieldValues): TokenFormFields => {
    const jsonRequest = convertToJSON(data.request);
    return {
      name: data.name,
      authType: data.authType || 'bearer',
      description: data.description || '',
      endpoint: data.endpoint,
      method: data.method,
      request: data.request ? JSON.parse(jsonRequest) : undefined,
      expectedResponse: data.expectedResponse ? JSON.parse(convertToJSON(data.expectedResponse)) : undefined,
      key: data.key,
      restrictions: data.restrictions || [],
      logResponse: data.logResponse || false,
      logEnabled: data.logEnabled || true,
      aiEnabled: data.aiEnabled || false,
      openAIKey: data.openAIKey || '',
    };
  };

  const addNewKey = () => {
    console.log("Adding new key!");
    //For now redirect to the /keys page
    //This will instead be a sheet that pops up to add a new key
    router.push("/keys");
  }

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(tokenSchema),
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
  
    // Validate the rest of the data using tokenSchema
    const result = tokenSchema.safeParse(data);
  
    if (!result.success) {
      // Handle other validation errors
      console.error("Validation errors:", result.error);
      setIsLoading(false);
      return;
    }

    const formData: TokenFormFields = setTokenFormFields(data);
  
    // Continue processing the valid data
    // Handle submission logic here
    //send data to api (/api/v1/tokens/create)
    const response = await fetch('/api/v1/tokens/create', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    const responseData = await response.json();
    console.log(responseData);
    setIsLoading(false);

  };
  
  const onTest = async (data: FieldValues) => {
    const formData: TokenFormFields = setTokenFormFields(data);
    try {
      setIsLoading(true);
      setIsTesting(true);
      setTestResult(null);
      setTestError(null);
      const body:Record<string, any> = {};
      //add formData to body
      for (const [key, value] of Object.entries(formData)) {
        body[key] = value;
      }
      //add testVariables to body
      body['additionalVariables'] = {};
      for (const variable of testVariables) {
        //if the body already has the key, just skip it
        if (body['additionalVariables'][Object.keys(variable)[0]] || Object.keys(variable)[0] == '') continue;

        //Otherwise add the key and value to the body
        body['additionalVariables'][Object.keys(variable)[0]] = Object.values(variable)[0];

        body[Object.keys(variable)[0]] = Object.values(variable)[0];
      }

      const response = await fetch("/api/v1/tokens/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
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
    if(details.request) form.setValue("request", JSON.stringify(JSON.parse(details.request), null, 2));
    if(details.expectedResponse) form.setValue("expectedResponse", JSON.stringify(JSON.parse(details.expectedResponse), null, 2));
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
    <Card className="mx-auto max-w-3xl mb-20 p-3 shadow-md">
      <CardHeader>
        <h1 className='text-center text-xl'>Create a New Request Token</h1>
        <div className="flex gap-4 justify-end">
          <TestCasesCombobox handleFillForm={handleFillForm} handleClearForm={handleClearForm} />
        </div>
      </CardHeader>
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
            name="authType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auth Type</FormLabel>
                <RadioGroup defaultValue={field.value} value={field.value} onValueChange={field.onChange} className="flex space-x-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bearer" id="r1" />
                    <Label htmlFor="r1">Bearer-Token</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="r2" />
                    <Label htmlFor="r2">None</Label>
                  </div>
                </RadioGroup>
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
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Method</FormLabel>
                <RadioGroup defaultValue={field.value} value={field.value} onValueChange={field.onChange} className="flex space-x-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="POST" id="r1" />
                    <Label htmlFor="r1">POST</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="GET" id="r2" />
                    <Label htmlFor="r2">GET</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="DELETE" id="r3" />
                    <Label htmlFor="r3">DELETE</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PUT" id="r4" />
                    <Label htmlFor="r4">PUT</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PATCH" id="r5" />
                    <Label htmlFor="r5">PATCH</Label>
                  </div>
                </RadioGroup>
                <FormDescription>Method to use for the request.</FormDescription>
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
                <FormDescription>Where to send the request, can include variables. Ex: https://pokeapi.co/api/v2/pokemon/$$name$$</FormDescription>
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
                <CodeEditor
                    value={field.value}
                    language="json"
                    onChange={field.onChange}
                    placeholder="Enter your JSON body for POST requests."
                    padding={15}
                    className="rounded-md"
                    style={{
                      fontSize: 14,
                      backgroundColor: "#f5f5f5",
                      fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                    }}
                  />
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
                <CodeEditor
                    value={field.value}
                    language="json"
                    onChange={field.onChange}
                    placeholder="Ender JSON with 'include' on fields you want included."
                    padding={15}
                    className="rounded-md"
                    style={{
                      fontSize: 14,
                      backgroundColor: "#f5f5f5",
                      fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                    }}
                  />
                </FormControl>
                <FormDescription>{expectedResponseExplainer}</FormDescription>
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
            {isDebugEnabled && (<PrintFormValues form={form} />)}
            <Button type="submit" disabled={isLoading ? true : false} variant='outline' className="text-xl bg-green-200">Create Token</Button>
            <TestSheet form={form} onTest={onTest} isTesting={isTesting} testResult={testResult} testVariables={testVariables} setTestVariables={setTestVariables}/>
          </div>
        </form>
      </Form>
    </Card>

    </div>
  );  
}