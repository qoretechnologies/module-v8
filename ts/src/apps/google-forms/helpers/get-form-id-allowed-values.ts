import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { createGoogleDriveClient } from '../../google-drive/helpers/constants';
import { GoogleFormsError } from '../constants';

export const getGoogleFormIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new GoogleFormsError('Token is required to get Google Form IDs');
  }

  try {
    const driveClient = createGoogleDriveClient(token);

    const response = await driveClient.files.list({
      pageSize: 1000,
      q: "mimeType='application/vnd.google-apps.form' and trashed=false",
      orderBy: 'createdTime desc',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      fields: 'files(id, name, webViewLink, iconLink)',
    });

    if (!response.data.files) {
      return [];
    }

    const allowedValues: IQoreAllowedValue<string>[] = response.data.files
      .filter((form) => form.id)
      .map((form) => {
        return {
          value: form.id!,
          display_name: form.name || 'Untitled Form',
          ...(form.iconLink && { image: form.iconLink }),
          ...(form.webViewLink && {
            desc: `(Link to Form)[${form.webViewLink}]\n`,
          }),
        };
      });

    return allowedValues;
  } catch (error: any) {
    throw new GoogleFormsError(`Failed to get Google Form IDs: ${error.message || error}`);
  }
};
