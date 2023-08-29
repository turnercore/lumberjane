import type { TokenFormFields } from "@/types";

const defaultFormData: TokenFormFields = {
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

const pokeApiExampleSnorlax: Partial<TokenFormFields> = {
  name: 'PokeAPI - Retrieve Snorlax Object  ',
  description: 'PokeAPI is a RESTful API designed for developers',
  method: 'GET',
  authType: 'none',
  endpoint: 'https://pokeapi.co/api/v2/pokemon/snorlax',
}

const pokeApiExampleSnorlaxNameOnly: Partial<TokenFormFields> = {
  name: 'PokeAPI - Retrieve Snorlax Name Only',
  description: 'PokeAPI is a RESTful API designed for developers',
  method: 'GET',
  authType: 'none',
  endpoint: 'https://pokeapi.co/api/v2/pokemon/snorlax',
  expectedResponse: `{ "species": {  "name": "include"  } }`
}

const pokeApiExampleNameVariable: Partial<TokenFormFields> = {
  name: 'PokeAPI - Retrieve Pokemon Name with Variable',
  description: 'PokeAPI is a RESTful API designed for developers',
  method: 'GET',
  authType: 'none',
  endpoint: 'https://pokeapi.co/api/v2/pokemon/$$name$$',
};

const chuckNorrisJokeExample: Partial<TokenFormFields> = {
  name: 'Chuck Norris API - Retrieve Random Joke',
  description: 'Get a random joke about Chuck Norris',
  method: 'GET',
  authType: 'none',
  endpoint: 'https://api.chucknorris.io/jokes/random',
}

// const openWeatherMapExample: Partial<TokenFormFields> = {
//   name: 'OpenWeatherMap - Retrieve Weather for a City',
//   description: 'Get the current weather information for a specified city',
//   method: 'GET',
//   authType: 'none',
//   endpoint: 'https://api.openweathermap.org/data/2.5/weather?q=$$city$$&appid=YOUR_API_KEY',
// }

// const newsApiExample: Partial<TokenFormFields> = {
//   name: 'News API - Retrieve Top Headlines',
//   description: 'Get the top headlines from a specific country',
//   method: 'GET',
//   authType: 'none',
//   endpoint: 'https://newsapi.org/v2/top-headlines?country=$$country$$&apiKey=YOUR_API_KEY',
// }

const githubUserExample: Partial<TokenFormFields> = {
  name: 'GitHub API - Retrieve User Information',
  description: 'Get information about a specific GitHub user',
  method: 'GET',
  authType: 'none',
  endpoint: 'https://api.github.com/users/turnercore',
}

const githubUserVariableExample: Partial<TokenFormFields> = {
  name: 'GitHub API - Retrieve Variable User Information',
  description: 'Get information about a specific GitHub user',
  method: 'GET',
  authType: 'none',
  endpoint: 'https://api.github.com/users/$$username$$',
}


export const exampleTokens = [
  pokeApiExampleSnorlax,
  pokeApiExampleSnorlaxNameOnly,
  pokeApiExampleNameVariable,
  chuckNorrisJokeExample,
  githubUserExample,
  githubUserVariableExample,
]