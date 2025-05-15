import { TCustomConnOptions, TQoreGetDefaultValueFunction } from '@qoretechnologies/ts-toolkit';
import { createGoogleDriveClient } from './constants';

export const getGoogleDriveUserDomainDefaultValue: TQoreGetDefaultValueFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const token = context?.conn_opts?.token;

  if (!token) {
    return '';
  }

  try {
    const driveClient = createGoogleDriveClient(token);

    const response = await driveClient.about.get({
      fields: 'user(emailAddress)',
    });

    const emailAddress = response.data.user?.emailAddress;

    if (!emailAddress) {
      return '';
    }

    const domain = emailAddress.split('@')[1];

    if (!domain || domain === 'gmail.com' || domain.includes('googlemail.com')) {
      return '';
    }

    return domain;
  } catch (error) {
    return '';
  }
};
