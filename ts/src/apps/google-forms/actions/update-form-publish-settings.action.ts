import { forms_v1 } from '@googleapis/forms';
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
    type: 'bool',
    required_groups: ['publish_settings'],
  },
  is_published: {
    required: false,
    type: 'bool',
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

      const form = await formsClient.forms.get({
        formId: form_id,
        fields: 'publishSettings',
      });

      const updateMask: string[] = [];
      const settings: forms_v1.Schema$PublishState = {
        isAcceptingResponses:
          form.data.publishSettings?.publishState?.isAcceptingResponses ?? false,
        isPublished: form.data.publishSettings?.publishState?.isPublished ?? false,
      };

      if (isAcceptingResponses !== undefined) {
        settings.isAcceptingResponses = isAcceptingResponses;
      }

      if (isPublished !== undefined) {
        settings.isPublished = isPublished;
      }

      const updateResponse = await formsClient.forms.setPublishSettings({
        formId: form_id,
        requestBody: {
          publishSettings: {
            publishState: settings,
          },
          updateMask: 'publishState',
        },
      });

      return {
        form_id,
        success: true,
        isAcceptingResponses:
          updateResponse.data.publishSettings?.publishState?.isAcceptingResponses ?? false,
        isPublished: updateResponse.data.publishSettings?.publishState?.isPublished ?? false,
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
      success: { type: 'bool' },
      isAcceptingResponses: { type: 'bool' },
      isPublished: { type: 'bool' },
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
