import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { ESIGNATURE_CONN_OPTIONS } from '../constants';
import { Debugger } from '../../../utils/Debugger';

export const getEsignatureRecipientIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof ESIGNATURE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, base_uri },
    opts: { accountId, envelopeId },
  } = context;

  const items: IQoreAllowedValue[] = [];

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
            (item: any): IQoreAllowedValue => ({
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
