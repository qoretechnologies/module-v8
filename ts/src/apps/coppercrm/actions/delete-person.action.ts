import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { COPPER_CRM_APP_NAME, CopperCrmError } from '../constants';
import { copperCrmApiClient } from '../helpers/constants';
import { getCopperCrmPersonAllowedValues } from '../helpers/get-person-allowed-values';

const action = 'delete_person';

const options: TQoreOptions = {
  person_id: {
    type: 'number',
    required: true,
    get_allowed_values: getCopperCrmPersonAllowedValues,
  },
};

type TDeletePersonResponse = {
  id: string;
  is_deleted: boolean;
};

const DeletePerson = QoreAppCreator.createLocalizedAction({
  app: COPPER_CRM_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, person_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['person_id'],
      ErrorClass: CopperCrmError,
    });

    try {
      const response = await copperCrmApiClient<TDeletePersonResponse>({
        path: `people/${person_id}`,
        method: 'DELETE',
        token,
      });

      return response;
    } catch (error) {
      if (error instanceof CopperCrmError) {
        throw error;
      }

      throw new CopperCrmError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: {
        type: 'string',
      },
      is_deleted: {
        type: 'boolean',
      },
    },
  },
});

export default DeletePerson;
