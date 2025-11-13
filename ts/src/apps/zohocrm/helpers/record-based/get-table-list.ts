import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { ZohoCrmError } from '../../constants';
import { fetchZohoCrmPaginatedRecords } from '../constants';
import { extractZohoCrmErrorMessage } from '../extract-error';

type TZohoCrmModule = {
  id: string;
  api_name: string;
  viewable: boolean;
  creatable: boolean;
  editable: boolean;
};

const filterModules = (module: TZohoCrmModule): boolean =>
  module.viewable && module.creatable && module.editable;

export const getZohoCrmTableList: TQoreGetTableListFunction = async (context) => {
  try {
    const { token, url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      ErrorClass: ZohoCrmError,
    });

    const modules = await fetchZohoCrmPaginatedRecords<any, TZohoCrmModule>({
      token,
      url,
      object: 'modules',
      path: '/settings/modules',
    });

    return modules.filter(filterModules).map((module) => module.api_name);
  } catch (error) {
    if (error instanceof ZohoCrmError) {
      throw error;
    }

    throw new ZohoCrmError(
      `Failed to fetch ZohoCRM table list: ${extractZohoCrmErrorMessage(error)}`
    );
  }
};
