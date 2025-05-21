import { meet } from '@googleapis/meet';
import { OAuth2Client } from 'google-auth-library';

export const createGoogleMeetClient = (token: string) => {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: token });

  return meet({ version: 'v2', auth });
};

export const formatDate = (
  dateTimeStr: string | null | undefined,
  timezone?: string | null | undefined
) => {
  if (!dateTimeStr) return 'N/A';

  const date = new Date(dateTimeStr);

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  };

  try {
    if (timezone) {
      return new Intl.DateTimeFormat('en-US', {
        ...options,
        timeZone: timezone,
      }).format(date);
    } else {
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
  } catch (e) {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }
};
