import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from './constants';

export const getBrevoContactAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: BrevoError,
  });

  const client = createBrevoClient(token);

  try {
    const response = await client.contactsClient.getContacts(1000);

    return (
      response.body.contacts?.map((contact) => ({
        value: contact.id,
        display_name: contact.email,
        desc: `${Object.entries(contact.attributes)
          .map(([key, value]) => `${humanizeNameTitle(key)}: ${value}`)
          .join('\n')}`,
      })) || []
    );
  } catch (error) {
    throw new BrevoError(`Failed to get contacts: ${extractBrevoError(error)}`);
  }
};
