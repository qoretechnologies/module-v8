import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AZURE_DEVOPS_CONN_OPTIONS, AzureDevOpsError } from '../constants';
import { createAzureDevOpsClient } from './constants';
type ActiveCampaignItem = {
  descriptor: string;
  displayName: string;
  mailAddress: string;
};

const mapAzureDevOpsItemToAllowedValue = (item: ActiveCampaignItem): IQoreAllowedValue<string> => {
  return {
    value: item.descriptor,
    display_name: `${item.displayName!} <${item.mailAddress!}>`,
  };
};

export const getAzureDevOpsUserAllowedValues: TQoreGetAllowedValuesFunction<
  typeof AZURE_DEVOPS_CONN_OPTIONS,
  string
> = async (context) => {
  const { token, organization } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'organization'],
    ErrorClass: AzureDevOpsError,
  });

  const baseUrl = `https://vssps.dev.azure.com/${organization}/_apis/graph/users`;

  const params = new URLSearchParams({
    'api-version': '7.2-preview.1',
    subjectTypes: 'aad,msa',
    top: '200',
  });

  try {
    const client = createAzureDevOpsClient({ token, organization });

    const response = await client.vsoClient.restClient.get(`${baseUrl}?${params}`);

    const result = response.result as { value: Record<string, any>[] };

    return result.value.map(mapAzureDevOpsItemToAllowedValue);
  } catch (error) {
    throw new AzureDevOpsError('Failed to fetch allowed values: ' + error);
  }
};
