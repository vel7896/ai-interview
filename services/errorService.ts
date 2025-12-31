export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    return "You appear to be offline. Please check your internet connection and try again.";
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('api_key environment variable not set')) {
        return 'The API key is missing from the application configuration. The developer needs to configure it.';
    }
    
    if (message.includes('api key not valid') || message.includes('api_key_invalid')) {
      return 'The configured API key is invalid. The application developer needs to correct it.';
    }

    if (message.includes('429') || message.includes('resource_exhausted') || message.includes('rate limit')) {
      return 'The service is currently experiencing high demand. Please wait a moment and try again.';
    }

    if (message.includes('prompt was blocked')) {
        return 'Your request was blocked for safety reasons. Please try rephrasing your input.';
    }

    if (message.includes('[google.api')) {
        return 'An unexpected error occurred with the AI service. Please try again later.';
    }
    
    if (message.includes('failed to fetch')) {
        return "A network error occurred, preventing the request from completing. Please check your connection and try again.";
    }

    return 'An unexpected error occurred. If the problem persists, please try restarting the session.';
  }

  return 'An unknown error occurred. Please try again.';
};
