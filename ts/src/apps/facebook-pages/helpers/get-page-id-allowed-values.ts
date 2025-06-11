import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { User } from 'facebook-nodejs-business-sdk';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FacebookPagesError } from '../constants';
import { createFacebookClient } from './constants';

export const getFacebookPageIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: FacebookPagesError,
  });

  try {
    createFacebookClient(token);

    const user = new User('me');
    const accounts = await user.getAccounts(['id', 'name', 'category', 'picture', 'access_token'], {
      limit: 100,
    });

    const allowedValues: IQoreAllowedValue<string>[] = accounts.map((page: any) => ({
      value: page.id,
      display_name: page.name,
      desc: `Category: ${page.category}\nID: ${page.id}`,
      ...(page.picture?.data?.url && { image: page.picture.data.url }),
    }));

    return allowedValues;
  } catch (error) {
    throw new FacebookPagesError(`Failed to fetch page IDs: ${error.message || error}`);
  }
};
