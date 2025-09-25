import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class PayPalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PayPalError';
  }
}

export const PAYPAL_APP_NAME = 'PayPal';
export const PAYPAL_APP_LOGO =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1ODQuNzk4IiBoZWlnaHQ9IjcyMCIgdmlld0JveD0iMCAwIDE1NC43MjggMTkwLjUiIHhtbG5zOnY9Imh0dHBzOi8vdmVjdGEuaW8vbmFubyI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODk4LjE5MiAyNzYuMDcxKSI+PHBhdGggY2xpcC1wYXRoPSJub25lIiBkPSJNLTgzNy42NjMtMjM3Ljk2OGE1LjQ5IDUuNDkgMCAwIDAtNS40MjMgNC42MzNsLTkuMDEzIDU3LjE1LTguMjgxIDUyLjUxNC0uMDA1LjA0NC4wMS0uMDQ0IDguMjgxLTUyLjUxNGMuNDIxLTIuNjY5IDIuNzE5LTQuNjMzIDUuNDItNC42MzNoMjYuNDA0YzI2LjU3MyAwIDQ5LjEyNy0xOS4zODcgNTMuMjQ2LTQ1LjY1OC4zMTQtMS45OTYuNDgyLTMuOTczLjUyLTUuOTI0di0uMDAzaC0uMDAzYy02Ljc1My0zLjU0My0xNC42ODMtNS41NjUtMjMuMzcyLTUuNTY1eiIgZmlsbD0iIzAwMWM2NCIvPjxwYXRoIGNsaXAtcGF0aD0ibm9uZSIgZD0iTS03NjYuNTA2LTIzMi40MDJjLS4wMzcgMS45NTEtLjIwNyAzLjkzLS41MiA1LjkyNi00LjExOSAyNi4yNzEtMjYuNjczIDQ1LjY1OC01My4yNDYgNDUuNjU4aC0yNi40MDRjLTIuNzAxIDAtNC45OTkgMS45NjQtNS40MiA0LjYzM2wtOC4yODEgNTIuNTE0LTUuMTk3IDMyLjk0N2E0LjQ2IDQuNDYgMCAwIDAgNC40MDUgNS4xNTNoMjguNjZhNS40OSA1LjQ5IDAgMCAwIDUuNDIzLTQuNjMzbDcuNTUtNDcuODgxYy40MjMtMi42NjkgMi43MjItNC42MzYgNS40MjMtNC42MzZoMTYuODc2YzI2LjU3MyAwIDQ5LjEyNC0xOS4zODYgNTMuMjQzLTQ1LjY1NSAyLjkyNC0xOC42NDktNi40Ni0zNS42MTQtMjIuNTExLTQ0LjAyNnoiIGZpbGw9IiMwMDcwZTAiLz48cGF0aCBjbGlwLXBhdGg9Im5vbmUiIGQ9Ik0tODcwLjIyNS0yNzYuMDcxYTUuNDkgNS40OSAwIDAgMC01LjQyMyA0LjYzNmwtMjIuNDg5IDE0Mi42MDhhNC40NiA0LjQ2IDAgMCAwIDQuNDA1IDUuMTU2aDMzLjM1MWw4LjI4MS01Mi41MTQgOS4wMTMtNTcuMTVhNS40OSA1LjQ5IDAgMCAxIDUuNDIzLTQuNjMzaDQ3Ljc4MmM4LjY5MSAwIDE2LjYyMSAyLjAyNSAyMy4zNzUgNS41NjMuNDYtMjMuOTE3LTE5LjI3NS00My42NjYtNDYuNDEyLTQzLjY2NnoiIGZpbGw9IiMwMDMwODciLz48L2c+PC9zdmc+';

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
