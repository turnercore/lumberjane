import { RequestMethod, StandardResponse } from "@/types";

type ApiRequestHeaders = {
  [key: string]: string;
};

export default async function makeApiRequest(method: RequestMethod, endpoint: string, headers?: ApiRequestHeaders, body?: any): Promise<StandardResponse> {
  try {
    // Prepare the request options, including method, headers, and body (if applicable)
    const requestOptions: RequestInit = {
      method,
      headers: headers ? new Headers(headers) : undefined,
      body: body && method == 'POST' ? JSON.stringify(body) : undefined,
    };

    // Make the fetch request to the specified endpoint with the prepared options
    const response = await fetch(endpoint, requestOptions);

    // Check if the response status is not successful (outside the range 200-299)
    if (!response.ok) {
      // Extract the status and status text from the response
      const errorData = await response.json();
      return {
        error: {
          message: errorData.message || "An error occurred while processing the request.",
          status: response.status,
        },
      };
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Return the parsed data
    return {
      data,
    };
  } catch (error) {
    // Handle any unexpected errors (e.g., network issues) and return a suitable error response
    console.error("An error occurred while making the API request:", error);
    return {
      error: {
        message: "An unexpected error occurred while making the API request.",
        status: 500,
      },
    };
  }
}
