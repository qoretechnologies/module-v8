import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_FORMS_APP_NAME, GoogleFormsError } from '../constants';
import { createGoogleFormsClient } from '../helpers/constants';
import { getGoogleFormIdAllowedValues } from '../helpers/get-form-id-allowed-values';

const options = {
  form_id: {
    required: true,
    type: 'string',
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getGoogleFormIdAllowedValues,
  },
  is_accepting_responses: {
    required: false,
    type: 'boolean',
    required_groups: ['publish_settings'],
  },
  is_published: {
    required: false,
    type: 'boolean',
    required_groups: ['publish_settings'],
  },
} satisfies TQoreOptions;

const updateFormPublishSettings = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_FORMS_APP_NAME,
  action: 'update_form_publish_settings',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, form_id } = getQoreContextRequiredValues<{
      token: string;
      form_id: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['form_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleFormsError,
    });

    const isAcceptingResponses = obj?.is_accepting_responses;
    const isPublished = obj?.is_published;

    if (isAcceptingResponses === undefined && isPublished === undefined) {
      throw new GoogleFormsError(
        'At least one publish setting (isAcceptingResponses or isPublished) must be provided'
      );
    }

    try {
      const formsClient = createGoogleFormsClient(token);

      const currentForm = await formsClient.forms.get({
        formId: form_id,
        fields: 'settings',
      });

      const updateMask: string[] = [];
      const settings: any = {
        ...currentForm.data.settings,
      };

      if (isAcceptingResponses !== undefined) {
        settings.isAcceptingResponses = isAcceptingResponses;
        updateMask.push('settings.isAcceptingResponses');
      }

      if (isPublished !== undefined) {
        settings.isPublished = isPublished;
        updateMask.push('settings.isPublished');
      }

      await formsClient.forms.batchUpdate({
        formId: form_id,
        requestBody: {
          requests: [
            {
              updateSettings: {
                settings,
                updateMask: updateMask.join(','),
              },
            },
          ],
        },
      });

      const updatedForm = await formsClient.forms.get({
        formId: form_id,
        fields: 'settings',
      });

      return {
        form_id,
        success: true,
        isAcceptingResponses:
          updatedForm.data.publishSettings?.publishState?.isAcceptingResponses ?? false,
        isPublished: updatedForm.data.publishSettings?.publishState?.isPublished ?? false,
        updated_settings: updateMask,
        message: `Successfully updated ${updateMask.length} publish setting(s)`,
      };
    } catch (error: any) {
      throw new GoogleFormsError(
        `Failed to update form publish settings: ${error.message || error}`
      );
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      form_id: { type: 'string' },
      success: { type: 'boolean' },
      isAcceptingResponses: { type: 'boolean' },
      isPublished: { type: 'boolean' },
      updated_settings: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      message: { type: 'string' },
    },
  },
});

export default updateFormPublishSettings;
