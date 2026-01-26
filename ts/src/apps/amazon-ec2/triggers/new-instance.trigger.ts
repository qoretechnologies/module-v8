import { DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_EC2_APP_NAME, AmazonEC2Error } from '../constants';
import { createEC2Client, formatEC2Date } from '../helpers/constants';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
  },
  instance_states: {
    required: true,
    type: {
      type: 'list',
      element_type: 'string',
    },
    default_value: ['pending', 'running'],
    element_allowed_values: [
      { value: 'pending', display_name: 'Pending' },
      { value: 'running', display_name: 'Running' },
      { value: 'shutting-down', display_name: 'Shutting Down' },
      { value: 'terminated', display_name: 'Terminated' },
      { value: 'stopping', display_name: 'Stopping' },
      { value: 'stopped', display_name: 'Stopped' },
    ],
  },
} satisfies TQoreOptions;

const AmazonEC2NewInstanceTrigger = QoreAppCreator.createLocalizedTrigger({
  app: AMAZON_EC2_APP_NAME,
  action: 'new_instance',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { access_key_id, secret_access_key, instance_states } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['instance_states'],
      ErrorClass: AmazonEC2Error,
    });

    const region = context?.opts?.region || context?.conn_opts?.region;

    const getItems = () => {
      return fetchLatestInstances({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
        instance_states: instance_states || ['pending', 'running'],
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'amazon_ec2_new_instance',
      uniqueField: 'instance_id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { access_key_id, secret_access_key, instance_states } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['instance_states'],
      ErrorClass: AmazonEC2Error,
    });
    const region = context?.opts?.region || context?.conn_opts?.region;

    const instances = await fetchLatestInstances({
      access_key_id,
      secret_access_key,
      region: region || 'us-east-1',
      instance_states: instance_states || ['pending', 'running'],
    });

    return instances?.length > 0 ? instances[0] : null;
  },
  event_info: {
    desc: 'Amazon EC2 New Instance Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        instance_id: { type: 'string' },
        instance_name: { type: 'string' },
        instance_type: { type: 'string' },
        state: {
          type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              code: { type: 'integer' },
            },
          },
        },
        image_id: { type: 'string' },
        launch_time: { type: 'string' },
        placement: {
          type: {
            type: 'hash',
            fields: {
              availability_zone: { type: 'string' },
              tenancy: { type: 'string' },
            },
          },
        },
        vpc_id: { type: 'string' },
        subnet_id: { type: 'string' },
        private_ip_address: { type: 'string' },
        public_ip_address: { type: 'string' },
        private_dns_name: { type: 'string' },
        public_dns_name: { type: 'string' },
        security_groups: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                group_id: { type: 'string' },
                group_name: { type: 'string' },
              },
            },
          },
        },
        key_name: { type: 'string' },
        monitoring: {
          type: {
            type: 'hash',
            fields: {
              state: { type: 'string' },
            },
          },
        },
        platform: { type: 'string' },
        root_device_name: { type: 'string' },
        root_device_type: { type: 'string' },
        architecture: { type: 'string' },
        virtualization_type: { type: 'string' },
        hypervisor: { type: 'string' },
        tags: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                key: { type: 'string' },
                value: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
});

export default AmazonEC2NewInstanceTrigger;

const fetchLatestInstances = async (options: {
  access_key_id: string;
  secret_access_key: string;
  region: string;
  instance_states: string[];
}) => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { access_key_id, secret_access_key, region, instance_states } = options;

  try {
    const ec2Client = createEC2Client({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new DescribeInstancesCommand({
      MaxResults: limit,
      Filters: [
        {
          Name: 'instance-state-name',
          Values: instance_states,
        },
      ],
    });

    const response = await ec2Client.send(command);

    const instances: any[] = [];

    if (response.Reservations) {
      for (const reservation of response.Reservations) {
        if (reservation.Instances) {
          for (const instance of reservation.Instances) {
            const nameTag = instance.Tags?.find((tag) => tag.Key === 'Name');
            const instanceName = nameTag?.Value || 'Unnamed Instance';

            instances.push({
              instance_id: instance.InstanceId,
              instance_name: instanceName,
              instance_type: instance.InstanceType,
              state: {
                name: instance.State?.Name,
                code: instance.State?.Code,
              },
              image_id: instance.ImageId,
              launch_time: formatEC2Date(instance.LaunchTime),
              placement: {
                availability_zone: instance.Placement?.AvailabilityZone,
                tenancy: instance.Placement?.Tenancy,
              },
              vpc_id: instance.VpcId,
              subnet_id: instance.SubnetId,
              private_ip_address: instance.PrivateIpAddress,
              public_ip_address: instance.PublicIpAddress,
              private_dns_name: instance.PrivateDnsName,
              public_dns_name: instance.PublicDnsName,
              security_groups: instance.SecurityGroups?.map((sg) => ({
                group_id: sg.GroupId,
                group_name: sg.GroupName,
              })),
              key_name: instance.KeyName,
              monitoring: {
                state: instance.Monitoring?.State,
              },
              platform: instance.Platform,
              root_device_name: instance.RootDeviceName,
              root_device_type: instance.RootDeviceType,
              architecture: instance.Architecture,
              virtualization_type: instance.VirtualizationType,
              hypervisor: instance.Hypervisor,
              tags: instance.Tags?.map((tag) => ({
                key: tag.Key,
                value: tag.Value,
              })),
            });
          }
        }
      }
    }

    return instances.sort((a, b) => {
      const dateA = new Date(a.launch_time || 0);
      const dateB = new Date(b.launch_time || 0);

      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    throw new AmazonEC2Error(`Failed to fetch latest instances: ${error.message || error}`);
  }
};
