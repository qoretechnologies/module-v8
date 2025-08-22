import { TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BREVO_CONN_OPTIONS, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from './constants';

export const getBrevoListAllowedValues: TQoreGetAllowedValuesFunction<
  typeof BREVO_CONN_OPTIONS,
  number
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: BrevoError,
  });

  const client = createBrevoClient(token);

  try {
    const response = await client.contactsClient.getLists(50);

    return (
      response.body.lists?.map((list) => ({
        value: list.id,
        display_name: list.name,
        desc: `Total Subscribers: ${list.totalSubscribers}`,
      })) || []
    );
  } catch (error) {
    throw new BrevoError(`Failed to get lists: ${extractBrevoError(error)}`);
  }
};
