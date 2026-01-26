import { RebootInstancesCommand } from '@aws-sdk/client-ec2';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_EC2_APP_NAME, AmazonEC2Error } from '../constants';
import { createEC2Client } from '../helpers/constants';
import { getAmazonEc2InstanceIdAllowedValues } from '../helpers/get-instance-id-allowed-values';

const options = {
  instance_ids: {
    required: true,
    depends_on: ['region'],
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values_creatable: true,
    get_element_allowed_values: getAmazonEc2InstanceIdAllowedValues,
  },
  region: {
    required: false,
    preselected: true,
    on_change: ['refetch'],
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
  },
} satisfies TQoreOptions;

const rebootInstance = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_EC2_APP_NAME,
  action: 'reboot_instance',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, instance_ids } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['instance_ids'],
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonEC2Error,
    });

    const region = obj?.region || context?.conn_opts?.region;

    if (!instance_ids || instance_ids.length === 0) {
      throw new AmazonEC2Error('At least one instance ID must be provided');
    }

    try {
      const ec2Client = createEC2Client({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new RebootInstancesCommand({
        InstanceIds: instance_ids,
      });

      await ec2Client.send(command);

      return {
        instance_ids,
        region: region || 'us-east-1',
        action: 'reboot',
        message: `Rebooting ${instance_ids.length} instance(s)`,
      };
    } catch (error) {
      throw new AmazonEC2Error(`Failed to reboot instances: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      instance_ids: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      region: { type: 'string' },
      action: { type: 'string' },
      message: { type: 'string' },
    },
  },
});

export default rebootInstance;
