import { StopInstancesCommand } from '@aws-sdk/client-ec2';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AMAZON_EC2_APP_NAME, AmazonEC2Error } from '../constants';
import { createEC2Client } from '../helpers/constants';
import { getAmazonEc2InstanceIdAllowedValues } from '../helpers/get-instance-id-allowed-values';
import { getAmazonEc2RegionAllowedValues } from '../helpers/get-region-allowed-values';

const options = {
  instance_ids: {
    required: true,
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values_creatable: true,
    get_element_allowed_values: getAmazonEc2InstanceIdAllowedValues,
    depends_on: ['region'],
  },
  region: {
    required: true,
    preselected: false,
    on_change: ['refetch'],
    type: 'string',
    default_value: 'us-east-1',
    allowed_values_creatable: true,
    get_allowed_values: getAmazonEc2RegionAllowedValues,
  },
  force: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
} satisfies TQoreOptions;

const stopInstance = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_EC2_APP_NAME,
  action: 'stop_instance',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, instance_ids, region } = getQoreContextRequiredValues(
      {
        context: { ...context, opts: obj },
        optionFields: ['instance_ids', 'region'],
        connectionFields: ['access_key_id', 'secret_access_key'],
        ErrorClass: AmazonEC2Error,
      }
    );

    if (!instance_ids || instance_ids.length === 0) {
      throw new AmazonEC2Error('At least one instance ID must be provided');
    }

    const { force = false } = obj || {};

    try {
      const ec2Client = createEC2Client({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new StopInstancesCommand({
        InstanceIds: instance_ids,
        Force: force || false,
      });

      const response = await ec2Client.send(command);

      const stoppingInstances =
        response.StoppingInstances?.map((instance) => ({
          instance_id: instance.InstanceId,
          current_state: instance.CurrentState?.Name,
          previous_state: instance.PreviousState?.Name,
        })) || [];

      return {
        instance_ids,
        region: region || 'us-east-1',
        action: 'stop',
        force: force || false,
        message: `Stopping ${instance_ids.length} instance(s)${force ? ' (forced)' : ''}`,
        stopping_instances: stoppingInstances,
      };
    } catch (error) {
      throw new AmazonEC2Error(`Failed to stop instances: ${error.message || error}`);
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
      force: { type: 'boolean' },
      message: { type: 'string' },
      stopping_instances: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              instance_id: { type: 'string' },
              current_state: { type: 'string' },
              previous_state: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default stopInstance;
