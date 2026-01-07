import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';
import { ESIGNATURE_CONN_OPTIONS } from '../conn-options';

export const getEsignatureDocumentIdAllowedValues: TQoreGetAllowedValuesFunction<
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
      `The following options are required to get Esignature document allowed values: ${missingOptions.join(', ')}`
    );
  }

  const items: IQoreAllowedValue<string>[] = [];

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
        (item: any): IQoreAllowedValue<string> => ({
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
