import Twilio from 'twilio';

export const createTwilioClient = (accountSid: string, token: string) => {
  return Twilio(accountSid, token);
};
