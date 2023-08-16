import { TokenFormFields } from "@/types";

export const defaultFormData: TokenFormFields = {
  key: undefined,
  name: '',
  description: '',
  method: 'GET',
  headers: undefined,
  authType: 'bearer',
  auth: undefined,
  endpoint: '',
  aiEnabled: false,
  openAIKey: undefined,
  restrictions: [],
  request: '',
  expectedResponse: '',
  logEnabled: false,
  logLevel: 'info',
  logResponse: false,
};

export const pokeApiExampleSnorlax: Partial<TokenFormFields> = {
  name: 'PokeAPI',
  description: 'PokeAPI is a RESTful API designed for developers',
  method: 'GET',
  authType: 'none',
  endpoint: 'https://pokeapi.co/api/v2/pokemon/snorlax',
}

export const pokeApiExampleSnorlaxNameOnly: Partial<TokenFormFields> = {
  name: 'PokeAPI Retrieve Snorlax Name',
  description: 'PokeAPI is a RESTful API designed for developers',
  method: 'GET',
  authType: 'none',
  endpoint: 'https://pokeapi.co/api/v2/pokemon/snorlax',
  expectedResponse: `{ "species": {  "name": "include"  } }`
}
