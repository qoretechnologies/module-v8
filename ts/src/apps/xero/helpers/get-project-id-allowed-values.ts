import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { XeroError } from '../constants';
import { getTenantIdRequired, getTokenRequired, getXeroAllowedValues } from './constants';

type XeroProject = {
  projectId: string;
  name: string;
  status: string;
  minutesLogged: number;
  currencyCode: string;
};

const mapXeroProjectToAllowedValue = (project: XeroProject): IQoreAllowedValue<string> => ({
  display_name: project.name,
  value: project.projectId,
  desc:
    `Status: ${project.status}\n\n` +
    `Currency: ${project.currencyCode}\n\n` +
    `Total Time: ${project.minutesLogged ? `${project.minutesLogged} minutes` : 'N/A'}`,
});

export const getXeroProjectIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);

    return await getXeroAllowedValues({
      token,
      tenantId,
      path: 'Projects',
      dataPath: 'items',
      api: 'projects',
      mapItemToAllowedValue: mapXeroProjectToAllowedValue,
    });
  } catch (error) {
    throw new XeroError(`Couldn't fetch Xero project IDs: ${error}`);
  }
};
