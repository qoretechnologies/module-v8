import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SupabaseError } from '../constants';
import { createSupabaseClient } from './constants';

export const getSupabaseBucketAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, projectId } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'projectId'],
    ErrorClass: SupabaseError,
  });

  try {
    const client = createSupabaseClient({ token, projectId });

    const { data: buckets, error } = await client.storage.listBuckets();

    if (error) {
      throw new SupabaseError(`Failed to fetch buckets: ${error.message}`);
    }

    const allowedValues: IQoreAllowedValue<string>[] = (buckets || []).map((bucket) => ({
      value: bucket.id,
      display_name: bucket.name,
      desc: `Public: ${bucket.public}\nCreated: ${bucket.created_at}\nUpdated: ${bucket.updated_at}`,
    }));

    return allowedValues;
  } catch (error) {
    throw new SupabaseError(`Failed to fetch bucket names: ${error.message || error}`);
  }
};
