import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export type GoogleDriveSharingPreset =
  | 'org_link_edit'
  | 'org_link_view'
  | 'org_link_comment'
  | 'org_discoverable'
  | 'public_link_edit'
  | 'public_link_view'
  | 'public_link_comment'
  | 'public_discoverable'
  | 'email';

export const GOOGLE_DRIVE_SHARING_PRESETS: Record<GoogleDriveSharingPreset, string> = {
  org_link_edit: 'Anyone in organization with the link can edit',
  org_link_view: 'Anyone in organization with the link can view',
  org_link_comment: 'Anyone in organization with the link can comment',
  org_discoverable: 'Anyone in organization can find and view',
  public_link_edit: 'Anyone with the link can edit',
  public_link_view: 'Anyone with the link can view',
  public_link_comment: 'Anyone with the link can comment',
  public_discoverable: 'Anyone on the internet can find and view',
  email: 'Specific people by email',
};

export const GoogleDriveSharingPreferencesAllowedValues = Object.entries(
  GOOGLE_DRIVE_SHARING_PRESETS
).map(
  ([value, display_name]): IQoreAllowedValue<string> => ({
    value,
    display_name,
  })
);

export const GoogleDriveSharingPreferencesMapping: Record<
  string,
  { type: string; role: string; allowFileDiscovery: boolean }
> = {
  org_link_edit: { type: 'domain', role: 'writer', allowFileDiscovery: false },
  org_link_view: { type: 'domain', role: 'reader', allowFileDiscovery: false },
  org_link_comment: { type: 'domain', role: 'commenter', allowFileDiscovery: false },
  org_discoverable: { type: 'domain', role: 'reader', allowFileDiscovery: true },
  public_link_edit: { type: 'anyone', role: 'writer', allowFileDiscovery: false },
  public_link_view: { type: 'anyone', role: 'reader', allowFileDiscovery: false },
  public_link_comment: { type: 'anyone', role: 'commenter', allowFileDiscovery: false },
  public_discoverable: { type: 'anyone', role: 'reader', allowFileDiscovery: true },
};
