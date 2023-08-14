# Lumberjane

## Overview of Lumberjane
Lumberjane is a backend service designed to generate JWTs for client apps, games, etc., to communicate with other API backends without exposing API keys. It's like a secret handshake for the digital world. Here's what it's going to do:

1. Generate JWTs: These tokens will have profiles defining security measures, such as IPs, custom headers, and origin of the request.

2. Encode Requests in JWTs: Instead of storing requests on the server, they'll be encoded in the JWTs, and Lumberjane will forward them after replacing placeholders with actual API keys.

3. Data Validation: Optionally, Lumberjane will validate the data structure returned from the API, format it as the client expects, and remove any unnecessary or sensitive information.

4. AI Verification: If the server's response doesn't match the expected structure, it can be passed to OpenAI's GPT to extract relevant data. It's like having a digital detective on the case.

5. Logging: Requests and responses can be logged, with optional details.



Hello! I'm starting work on a backend app called Lumberjane that I'm hoping you can help with. This is how I envision the app, which I'm going to begin writing in Node.js / Express.js as I feel this is a simple way to start (feel free to correct this view if you think there is a more appropriate framework to use). 

Lumberjane is going to be a backend for API requests. The idea behind it is a simple service that can generate JWTs that your apps/games/etc can use to communicate with other API backends without exposing your API keys publicly. 

So Lumberjane will take an API key and issue JWTs for client apps to use. The JWTs will have some properties for security and validation.  How I imagine it is that the JWTs will have a profile which will determine what headers Lumberjane should look for when getting the request. These things define either IPs or IP ranges that the machine making the request must be using, any custom headers, and things like where the request was made from (like Godot Engine or a browser or whatnot).

The second thing that the JWT should include is the request that needs to be made. I'm thinking of encoding the request in the JWT instead of storing on the Lumberjane server, along with the address the request should be sent to what do you think of that method? The idea would be that yes, lumberjane has the secret parts of the API key, but it just forwards the request part. There would probably be a placeholder variable that the JWT would have instead of the API key, and then if everything looks good Lumberjane would replace it out and make the requert to the API on the client's behalf.

The last thing I'd like to include in Lumberjane is data validation. So the JWT would define the structure of the expected response, most important the data that is important. This last thing should be optional, if it is disabled Lumberjane will forward the response back exactly as it receives it from the API endpoint, but if it's enabled Lumberjane should check to make sure that the data returned from the API matches the expected data structure from the client. Lumberjane should then extract format the data how the client expects it, removing parts of the data that has not been requested and return the information as a response. The idea here is that if the API endpoint returns sensitive information ,it will not be passed to the client if it has not been requested in the JWT (and since the JWTs are created beforehand, there's no way for a client to manipulate them). 

To add a little spiciness to the whole thing I'd like the option to turn on AI verification, which, if the server does not respond with the data structure that the JWT has defined, the response can be passed off to OpenAIs GPT to see if it can extract the relevant data from the response, if it can then the data will be packed up and returned to the client. This will make it so that even if for some reason the API endpoint changes it's response, the request will still succeed. 

Are all of these good ideas? Do you think Node.js/Express.js is the right way to go for this project?

Here's roughly what I'm thinking the JWTs should look like when Lumberjane creates them:


Along with the JWT the values for the placeholder variables would be sent in the request as a JSON variable or a RESTful paramater. 
{
    "info": {
        "user": "091u20jcas0d9ivksda", //user id of user that created the jwt
        "name": "General OpenAI Integration", //name of jwt
        "description": "This is a general integration for OpenAI for downbound. It can be used to get a chat completion repsonse from OpenAI." //description of jwt, optional
        "method": "POST", //method that the request will be sent with, default POST
        "headers": {}, //optional extra headers sent with request
        "auth": {}, //optional auth info sent with request, default is Bearer token using the API key
        "endpoint": "https://api.openai.com/v1/chat/completions", //endpoint that the request will be sent to, this is an example
        "ai_enabled": true, //if true then the response will be sent to OpenAI's GPT to see if it can extract the relevant data from the response
        "ai_key": "1928u123jlkasc" // id of the key that will be used to send the response to the OpenAI endpoint, will use userid and keyid to lookup the key at request time, optional
    },

    "restrictions":  [], //skipping for now, will be an empty array and be filled out when i get the form working

    "request": (JSON from user, should be a JSON object with the request to the endpoint, values can either be hardcoded or in a variable like $$var1$$ which will be filled in with more info from the response when the JWT is submitted.){
        "type": "POST",
        "url": "https://api.openai.com/v1/chat/completions",
        "auth": "lumberjane", //This can be lumberjane (lumberjane has the secret key or token), or bypass (the actual API key will be provided in the key field of the request)
        "auth_type": "Bearer",
        "key": "@#90asdfjkxzjclkjasdf0@#=", //random key generated by lumberjane OR the actual API key if auth is set to bypass
        "headers": {
            "Content-Type": "application/json"
        },
        "body":
            {
                "model": "{{ MODEL }} DEFAULT gpt-3.5-turbo",
                "messages": "{{ MESSAGES }} REQUIRED",
                "max_tokens": "150",
                "temperature": "{{ TEMP }} DEFAULT 0.9"
            }
    
    },

    "expectedResponse": (JSON Submitted from user, should be a JSON object with the expected response from the endpoint, it should include the key name and the key type (string, int, number, Date, etc)),

    "log": {
        "enabled": true, // log the request and response
        "log_level": "info" // log level for the request and response
        "log_response": false // log the response from the endpoint
    }
}

Along with this JWT the client would also send the answers to the variables that need to be filled either as a JSON object or as html url paramaters
The objects marked {{ x }} would need to be replaced with x's value. If the value is not provided then the DEFAULT value will be used. 
If REQUIRED is set and the client does not provide the value then an error will be returned with an error message saying what was missing.

Sample Actual Response from OpenAI 
{
    "id": "chatcmpl-123",
    "object": "chat.completion",
    "created": 1677652288,
    "choices": [{
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "\n\nHello there, how may I assist you today?",
      },
      "finish_reason": "stop"
    }],
    "usage": {
      "prompt_tokens": 9,
      "completion_tokens": 12,
      "total_tokens": 21
    }
  }

  In this case we are only expecting the choices array to be returned. Lumberjane will verify that the choices response exists and is an array and then return it (but not anything else) to the client.
  If the expected data could not be found and ai_enabled is true, then Lumberjane will attempt to parse the expression by sending the response and the expected response to ChatGPT and trying to get it
  to parse the response. If that is scucessfull then the repsonse will be returned, if not then appropriate error message will be returned.

Function calling
In an API call, you can describe functions to gpt-3.5-turbo-0613 and gpt-4-0613, and have the model intelligently choose to output a JSON object containing arguments to call those functions. The Chat Completions API does not call the function; instead, the model generates JSON that you can use to call the function in your code.

The latest models (gpt-3.5-turbo-0613 and gpt-4-0613) have been fine-tuned to both detect when a function should to be called (depending on the input) and to respond with JSON that adheres to the function signature. With this capability also comes potential risks. We strongly recommend building in user confirmation flows before taking actions that impact the world on behalf of users (sending an email, posting something online, making a purchase, etc).

Under the hood, functions are injected into the system message in a syntax the model has been trained on. This means functions count against the model's context limit and are billed as input tokens. If running into context limits, we suggest limiting the number of functions or the length of documentation you provide for function parameters.
Function calling allows you to more reliably get structured data back from the model. For example, you can:

Create chatbots that answer questions by calling external APIs (e.g. like ChatGPT Plugins)
e.g. define functions like send_email(to: string, body: string), or get_current_weather(location: string, unit: 'celsius' | 'fahrenheit')
Convert natural language into API calls
e.g. convert "Who are my top customers?" to get_customers(min_revenue: int, created_before: string, limit: int) and call your internal API
Extract structured data from text
e.g. define a function called extract_data(name: string, birthday: string), or sql_query(query: string)
...and much more!

The basic sequence of steps for function calling is as follows:

Call the model with the user query and a set of functions defined in the functions parameter.
The model can choose to call a function; if so, the content will be a stringified JSON object adhering to your custom schema (note: the model may generate invalid JSON or hallucinate parameters).
Parse the string into JSON in your code, and call your function with the provided arguments if they exist.
Call the model again by appending the function response as a new message, and let the model summarize the results back to the user.
You can see these steps in action through the example below:

import openai
import json


# Example dummy function hard coded to return the same weather
# In production, this could be your backend API or an external API
def get_current_weather(location, unit="fahrenheit"):
    """Get the current weather in a given location"""
    weather_info = {
        "location": location,
        "temperature": "72",
        "unit": unit,
        "forecast": ["sunny", "windy"],
    }
    return json.dumps(weather_info)


def run_conversation():
    # Step 1: send the conversation and available functions to GPT
    messages = [{"role": "user", "content": "What's the weather like in Boston?"}]
    functions = [
        {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        }
    ]
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-0613",
        messages=messages,
        functions=functions,
        function_call="auto",  # auto is default, but we'll be explicit
    )
    response_message = response["choices"][0]["message"]

    # Step 2: check if GPT wanted to call a function
    if response_message.get("function_call"):
        # Step 3: call the function
        # Note: the JSON response may not always be valid; be sure to handle errors
        available_functions = {
            "get_current_weather": get_current_weather,
        }  # only one function in this example, but you can have multiple
        function_name = response_message["function_call"]["name"]
        fuction_to_call = available_functions[function_name]
        function_args = json.loads(response_message["function_call"]["arguments"])
        function_response = fuction_to_call(
            location=function_args.get("location"),
            unit=function_args.get("unit"),
        )

        # Step 4: send the info on the function call and function response to GPT
        messages.append(response_message)  # extend conversation with assistant's reply
        messages.append(
            {
                "role": "function",
                "name": function_name,
                "content": function_response,
            }
        )  # extend conversation with function response
        second_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-0613",
            messages=messages,
        )  # get a new response from GPT where it can see the function response
        return second_response


print(run_conversation())
Hallucinated outputs in function calls can often be mitigated with a system message. For example, if you find that a model is generating function calls with functions that weren't provided to it, try using a system message that says: "Only use the functions you have been provided with."
In the example above, we sent the function response back to the model and let it decide the next step. It responded with a user-facing message which was telling the user the temperature in Boston, but depending on the query, it may choose to call a function again.

For example, if you ask the model “Find the weather in Boston this weekend, book dinner for two on Saturday, and update my calendar” and provide the corresponding functions for these queries, it may choose to call them back to back and only at the end create a user-facing message.

If you want to force the model to call a specific function you can do so by setting function_call: {"name": "<insert-function-name>"}. You can also force the model to generate a user-facing message by setting function_call: "none". Note that the default behavior (function_call: "auto") is for the model to decide on its own whether to call a function and if so which function to call.

You can find more examples of function calling in the OpenAI cookbook:


Set up the database:
Right now the project uses supabase to host the database. This was chosen as it offers both auth and row level security on top of a Postgres Database instance. Supabase is self-hostable and open source, so if you want to host your own instance you can do so.

Create the tables:
- profiles
- keys
- tokens
- logs

Enable RLS on tokens and keys:
