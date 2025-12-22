import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { HELPSCOUT_APP_NAME, HelpScoutError } from '../constants';
import { helpScoutApiClient } from '../helpers/constants';
import { getHelpScoutFolderAllowedValues } from '../helpers/get-folder-allowed-values';
import { getHelpScoutTagAllowedValues } from '../helpers/get-tag-allowed-values';
import { HelpScoutEmailReportResponseType } from '../response-types/email-report';

const action = 'get_email_report';

const options = {
  start: {
    type: 'date',
    required: true,
  },
  end: {
    type: 'date',
    required: true,
  },
  previousStart: {
    type: 'date',
    required: false,
  },
  previousEnd: {
    type: 'date',
    required: false,
  },
  mailboxes: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
  tags: {
    type: {
      type: 'list',
      element_type: 'integer',
    },
    get_element_allowed_values: getHelpScoutTagAllowedValues,
    required: false,
  },
  folders: {
    type: {
      type: 'list',
      element_type: 'integer',
    },
    get_element_allowed_values: getHelpScoutFolderAllowedValues,
    required: false,
  },
  officeHours: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const getHelpScoutEmailReport = QoreAppCreator.createLocalizedAction<typeof options>({
  app: HELPSCOUT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: HelpScoutEmailReportResponseType,
  api_function: async (obj, _opts, context) => {
    const { token, start, end } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['start', 'end'],
      connectionFields: ['token'],
      ErrorClass: HelpScoutError,
    });

    const { previousStart, previousEnd, mailboxes, tags, folders, officeHours } = obj || {};

    try {
      const params: Record<string, string> = {
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
      };

      if (previousStart) params.previousStart = new Date(previousStart).toISOString();
      if (previousEnd) params.previousEnd = new Date(previousEnd).toISOString();
      if (mailboxes) params.mailboxes = mailboxes.join(',');
      if (tags) params.tags = tags.join(',');
      if (folders) params.folders = folders.join(',');
      if (officeHours !== undefined) params.officeHours = String(officeHours);

      return await helpScoutApiClient({
        token,
        path: 'reports/email',
        method: 'GET',
        params,
      });
    } catch (error) {
      throw new HelpScoutError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default getHelpScoutEmailReport;
