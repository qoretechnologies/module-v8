import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getIntercomAllowedValues } from '.';

interface IntercomAdmin {
  type: string;
  id: string;
  name: string;
  email: string;
  job_title?: string;
  avatar?: {
    image_url?: string;
  };
  has_inbox_seat: boolean;
  team_ids?: string[];
  away_mode_enabled?: boolean;
  away_mode_reassign?: boolean;
}

const mapIntercomAdminToAllowedValue = (admin: IntercomAdmin): IQoreAllowedValue<string> => {
  return {
    display_name: `${admin.name} (${admin.email})`,
    value: admin.id,
    desc:
      `ID: ${admin.id}\n\n` +
      `Name: ${admin.name}\n\n` +
      `Email: ${admin.email}\n\n` +
      `Job Title: ${admin.job_title || 'Not specified'}\n\n` +
      `Has Inbox Seat: ${admin.has_inbox_seat ? 'Yes' : 'No'}\n\n` +
      `Away Mode: ${admin.away_mode_enabled ? 'Enabled' : 'Disabled'}`,
  };
};

export const getIntercomAdminIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to fetch Intercom admins');
  }

  return await getIntercomAllowedValues<IntercomAdmin>({
    token,
    path: '/admins',
    dataPath: 'admins',
    mapFn: mapIntercomAdminToAllowedValue,
  });
};
