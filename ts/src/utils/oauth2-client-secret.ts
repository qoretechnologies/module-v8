/**
 * Gets the OAuth2 client secret from environment variables
 * @param appName - The application name (e.g., 'Jira', 'Asana')
 * @returns The client secret or 'auto' if not found
 */
export const getOauth2ClientSecret = (appName: string): string => {
  return process.env[`${appName.toUpperCase()}_CLIENT_SECRET`] ?? 'auto';
};
