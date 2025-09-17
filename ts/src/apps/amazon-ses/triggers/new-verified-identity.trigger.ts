import { ListVerifiedEmailAddressesCommand } from '@aws-sdk/client-ses';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_SES_APP_NAME, AmazonSESError } from '../constants';
import { createSESClient, formatSESDate } from '../helpers/constants';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
  },
} satisfies TQoreOptions;

const AmazonSESNewVerifiedIdentityTrigger = QoreAppCreator.createLocalizedTrigger({
  app: AMAZON_SES_APP_NAME,
  action: 'new_verified_identity',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonSESError,
    });

    const region = context?.opts?.region || context?.conn_opts?.region;

    const getItems = () => {
      return fetchLatestVerifiedIdentities({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'amazon_ses_new_verified_identity',
      uniqueField: 'email_address',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { access_key_id, secret_access_key, region } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['region'],
      ErrorClass: AmazonSESError,
    });

    const identities = await fetchLatestVerifiedIdentities({
      access_key_id,
      secret_access_key,
      region: region || 'us-east-1',
    });

    return identities?.length > 0 ? identities[0] : null;
  },
  event_info: {
    desc: 'Amazon SES New Verified Identity Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        email_address: { type: 'string' },
        identity_type: { type: 'string' },
        verification_status: { type: 'string' },
        verification_token: { type: 'string' },
        verified_at: { type: 'string' },
        region: { type: 'string' },
      },
    },
  },
});

export default AmazonSESNewVerifiedIdentityTrigger;

const fetchLatestVerifiedIdentities = async (options: {
  access_key_id: string;
  secret_access_key: string;
  region: string;
}) => {
  const { access_key_id, secret_access_key, region } = options;

  try {
    const sesClient = createSESClient({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new ListVerifiedEmailAddressesCommand({});
    const response = await sesClient.send(command);

    const identities: any[] = [];

    if (response.VerifiedEmailAddresses) {
      for (const email of response.VerifiedEmailAddresses) {
        if (email) {
          identities.push({
            email_address: email,
            identity_type: 'EmailAddress',
            verification_status: 'Success',
            verification_token: `token-${email.replace('@', '-at-')}`,
            verified_at: formatSESDate(new Date()),
            region,
          });
        }
      }
    }

    return identities;
  } catch (error) {
    throw new AmazonSESError(
      `Failed to fetch latest verified identities: ${error.message || error}`
    );
  }
};
