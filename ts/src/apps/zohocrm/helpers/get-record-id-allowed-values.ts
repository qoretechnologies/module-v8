import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ZohoCrmError } from '../constants';
import { fetchZohoCrmAllowedValues } from './constants';
import { extractZohoCrmErrorMessage } from './extract-error';

const DISPLAY_FIELD_MAP: Partial<Record<string, string>> = {
  Leads: 'Last_Name',
  Contacts: 'Last_Name',
  Accounts: 'Account_Name',
  Deals: 'Deal_Name',
  Tasks: 'Subject',
  Calls: 'Subject',
  Events: 'Event_Title',
  Products: 'Product_Name',
  Quotes: 'Subject',
  Invoices: 'Subject',
  Campaigns: 'Campaign_Name',
  Vendors: 'Vendor_Name',
  Price_Books: 'Price_Book_Name',
  Cases: 'Subject',
  Solutions: 'Solution_Title',
  Purchase_Orders: 'Subject',
  Sales_Orders: 'Subject',
};

const MODULE_FIELD_KEYS: Record<string, string[]> = {
  Leads: ['Last_Name'],
  Contacts: ['Last_Name'],
  Accounts: ['Account_Name'],
  Deals: ['Deal_Name', 'Stage', 'Pipeline'],
  Tasks: ['Subject'],
  Calls: ['Subject', 'Call_Type', 'Call_Start_Time'],
  Events: ['Event_Title', 'Start_DateTime', 'End_DateTime'],
  Products: ['Product_Name'],
  Quotes: ['Subject'],
  Invoices: ['Subject'],
  Campaigns: ['Campaign_Name'],
  Vendors: ['Vendor_Name'],
  Price_Books: ['Price_Book_Name'],
  Cases: ['Case_Origin', 'Status', 'Subject'],
  Solutions: ['Solution_Title'],
  Purchase_Orders: ['Subject', 'Vendor_Name'],
  Sales_Orders: ['Subject'],
};

const mapItemToAllowedValue =
  (module: keyof typeof MODULE_FIELD_KEYS) =>
  (item: any): IQoreAllowedValue<string> => {
    const displayField = DISPLAY_FIELD_MAP[module];
    const displayName = (displayField && item[displayField]) || item.id;

    const descFields = MODULE_FIELD_KEYS[module].filter((f) => f !== displayField);

    const desc =
      descFields.length > 0
        ? descFields
            .map((key) => {
              const val = item[key];
              return val != null && val !== '' ? `${key}: ${val}` : null;
            })
            .filter(Boolean)
            .join('\n')
        : undefined;

    return {
      value: item.id ?? displayName,
      display_name: displayName,
      ...(desc && { desc }),
    };
  };

export const getZohoCrmRecordIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token, url, module } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['module'],
      ErrorClass: ZohoCrmError,
    });

    return await fetchZohoCrmAllowedValues({
      token,
      url,
      object: 'data',
      params: {
        fields: `id,${(MODULE_FIELD_KEYS[module] || []).join(',')}`,
        order_by: 'Created_Time',
        sort_order: 'desc',
      },
      mapItemToAllowedValue: mapItemToAllowedValue(module),
      path: `${module}`,
    });
  } catch (error) {
    if (error instanceof ZohoCrmError) {
      throw error;
    }

    throw new ZohoCrmError(`Failed to fetch ZohoCRM record IDs: ${extractZohoCrmErrorMessage(error)}`);
  }
};
