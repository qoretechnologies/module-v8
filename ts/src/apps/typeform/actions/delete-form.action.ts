import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { createClient } from '@typeform/api-client';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { extractTypeformErrorMessage, TYPEFORM_APP_NAME, TypeformError } from '../constants';
import { getTypeformFormIdAllowedValues } from '../helpers/get-form-allowed-values';

const options = {
  form_id: {
    type: 'string',
    required: true,
    get_allowed_values: getTypeformFormIdAllowedValues,
  },
} satisfies TQoreOptions;

const deleteForm = QoreAppCreator.createLocalizedAction<typeof options>({
  app: TYPEFORM_APP_NAME,
  action: 'delete_form',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, form_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['form_id'],
      ErrorClass: TypeformError,
    });

    try {
      const client = createClient({ token });

      const response = await client.forms.delete({
        uid: form_id,
      });

      return response;
    } catch (error) {
      throw new TypeformError(`Failed to delete form: ${extractTypeformErrorMessage(error)}`);
    }
  },
});

export default deleteForm;
