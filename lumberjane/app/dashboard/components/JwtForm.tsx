'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  Checkbox,
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
import { useEffect, useState } from "react";
import type { KeyId } from "@/types"
import KeysDropdown from "./KeysDropdown";
import { useRouter } from "next/navigation";
import RestrictionsDropdown from "./RestrictionsDropdown";
import { VERSION, APP_NAME } from "@/constants";


type JWTFormData = FieldValues & {
  name: string
  description?: string
  endpoint: string
  request: string
  expectedResponse?: string
  method: string
  logEnabled: boolean
  logResponse: boolean
  key: string
  aiEnabled: boolean
  openAIKey?: string
};


const isValidJSON = (value: string) => {
  try {
    JSON.parse(value);
    return true;
  } catch (e) {
    return false;
  }
};

const jwtSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }).optional(),
  endpoint: z.string().url({
    message: "Endpoint must be a valid URL.",
  }),
  request: z.string().refine(isValidJSON, {
    message: "Request must be a valid JSON object.",
  }),
  expectedResponse: z.string().refine(isValidJSON, {
    message: "Expected Response must be a valid JSON object.",
  }).optional(),
  method: z.enum(["POST", "GET", "DELETE", "PUT", "PATCH"]),
  logResponse: z.string().optional(),
  key: z.string().min(5, { message: "You must select an API key to use for the request." }),
  aiEnabled: z.boolean().default(false),
  openAIKey: z.string().min(5, { message: "You must select an OpenAI key to use for the AI assist." }).optional(),
});


export default function JwtForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [restrictions, setRestrictions] = useState<any>({});
  const [selectedKey, setSelectedKey] = useState<KeyId>('');
  const [logsEnabled, setLogsEnabled] = useState<boolean>(false);
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [openAIKey, setOpenAIKey] = useState<string>('');
  const [submitClicked, setSubmitClicked] = useState<boolean>(false);


  // Whenever the fields are updated then update the JWT object
  useEffect(() => {
    const jwt = {
      //Basic info about the JWT
      info: {
        name: form.watch("name"),
        description: form.watch("description"),
        apiKey: selectedKey,
        endpoint: form.watch("endpoint"),
        method: form.watch("method"),
        creator: APP_NAME,
        version: VERSION,
        created: new Date().toISOString(),
      },
      //Restrictions on JWT use
      restrictions,
      // Request to the endpoint
      request: {},
      //Expected format of the response from the endpoint
      expected: {},
      log: {
        enabled: logsEnabled,
        logResponse: form.watch("logResponse"),
      },
      //If response is not in the expected format, use the AI to try and parse it
      ai_assist: {
        enabled: aiEnabled,
        openAIKey: openAIKey
      }
    };
    //Set value for key in the form
    form.setValue("key", selectedKey);
    console.log(jwt);
  }, [selectedKey, restrictions, submitClicked, logsEnabled, aiEnabled, openAIKey]);


  const updateRestrictions = (restrictionsObject: any) => {
    setRestrictions(restrictionsObject);
  }

  const addNewKey = () => {
    console.log("Adding new key!");
    //For now redirect to the /keys page
    router.push("/keys");
  }

  const form = useForm({
    resolver: zodResolver(jwtSchema),
  });

  const onSubmit = (data: FieldValues) => {
    console.log('Submitting form data:', data);
    //TODO ADD TOAST
    setIsLoading(true);
    setSubmitClicked(true);
  
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
  
    // Continue processing the valid data
    // Handle submission logic here
    //send data to api (/api/v1/jwt/create)
    
  };
  
  return (
    <Card className="mx-auto max-w-3xl mb-20">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="General OpenAI Integration" {...field} />
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
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
                  <Input placeholder="This is a general integration for OpenAI." {...field} />
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )}
          />         
          
            <FormField
            control={form.control}
            name="key"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>API Key to Use:</FormLabel>
                <FormControl>
                  <KeysDropdown setSelectedKey={setSelectedKey} addNewKey={addNewKey} />
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endpoint"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Endpoint</FormLabel>
                <FormControl>
                  <Input placeholder="https://api.example.com" {...field} />
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logsEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <FormLabel>Enable Logging</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={(checked) => form.setValue("logsEnabled", checked)} />
                </FormControl>
              </FormItem>
            )}
          />

          {form.watch("logsEnabled") && (
            <FormField
              control={form.control}
              name="logResponse"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <FormLabel>Log Response</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={(checked) => form.setValue("logResponse", checked)} />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="aiEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <FormLabel>Enable AI Assist</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={(checked) => form.setValue("aiEnabled", checked)} />
                </FormControl>
              </FormItem>
            )}
          />

          {form.watch("aiEnabled") && (
            <FormField
              control={form.control}
              name="openAIKey"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>OpenAI Keys</FormLabel>
                  <FormControl>
                    <KeysDropdown setSelectedKey={setOpenAIKey} addNewKey={addNewKey} />
                  </FormControl>
                  {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
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
                <FormControl>
                  <Select {...field} defaultValue="POST">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
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
                </FormControl>
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
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expectedResponse"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Expected Response</FormLabel>
                <FormControl>
                  <Textarea placeholder='{"key": "value"}' {...field} />
                </FormControl>
                {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="restrictions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Restrictions</FormLabel>
                <FormControl>
                  <RestrictionsDropdown onRestrictionsChange={(value) => form.setValue("restrictions", value)} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Other sections will go here */}

          <Button type="submit" disabled={isLoading ? true : false} variant='outline' className="justify-center">Create JWT</Button>
        </form>
      </Form>
    </Card>
  );  
}