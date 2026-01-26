import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { AttioError } from '../../constants';
import { attioApiClient } from '../client';

type TAttioObject = {
  id: {
    object_id: string;
    workspace_id: string;
  };
  api_slug: string;
  singular_noun: string;
  plural_noun: string;
  parent_object: string[];
};

type TAttioObjectsResponse = TAttioObject[];

export const getAttioTableList: TQoreGetTableListFunction = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: AttioError,
  });

  try {
    const objects = await attioApiClient<TAttioObjectsResponse>({
      path: 'objects',
      method: 'GET',
      object: 'data',
      token,
    });

    const objectNames = objects?.map((obj) => obj.api_slug) || [];

    return objectNames;
  } catch (error) {
    if (error instanceof AttioError) {
      throw error;
    }

    throw new AttioError(`Failed to fetch Attio table list: ${error?.message || error}`);
  }
};
