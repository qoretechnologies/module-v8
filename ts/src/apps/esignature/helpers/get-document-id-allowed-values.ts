import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { ESIGNATURE_CONN_OPTIONS } from '../constants';
import { Debugger } from '../../../utils/Debugger';

export const getEsignatureDocumentIdAllowedValues: TQoreGetAllowedValuesFunction<
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
        path: `/restapi/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents`,
      },
      { url: `https://${base_uri}`, endpointId: 'Esignature' }
    );

    const { envelopeDocuments: fetchedItems } = data;

    items.push(
      ...fetchedItems.map(
        (item: any): IQoreAllowedValue => ({
          value: item.documentId.toString(),
          display_name: item.name,
          short_desc: `Id: ${item.documentId}\n\ntype: ${item.type}\n\n`,
        })
      )
    );

    return items;
  } catch (error) {
    Debugger.log(`Error fetching documents for envelope ${envelopeId}:`, error);

    return [];
  }
};
