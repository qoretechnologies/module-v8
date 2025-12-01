import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { COPPER_CRM_APP_NAME, CopperCrmError } from '../constants';
import { copperCrmApiClient } from '../helpers/constants';
import { getCopperCrmCompanyAllowedValues } from '../helpers/get-company-allowed-values';
import {
  getCopperCrmCustomFieldDynamicResponseTypeFunction,
  getCopperCrmCustomFieldDynamicTypeFunction,
  mapCopperCrmCustomFieldsObjectToArray,
  mapCopperCrmCustomFieldsResponseArrayToObject,
  TCopperCrmCustomFieldValue,
} from '../helpers/get-custom-fields';
import { getCopperCrmCustomerSourceAllowedValues } from '../helpers/get-customer-source-allowed-values';
import { getCopperCrmLossReasonAllowedValues } from '../helpers/get-loss-reason-allowed-values';
import { getCopperCrmPersonAllowedValues } from '../helpers/get-person-allowed-values';
import { getCopperCrmPipelineAllowedValues } from '../helpers/get-pipeline-allowed-values';
import { getCopperCrmPipelineStageAllowedValues } from '../helpers/get-pipeline-stage-allowed-values';
import { getCopperCrmTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { getCopperCrmUserAllowedValues } from '../helpers/get-user-allowed-values';
import { CopperCrmOpportunityResponseType } from '../response-types/opportunity';

const action = 'create_opportunity';

const options = {
  name: {
    type: 'string',
    required: true,
  },
  primary_contact_id: {
    type: 'number',
    required: true,
    get_allowed_values: getCopperCrmPersonAllowedValues,
  },
  assignee_id: {
    type: 'number',
    get_allowed_values: getCopperCrmUserAllowedValues,
    preselected: true,
  },
  close_date: {
    type: 'string',
    preselected: true,
  },
  company_id: {
    type: 'number',
    get_allowed_values: getCopperCrmCompanyAllowedValues,
    preselected: true,
  },
  customer_source_id: {
    type: 'number',
    get_allowed_values: getCopperCrmCustomerSourceAllowedValues,
    preselected: true,
  },
  details: {
    type: 'string',
    preselected: true,
  },
  loss_reason_id: {
    type: 'number',
    get_allowed_values: getCopperCrmLossReasonAllowedValues,
  },
  monetary_value: {
    type: 'number',
    preselected: true,
  },
  pipeline_id: {
    type: 'number',
    get_allowed_values: getCopperCrmPipelineAllowedValues,
    preselected: true,
    on_change: ['refetch'],
  },
  pipeline_stage_id: {
    type: 'number',
    get_allowed_values: getCopperCrmPipelineStageAllowedValues,
    preselected: true,
    depends_on: ['pipeline_id'],
  },
  priority: {
    type: 'string',
    preselected: true,
    allowed_values: [
      { value: 'None', display_name: 'None' },
      { value: 'Low', display_name: 'Low' },
      { value: 'Medium', display_name: 'Medium' },
      { value: 'High', display_name: 'High' },
    ],
  },
  status: {
    type: 'string',
    preselected: true,
    allowed_values: [
      { value: 'Open', display_name: 'Open' },
      { value: 'Won', display_name: 'Won' },
      { value: 'Lost', display_name: 'Lost' },
      { value: 'Abandoned', display_name: 'Abandoned' },
    ],
  },
  tags: {
    type: {
      type: 'list',
      element_type: { type: 'string' },
    },
    get_element_allowed_values: getCopperCrmTagAllowedValues,
    element_allowed_values_creatable: true,
  },
  win_probability: {
    type: 'number',
    preselected: true,
  },
  custom_fields: {
    type: {
      type: 'hash',
    },
    get_dynamic_type: getCopperCrmCustomFieldDynamicTypeFunction(['opportunity']),
  },
} satisfies TQoreOptions;

type TCreateOpportunityResponse = {
  id: string;
  [key: string]: any;
  custom_fields?: Array<TCopperCrmCustomFieldValue>;
  date_created: number;
  date_modified: number;
};

const CreateOpportunity = QoreAppCreator.createLocalizedAction<typeof options>({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, email } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['email', 'token'],
      optionFields: ['name', 'primary_contact_id'],
      ErrorClass: CopperCrmError,
    });

    const customFields = obj?.custom_fields
      ? mapCopperCrmCustomFieldsObjectToArray(obj.custom_fields)
      : [];

    const baseFields = omit(obj, ['custom_fields']);

    const body = {
      ...baseFields,
      ...(customFields.length && { custom_fields: customFields }),
    };

    try {
      const response = await copperCrmApiClient<TCreateOpportunityResponse>({
        path: `opportunities`,
        method: 'POST',
        token,
        email,
        body,
      });

      const { custom_fields, ...restResponse } = response;

      const formattedCustomFields = custom_fields
        ? await mapCopperCrmCustomFieldsResponseArrayToObject({
            token,
            email,
            customFieldsArray: custom_fields,
          })
        : {};

      return {
        ...restResponse,
        custom_fields: formattedCustomFields,
      };
    } catch (error) {
      if (error instanceof CopperCrmError) {
        throw error;
      }

      throw new CopperCrmError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: CopperCrmOpportunityResponseType,
  get_dynamic_response_type: async (context) => {
    const customFields = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['opportunity'])(
      context
    );

    return {
      type: 'hash',
      fields: {
        ...CopperCrmOpportunityResponseType.fields,
        custom_fields: customFields as TQoreAppActionOption,
      },
    };
  },
});

export default CreateOpportunity;
