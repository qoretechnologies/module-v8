import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { fetchPayPalAllowedValues } from './constants';
import { PayPalError } from '../constants';

type TPayPalItem = {
  id: string;
  status: string;
  detail: {
    invoice_number: string;
    note: string;
    invoice_date: string;
  };
  amount: {
    currency_code: string;
    value: string;
  };
};

const mapPayPalItemToAllowedValue = (item: TPayPalItem): IQoreAllowedValue<string> => {
  return {
    value: item.id,
    display_name: `${item.detail.invoice_number} - ${item.amount.value} ${item.amount.currency_code}`,
    desc: `Status: ${item.status}\nDate: ${item.detail.invoice_date}\nNote: ${item.detail.note || 'N/A'}`,
  };
};

export const getPayPalInvoiceAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, environment } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'environment'],
    ErrorClass: PayPalError,
  });

  return await fetchPayPalAllowedValues<TPayPalItem>({
    token,
    environment,
    path: `v2/invoicing/invoices`,
    object: 'items',
    mapItemToAllowedValue: mapPayPalItemToAllowedValue,
  });
};
