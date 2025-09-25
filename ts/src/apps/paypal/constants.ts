import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class PayPalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PayPalError';
  }
}

export const PAYPAL_APP_NAME = 'PayPal';
export const PAYPAL_APP_LOGO = '';

export const PAYPAL_CONN_OPTIONS = {
  oauth2_client_id: {
    display_name: 'Client ID',
    short_desc: 'Your PayPal client ID',
    desc: 'You can see how to get your PayPal client ID and secret in the [docs](https://developer.paypal.com/api/rest/#link-getclientidandclientsecret).',
    type: 'string',
  },
  oauth2_client_secret: {
    display_name: 'Client Secret',
    short_desc: 'Your PayPal client secret',
    desc: 'You can see how to get your PayPal client ID and secret in the [docs](https://developer.paypal.com/api/rest/#link-getclientidandclientsecret).',
    type: 'string',
  },
  environment: {
    display_name: 'Environment',
    short_desc: 'Whether to use the PayPal sandbox or production environment',
    type: 'string',
    allowed_values: [
      { value: 'api-m', display_name: 'Production' },
      { value: 'api-m.sandbox', display_name: 'Sandbox' },
    ],
    default_value: 'api-m',
  },
} satisfies TCustomConnOptions;

export const getPayPalErrorMessage = (error: string | { message: string }): string => {
  if (typeof error === 'string') return error;

  const jsonMatch = error.message.match(/(\{.*\})/s);

  if (!jsonMatch) return error.message;

  try {
    const errorJson: {
      details?: { description: string }[];
      message?: string;
    } = JSON.parse(jsonMatch[1]);

    if (errorJson?.details?.length) {
      return errorJson.details.map((d) => d.description).join('; ');
    }

    return errorJson?.message || 'Unknown error';
  } catch (e) {
    return error.message;
  }
};
