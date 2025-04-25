import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { XeroError } from '../constants';
import { getTenantIdRequired, getTokenRequired, getXeroAllowedValues } from './constants';

type XeroCreditNote = {
  CreditNoteID: string;
  CreditNoteNumber?: string;
  Reference?: string;
  Type: string;
  Status: string;
  RemainingCredit: number;
  Total: number;
  CurrencyCode: string;
  Date: string;
  Contact: {
    ContactID: string;
    Name: string;
  };
};

const mapXeroCreditNoteToAllowedValue = (
  creditNote: XeroCreditNote
): IQoreAllowedValue<string> => ({
  display_name: creditNote.CreditNoteNumber || creditNote.Reference || creditNote.CreditNoteID,
  value: creditNote.CreditNoteID,
  desc:
    `Type: ${creditNote.Type}\n\n` +
    `Status: ${creditNote.Status}\n\n` +
    `Total: ${creditNote.Total} ${creditNote.CurrencyCode}\n\n` +
    `Remaining Credit: ${creditNote.RemainingCredit} ${creditNote.CurrencyCode}\n\n` +
    `Date: ${creditNote.Date}\n\n` +
    `Contact: ${creditNote.Contact?.Name || 'Unknown'}`,
});

export const getXeroCreditNoteIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);

    return await getXeroAllowedValues({
      token,
      tenantId,
      path: 'CreditNotes',
      dataPath: 'CreditNotes',
      mapItemToAllowedValue: mapXeroCreditNoteToAllowedValue,
    });
  } catch (error) {
    throw new XeroError(`Couldn't fetch Xero credit note IDs: ${error}`);
  }
};
