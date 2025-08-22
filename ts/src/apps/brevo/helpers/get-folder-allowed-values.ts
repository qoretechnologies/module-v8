import { TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { BREVO_CONN_OPTIONS, BrevoError, extractBrevoError } from '../constants';
import { createBrevoClient } from './constants';

export const getBrevoFolderAllowedValues: TQoreGetAllowedValuesFunction<
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
    const response = await client.contactsClient.getFolders(50, 0);

    return (
      response.body.folders?.map((folder) => ({
        value: folder.id,
        display_name: folder.name,
      })) || []
    );
  } catch (error) {
    throw new BrevoError(`Failed to get folders: ${extractBrevoError(error)}`);
  }
};
