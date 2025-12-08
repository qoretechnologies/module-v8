import { TCustomConnOptions, TQoreAppActionFunctionContext } from '@qoretechnologies/ts-toolkit';
import { AttioError } from '../constants';

export const getAttioTokenRequired = (
  context?: TQoreAppActionFunctionContext<TCustomConnOptions>
): string => {
  const token = context?.conn_opts?.token;
  if (!token) throw new AttioError('Token is required for Attio API operations');

  return token;
};

export const AttioPersonRequiredFields = ['name', 'company'];
export const AttioCompanyRequiredFields = ['name'];
