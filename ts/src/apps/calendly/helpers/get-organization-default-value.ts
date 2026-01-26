import { TCustomConnOptions, TQoreGetDefaultValueFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { CalendlyError } from '../constants';
import { fetchCalendlyData } from './constants';

export const getCalendlyOrganizationDefaultValue: TQoreGetDefaultValueFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: CalendlyError,
  });

  const user = await fetchCalendlyData<{ current_organization: string }>({
    token,
    object: 'resource',
    path: `users/me`,
  });

  return user.current_organization;
};
