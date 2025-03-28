import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { fetchMagentoAllowedValues } from '../../magento/helpers/constants';

type TMagentoReturnData = {
  entity_id: string;
  increment_id: string;
  order_id: string;
  order_increment_id: string;
  created_at: string;
  customer_name: string;
  status: string;
  items: {
    entity_id: string;
    name: string;
    sku: string;
    qty_requested: number;
    reason: string;
  }[];
};

const mapMagentoReturn = (returnData: TMagentoReturnData): IQoreAllowedValue<string> => ({
  display_name: `Return #${returnData.increment_id} - Order #${returnData.order_increment_id}`,
  value: returnData.entity_id,
  desc:
    `Created: ${returnData.created_at}\n\n` +
    `Customer: ${returnData.customer_name}\n\n` +
    `Status: ${returnData.status}`,
});

export const getMagentoReturnIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const url = context?.conn_opts?.url;

  const missingValues: string[] = [];

  if (!url) missingValues.push('url');
  if (!token) missingValues.push('token');

  if (missingValues.length) {
    throw new Error(
      `All of the following values are required: ${missingValues.join(', ')} to fetch return allowed values for Magento`
    );
  }

  const returns = await fetchMagentoAllowedValues<TMagentoReturnData>({
    url: url!,
    token: token!,
    mapItemToAllowedValue: mapMagentoReturn,
    path: '/V1/returns',
  });

  return returns;
};
