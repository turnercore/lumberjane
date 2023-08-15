import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


type SchemaInstruction = 'include' | 'omit';
type Schema = SchemaInstruction | Schema[] | { [key: string]: Schema };
export function matchJSONtoSchema(resp: any, schema: Schema): any {
  // Check if schema is an object
  if (typeof schema !== 'object' || Array.isArray(schema)) {
    return "Error: Invalid schema";
  }

  // Initialize result
  const result: any = {};

  // Iterate through each key in the schema
  for (const key in schema) {
    const instruction = schema[key];

    // If the key doesn't exist in the response, return an error
    if (!(key in resp)) {
      return `Error: Key '${key}' in schema does not exist in response`;
    }

    const value = resp[key];

    // Handle include and omit instructions
    if (instruction === 'include') {
      result[key] = value;
    } else if (instruction === 'omit') {
      continue;
    } else if (typeof instruction === 'object' && !Array.isArray(instruction)) {
      // Handle nested object
      const nestedResult = matchJSONtoSchema(value, instruction);
      if (typeof nestedResult === 'string') { // Check for error message
        return nestedResult;
      }
      result[key] = nestedResult;
    } else if (Array.isArray(instruction)) {
      // Handle nested list
      const nestedResult = value.map((item: any) => matchJSONtoSchema(item, instruction[0])).filter(Boolean);
      // Check for error message in the nested results
      for (const res of nestedResult) {
        if (typeof res === 'string') {
          return res;
        }
      }
      result[key] = nestedResult;
    }
  }

  return result;
}