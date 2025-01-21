import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { ESIGNATURE_CONN_OPTIONS } from '../constants';
import { Debugger } from '../../../utils/Debugger';

export const createEsignatureRecipientIdAllowedValues = (
  entity: string
): TQoreGetAllowedValuesFunction<typeof ESIGNATURE_CONN_OPTIONS> => {
  return async (context): Promise<IQoreAllowedValue[]> => {
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

      const { [entity]: fetchedItems } = data;

      items.push(
        ...fetchedItems.map(
          (item: any): IQoreAllowedValue => ({
            value: item.recipientId,
            display_name: item.name,
            desc:
              `Signer ID: ${item.userId}\n\nFirst Name: ${item.firstName}\n\n` +
              `Last Name: ${item.lastName}\n\nEmail: ${item.email}`,
          })
        )
      );

      return items;
    } catch (error) {
      Debugger.log(`Error fetching ${entity} for envelope ${envelopeId}:`, error);

      return [];
    }
  };
};

export const getEsignatureSignerIdAllowedValues =
  createEsignatureRecipientIdAllowedValues('signers');

export const getEsignatureAgentIdAllowedValues = createEsignatureRecipientIdAllowedValues('agents');

export const getEsignatureEditorIdAllowedValues =
  createEsignatureRecipientIdAllowedValues('editors');

export const getEsignatureWitnessIdAllowedValues =
  createEsignatureRecipientIdAllowedValues('witnesses');

export const getEsignatureNotaryIdAllowedValues =
  createEsignatureRecipientIdAllowedValues('notaries');
