import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../utils/Debugger';

type THubspotFormField = {
  name?: string;
  label?: string;
  fieldType?: string;
  objectTypeId?: string;
};

type THubspotFormFieldGroup = {
  fields?: THubspotFormField[];
};

type THubspotFormDefinition = {
  id: string;
  name: string;
  fieldGroups?: THubspotFormFieldGroup[];
};

const mapFieldToAllowedValue = (field: THubspotFormField): IQoreAllowedValue<string> => ({
  value: field.name ?? '',
  display_name: field.label ?? field.name ?? '',
  desc: field.fieldType ? `Field type: ${field.fieldType}` : undefined,
});

export const getHubspotFormFieldAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const formId = (context?.opts as { formId?: string } | undefined)?.formId;

  if (!token || !formId) {
    return [];
  }

  try {
    const response = await QorusRequest.get<{ data: THubspotFormDefinition }>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: `/marketing/v3/forms/${formId}`,
      },
      {
        url: 'https://api.hubapi.com',
        endpointId: 'Hubspot',
      }
    );

    const form = response?.data;

    if (!form?.fieldGroups?.length) {
      return [];
    }

    const fields = form.fieldGroups
      .flatMap((group) => group.fields ?? [])
      .filter((field): field is THubspotFormField => Boolean(field?.name));

    return fields.map(mapFieldToAllowedValue);
  } catch (error) {
    Debugger.log('Error fetching Hubspot form fields', error);

    return [];
  }
};
