import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const GoogleFormsEmailCollectionAllowedValues = [
  {
    value: 'DO_NOT_COLLECT',
    display_name: 'Do not collect email addresses',
    desc: `The form doesn't collect email addresses. Default value if the form owner uses a Google account.`,
  },
  {
    value: 'VERIFIED',
    display_name: 'Collect email addresses',
    desc:
      `	The form collects email addresses automatically based on the account of the signed-in user.` +
      `Default value if the form owner uses a Google Workspace account.`,
  },
  {
    value: 'RESPONDER_INPUT',
    display_name: 'Collect email addresses from responders',
    desc: `The form collects email addresses using a field that the respondent completes on the form.`,
  },
] satisfies IQoreAllowedValue<string>[];
