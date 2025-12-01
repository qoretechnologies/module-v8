import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { COPPER_CRM_APP_NAME, CopperCrmError } from '../constants';
import { copperCrmApiClient } from '../helpers/constants';
import {
  getCopperCrmCustomFieldDynamicResponseTypeFunction,
  mapCopperCrmCustomFieldsResponseArrayToObject,
  TCopperCrmCustomFieldValue,
} from '../helpers/get-custom-fields';
import { getCopperCrmLeadAllowedValues } from '../helpers/get-lead-allowed-values';
import { CopperCrmLeadResponseType } from '../response-types/lead';

const action = 'get_lead';

const options = {
  lead_id: {
    type: 'number',
    required: true,
    get_allowed_values: getCopperCrmLeadAllowedValues,
  },
} satisfies TQoreOptions;

type TGetLeadResponse = {
  id: string;
  [key: string]: any;
  custom_fields?: Array<TCopperCrmCustomFieldValue>;
  date_created: number;
  date_updated: number;
};

const GetLead = QoreAppCreator.createLocalizedAction<typeof options>({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, email, lead_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['email', 'token'],
      optionFields: ['lead_id'],
      ErrorClass: CopperCrmError,
    });

    try {
      const response = await copperCrmApiClient<TGetLeadResponse>({
        path: `leads/${lead_id}`,
        method: 'GET',
        token,
        email,
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
  response_type: CopperCrmLeadResponseType,
  get_dynamic_response_type: async (context) => {
    const customFields = await getCopperCrmCustomFieldDynamicResponseTypeFunction(['lead'])(
      context
    );

    return {
      type: 'hash',
      fields: {
        ...CopperCrmLeadResponseType.fields,
        custom_fields: customFields as TQoreAppActionOption,
      },
    };
  },
});

export default GetLead;
