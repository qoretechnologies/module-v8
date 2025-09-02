import { DescribeInstanceStatusCommand } from '@aws-sdk/client-ec2';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { AMAZON_EC2_APP_NAME, AmazonEC2Error } from '../constants';
import { createEC2Client, formatEC2Date } from '../helpers/constants';
import { getAmazonEc2InstanceIdAllowedValues } from '../helpers/get-instance-id-allowed-values';
import { getAmazonEc2RegionAllowedValues } from '../helpers/get-region-allowed-values';

const options = {
  region: {
    required: true,
    type: 'string',
    default_value: 'us-east-1',
    allowed_values_creatable: true,
    get_allowed_values: getAmazonEc2RegionAllowedValues,
    on_change: ['refetch'],
  },
  instance_ids: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values_creatable: true,
    get_element_allowed_values: getAmazonEc2InstanceIdAllowedValues,
    depends_on: ['region'],
  },
  event_types: {
    required: true,
    type: {
      type: 'list',
      element_type: 'string',
    },
    default_value: ['system-reboot', 'system-maintenance', 'instance-retirement'],
    element_allowed_values: [
      { value: 'system-reboot', display_name: 'System Reboot' },
      { value: 'system-maintenance', display_name: 'System Maintenance' },
      { value: 'instance-retirement', display_name: 'Instance Retirement' },
      { value: 'instance-stop', display_name: 'Instance Stop' },
    ],
  },
} satisfies TQoreOptions;

const AmazonEC2NewScheduledEventTrigger = QoreAppCreator.createLocalizedTrigger({
  app: AMAZON_EC2_APP_NAME,
  action: 'new_scheduled_event',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { access_key_id, secret_access_key, region, instance_ids, event_types } =
      getQoreContextRequiredValues({
        context,
        connectionFields: ['access_key_id', 'secret_access_key'],
        optionFields: ['region', 'instance_ids', 'event_types'],
        ErrorClass: AmazonEC2Error,
      });

    const getItems = () => {
      return fetchLatestScheduledEvents({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
        instance_ids: instance_ids || [],
        event_types: event_types || ['system-reboot', 'system-maintenance', 'instance-retirement'],
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'amazon_ec2_new_scheduled_event',
      uniqueField: 'event_id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { access_key_id, secret_access_key, region, instance_ids, event_types } =
      getQoreContextRequiredValues({
        context,
        connectionFields: ['access_key_id', 'secret_access_key'],
        optionFields: ['region', 'instance_ids', 'event_types'],
        ErrorClass: AmazonEC2Error,
      });

    const events = await fetchLatestScheduledEvents({
      access_key_id,
      secret_access_key,
      region: region || 'us-east-1',
      instance_ids: instance_ids || [],
      event_types: event_types || ['system-reboot', 'system-maintenance', 'instance-retirement'],
    });

    return events?.length > 0 ? events[0] : null;
  },
  event_info: {
    desc: 'Amazon EC2 New Scheduled Event Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        event_id: { type: 'string' },
        instance_id: { type: 'string' },
        instance_name: { type: 'string' },
        event_type: { type: 'string' },
        event_description: { type: 'string' },
        not_before: { type: 'string' },
        not_after: { type: 'string' },
        instance_state: {
          type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              code: { type: 'integer' },
            },
          },
        },
        system_status: {
          type: {
            type: 'hash',
            fields: {
              status: { type: 'string' },
              details: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      name: { type: 'string' },
                      status: { type: 'string' },
                      impaired_since: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        instance_status: {
          type: {
            type: 'hash',
            fields: {
              status: { type: 'string' },
              details: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      name: { type: 'string' },
                      status: { type: 'string' },
                      impaired_since: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        availability_zone: { type: 'string' },
        detected_at: { type: 'string' },
      },
    },
  },
});

export default AmazonEC2NewScheduledEventTrigger;

const fetchLatestScheduledEvents = async (options: {
  access_key_id: string;
  secret_access_key: string;
  region: string;
  instance_ids: string[];
  event_types: string[];
}) => {
  const { access_key_id, secret_access_key, region, instance_ids, event_types } = options;

  try {
    const ec2Client = createEC2Client({
      access_key_id,
      secret_access_key,
      region,
    });

    const filters = [];

    if (event_types.length > 0) {
      filters.push({
        Name: 'event.code',
        Values: event_types,
      });
    }

    const command = new DescribeInstanceStatusCommand({
      InstanceIds: instance_ids.length > 0 ? instance_ids : undefined,
      IncludeAllInstances: true,
      Filters: filters.length > 0 ? filters : undefined,
    });

    const response = await ec2Client.send(command);

    const events: any[] = [];

    if (response.InstanceStatuses) {
      for (const instanceStatus of response.InstanceStatuses) {
        if (instanceStatus.Events && instanceStatus.Events.length > 0) {
          for (const event of instanceStatus.Events) {
            const eventId = `${instanceStatus.InstanceId}-${event.Code}-${event.NotBefore?.toISOString()}`;

            const instanceName = instanceStatus.InstanceId || 'Unknown Instance';

            events.push({
              event_id: eventId,
              instance_id: instanceStatus.InstanceId,
              instance_name: instanceName,
              event_type: event.Code,
              event_description: event.Description,
              not_before: formatEC2Date(event.NotBefore),
              not_after: formatEC2Date(event.NotAfter),
              instance_state: {
                name: instanceStatus.InstanceState?.Name,
                code: instanceStatus.InstanceState?.Code,
              },
              system_status: {
                status: instanceStatus.SystemStatus?.Status,
                details: instanceStatus.SystemStatus?.Details?.map((detail) => ({
                  name: detail.Name,
                  status: detail.Status,
                  impaired_since: formatEC2Date(detail.ImpairedSince),
                })),
              },
              instance_status: {
                status: instanceStatus.InstanceStatus?.Status,
                details: instanceStatus.InstanceStatus?.Details?.map((detail) => ({
                  name: detail.Name,
                  status: detail.Status,
                  impaired_since: formatEC2Date(detail.ImpairedSince),
                })),
              },
              availability_zone: instanceStatus.AvailabilityZone,
              detected_at: new Date().toISOString(),
            });
          }
        }
      }
    }

    return events.sort((a, b) => {
      const dateA = new Date(a.not_before || 0);
      const dateB = new Date(b.not_before || 0);

      return dateA.getTime() - dateB.getTime();
    });
  } catch (error) {
    throw new AmazonEC2Error(`Failed to fetch latest scheduled events: ${error.message || error}`);
  }
};
