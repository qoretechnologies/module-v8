import { DescribeRegionsCommand } from '@aws-sdk/client-ec2';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { AMAZON_EC2_APP_NAME, AmazonEC2Error } from '../constants';
import { createEC2Client } from '../helpers/constants';

const options = {
  all_regions: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
} satisfies TQoreOptions;

const describeRegions = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_EC2_APP_NAME,
  action: 'describe_regions',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, all_regions } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonEC2Error,
    });

    try {
      const ec2Client = createEC2Client({
        access_key_id,
        secret_access_key,
      });

      const command = new DescribeRegionsCommand({
        AllRegions: all_regions || false,
      });

      const response = await ec2Client.send(command);

      const regions =
        response.Regions?.map((region) => ({
          region_name: region.RegionName,
          endpoint: region.Endpoint,
          opt_in_status: region.OptInStatus,
        })) || [];

      return regions;
    } catch (error) {
      throw new AmazonEC2Error(`Failed to describe regions: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        region_name: { type: 'string' },
        endpoint: { type: 'string' },
        opt_in_status: { type: 'string' },
      },
    },
  },
});

export default describeRegions;
