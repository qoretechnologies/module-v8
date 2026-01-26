import { DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_EC2_APP_NAME, AmazonEC2Error } from '../constants';
import { createEC2Client, formatEC2Date } from '../helpers/constants';
import { getAmazonEc2InstanceIdAllowedValues } from '../helpers/get-instance-id-allowed-values';

const options = {
  instance_ids: {
    required: false,
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
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
  },
  max_results: {
    required: false,
    type: 'integer',
    default_value: 100,
  },
  next_page_token: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const describeInstances = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_EC2_APP_NAME,
  action: 'describe_instances',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonEC2Error,
    });

    const region = obj?.region || context?.conn_opts?.region;
    const { instance_ids, max_results = 100, next_page_token } = obj || {};

    try {
      const ec2Client = createEC2Client({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new DescribeInstancesCommand({
        ...(instance_ids && instance_ids.length > 0 && { InstanceIds: instance_ids }),
        MaxResults: max_results,
        ...(next_page_token && { NextToken: next_page_token }),
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

      return {
        region: region || 'us-east-1',
        instance_count: instances.length,
        instances,
        next_token: response.NextToken,
      };
    } catch (error) {
      throw new AmazonEC2Error(`Failed to describe instances: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      region: { type: 'string' },
      instance_count: { type: 'integer' },
      instances: {
        type: {
          type: 'list',
          element_type: {
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
      },
      next_token: { type: 'string' },
    },
  },
});

export default describeInstances;
