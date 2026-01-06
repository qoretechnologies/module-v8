import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { ESIGNATURE_CONN_OPTIONS } from '../conn-options';

export const getEsignatureRecipientIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof ESIGNATURE_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const base_uri = context?.conn_opts?.base_uri;
  const accountId = context?.opts?.accountId;
  const envelopeId = context?.opts?.envelopeId;

  const missingOptions = [];

  if (!token) missingOptions.push('token');
  if (!base_uri) missingOptions.push('base_uri');
  if (!accountId) missingOptions.push('accountId');
  if (!envelopeId) missingOptions.push('envelopeId');

  if (missingOptions.length > 0) {
    throw new Error(
      `The following options are required to get Esignature recipient allowed values: ${missingOptions.join(', ')}`
    );
  }

  const items: IQoreAllowedValue<string>[] = [];

  try {
    const { data } = await QorusRequest.get<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: `/restapi/v2.1/accounts/${accountId}/envelopes/${envelopeId}/recipients`,
      },
      { url: `https://${base_uri}`, endpointId: 'Esignature' }
    );

    for (const [key, fetchedItems] of Object.entries(data)) {
      if (Array.isArray(fetchedItems)) {
        items.push(
          ...fetchedItems.map(
            (item: any): IQoreAllowedValue<string> => ({
              value: item.recipientId,
              display_name: item.name || 'Unnamed Recipient',
              desc: [
                `Recipient Type: ${key}`,
                `ID: ${item.userId || 'N/A'}`,
                `First Name: ${item.firstName || 'N/A'}`,
                `Last Name: ${item.lastName || 'N/A'}`,
                `Email: ${item.email || 'N/A'}`,
              ].join('\n\n'),
            })
          )
        );
      }
    }

    return items;
  } catch (error) {
    Debugger.log(`Error fetching recipients for envelope ${envelopeId}:`, error);

    return [];
  }
};
