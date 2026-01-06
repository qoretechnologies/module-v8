import {
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
  IQoreAllowedValue,
} from '@qoretechnologies/ts-toolkit';
import { MailchimpError } from '../error';
import { getMailchimpAllowedValues } from './constants';

type TMailchimpCampaignFolder = {
  id: string;
  name: string;
  count: number;
  type: string;
};

const mapMailchimpCampaignFolderToAllowedValue = (
  folder: TMailchimpCampaignFolder
): IQoreAllowedValue<string> => ({
  display_name: folder.name,
  value: folder.id,
  desc: `Contains ${folder.count} campaigns`,
});

export const getMailchimpCampaignFolderIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const datacenter = context?.conn_opts?.datacenter;

  const missingValues: string[] = [];
  if (!token) missingValues.push('token');
  if (!datacenter) missingValues.push('datacenter');

  if (missingValues.length) {
    throw new MailchimpError(
      `All of the following [${missingValues.join(', ')}]` +
        ` are required to get Mailchimp campaign folder id allowed values`
    );
  }

  const path = 'campaign-folders';

  return await getMailchimpAllowedValues({
    token: token!,
    datacenter: datacenter!,
    path,
    mapItemToAllowedValue: mapMailchimpCampaignFolderToAllowedValue,
    dataPath: 'folders',
  });
};
