// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import {
  getPipedriveActivityTypeAllowedValues,
  mapPipedriveActivityType,
  TPipedriveActivityTypeData,
} from '../apps/pipedrive/helpers/get-activity-type-allowed-values';

// Pipedrive's activities API takes an activity type by its `key_string` (`call`, `meeting`, ...), never by
// the numeric id of `GET /v1/activityTypes`: sending the id fails with
// "Validation failed: type: Please provide a valid type". The picker must therefore offer the key.
describe('Pipedrive activity type picker', () => {
  const call: TPipedriveActivityTypeData = {
    id: '1',
    name: 'Call',
    key_string: 'call',
    icon_key: 'call',
    is_custom_flag: false,
  };
  const custom: TPipedriveActivityTypeData = {
    id: '7',
    name: 'Site visit',
    key_string: 'site_visit',
    is_custom_flag: true,
  };

  it('offers the key string as the value, named by the type name', () => {
    expect(mapPipedriveActivityType(call)).toEqual({
      display_name: 'Call',
      value: 'call',
      short_desc: 'Standard activity',
    });
    expect(mapPipedriveActivityType(custom)).toEqual({
      display_name: 'Site visit',
      value: 'site_visit',
      short_desc: 'Custom activity',
    });
  });

  it('never offers the numeric id', () => {
    for (const activityType of [call, custom]) {
      expect(mapPipedriveActivityType(activityType).value).not.toBe(activityType.id);
    }
  });

  it('refuses to load the picker without a connection token', async () => {
    await expect(getPipedriveActivityTypeAllowedValues({ conn_opts: {} } as any)).rejects.toThrow(
      'The token is required to get Pipedrive activity type allowed values'
    );
  });
});
