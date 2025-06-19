import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { createOdooClient } from './constants';

const modelFieldsAttributes = ['type', 'readonly', 'required', 'string', 'relation'];

type TOdooModelField = {
  type: string;
  readonly: boolean;
  required: boolean;
  string: string;
  relation?: string;
};

const createOdooModelFieldsAllowedValuesFunction = (
  model: string
): TQoreGetAllowedValuesFunction<TCustomConnOptions, string> => {
  return async (context) => {
    const { subdomain, username, password } = getQoreContextRequiredValues({
      context,
      connectionFields: ['subdomain', 'username', 'password'],
      ErrorClass: OdooError,
    });

    try {
      const client = await createOdooClient({
        subdomain,
        username,
        password,
      });

      const fields: Record<string, TOdooModelField> = await client.getFields(
        model,
        modelFieldsAttributes
      );

      return Object.keys(fields).map((key) => ({
        value: key,
        display_name: fields[key].string,
        desc: `Type: ${fields[key].type}\nRequired: ${fields[key].required}\nReadonly: ${fields[key].readonly}`,
      }));
    } catch (error) {
      throw new OdooError(`Failed to fetch model fields: ${error.message || error}`);
    }
  };
};

export const getOdooLeadFieldsAllowedValues =
  createOdooModelFieldsAllowedValuesFunction('crm.lead');

export const getOdooPartnerFieldsAllowedValues =
  createOdooModelFieldsAllowedValuesFunction('res.partner');

export const getOdooCompanyFieldsAllowedValues =
  createOdooModelFieldsAllowedValuesFunction('res.company');
