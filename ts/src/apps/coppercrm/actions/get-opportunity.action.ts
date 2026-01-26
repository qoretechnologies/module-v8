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
import { getCopperCrmOpportunityAllowedValues } from '../helpers/get-opportunity-allowed-values';
import { CopperCrmOpportunityResponseType } from '../response-types/opportunity';

const action = 'get_opportunity';

const options = {
  opportunity_id: {
    type: 'number',
    required: true,
    get_allowed_values: getCopperCrmOpportunityAllowedValues,
  },
} satisfies TQoreOptions;

type TGetOpportunityResponse = {
  id: string;
  [key: string]: any;
  custom_fields?: Array<TCopperCrmCustomFieldValue>;
  date_created: number;
  date_modified: number;
};

const GetOpportunity = QoreAppCreator.createLocalizedAction<typeof options>({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, opportunity_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['opportunity_id'],
      ErrorClass: CopperCrmError,
    });

    try {
      const response = await copperCrmApiClient<TGetOpportunityResponse>({
        path: `opportunities/${opportunity_id}`,
        method: 'GET',
        token,
      });

      const { custom_fields, ...restResponse } = response;

      const formattedCustomFields = custom_fields
        ? await mapCopperCrmCustomFieldsResponseArrayToObject({
            token,
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

export default GetOpportunity;
