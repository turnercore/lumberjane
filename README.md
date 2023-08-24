# Lumberjane

## Overview of Lumberjane
Lumberjane is a backend service designed to generate JWTs for client apps, games, etc., to communicate with other API backends without exposing API keys. It's like a secret handshake for the digital world. Here's what it's going to do:

1. Generate JWTs: These tokens will have profiles defining security measures, such as IPs, custom headers, and origin of the request.

2. Encode Requests in JWTs: Instead of storing requests on the server, they'll be encoded in the JWTs, and Lumberjane will forward them after replacing placeholders with actual API keys.

3. Data Validation: Optionally, Lumberjane will validate the data structure returned from the API, format it as the client expects, and remove any unnecessary or sensitive information.

4. AI Verification: If the server's response doesn't match the expected structure, it can be passed to OpenAI's GPT to extract relevant data. It's like having a digital detective on the case.

5. Logging: Requests and responses can be logged, with optional details.


## Wishlist 

6. Rate Limiting: Requests can be rate limited based on IP, JWT, or other criteria.

7. Caching: Responses can be cached for a specified amount of time.

8. Webhooks: Webhooks can be triggered when certain events occur, such as a request failing validation or a rate limit being exceeded.

9. Custom Headers: Custom headers can be added to requests, such as an API key header.

10. Custom Origin: Requests can be sent from a custom origin, such as a domain name.


Things that need to be configured with supabase:
1. Redirect URL
2. Tables with RLS (profiles, keys, tokens, logs)
3. Storage bucket 'avatars' with public access and user policy (user's get their own folder with their user id)

Bugs: 
Known issue with static page generation and cookies:
https://github.com/vercel/next.js/issues/49373


Todo/Bugs/Etc:
https://tree.taiga.io/project/turnercore-lumberjane/timeline
