import { AttioError } from '../apps/attio/constants';
import { getAttioListAttributesAllowedValues } from '../apps/attio/helpers/get-attio-list-attribute-allowed-values';
import {
  getAttioListApiSlugAllowedValues,
  getAttioListIdAllowedValues,
} from '../apps/attio/helpers/get-list-allowed-values';
import { getAttioListEntryIdAllowedValues } from '../apps/attio/helpers/get-list-entry-id-allowed-values';
import { getAttioListParentRecordIdAllowedValues } from '../apps/attio/helpers/get-list-parent-record-id-allowed-values';
import {
  getAttioObjectApiSlugAllowedValues,
  getAttioObjectIdAllowedValues,
} from '../apps/attio/helpers/get-object-allowed-values';
import { getAttioObjectAttributesAllowedValues } from '../apps/attio/helpers/get-object-attribute-allowed-values';
import { getAttioObjectRecordIdAllowedValues } from '../apps/attio/helpers/get-object-record-id-allowed-values';
import { getAttioTaskIdAllowedValues } from '../apps/attio/helpers/get-task-id-allowed-values';
import { getAttioWorkspaceMemberIdAllowedValues } from '../apps/attio/helpers/get-workspace-member-allowed-values';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

describe('Should test attio actions', () => {
  const token = process.env.ATTIO_TOKEN!;

  if (!token) {
    throw new AttioError('Missing ATTIO_TOKEN environment variable');
  }

  const baseContext = {
    conn_opts: {
      token,
    } as any,
  };

  describe('Should test attio object attirbutes functions', () => {
    afterEach(async () => {
      await delay(2000);
    });

    let listId: string | undefined;
    let objectId: string | undefined;

    it('Should get attio task id allowed values', async () => {
      const allowed_values = await getAttioTaskIdAllowedValues(baseContext);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio list api slug allowed values', async () => {
      const allowed_values = await getAttioListApiSlugAllowedValues(baseContext);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio list id allowed values', async () => {
      const allowed_values = await getAttioListIdAllowedValues(baseContext);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      listId = allowed_values[0].value;
    });

    it('Should get attio list atrribute allowed values', async () => {
      const allowed_values = await getAttioListAttributesAllowedValues({
        ...baseContext,
        opts: { list: listId },
      });
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio list entry id allowed values', async () => {
      const allowed_values = await getAttioListEntryIdAllowedValues({
        ...baseContext,
        opts: { list: listId },
      });
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio list parent record id allowed values', async () => {
      const allowed_values = await getAttioListParentRecordIdAllowedValues({
        ...baseContext,
        opts: { list: listId },
      });
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio object api slug allowed values', async () => {
      const allowed_values = await getAttioObjectApiSlugAllowedValues(baseContext);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio object id allowed values', async () => {
      const allowed_values = await getAttioObjectIdAllowedValues(baseContext);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      objectId = allowed_values[0].value;
    });

    it('Should get attio object atrribute allowed values', async () => {
      const allowed_values = await getAttioObjectAttributesAllowedValues({
        ...baseContext,
        opts: { object: objectId },
      });
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio object record id allowed values', async () => {
      const allowed_values = await getAttioObjectRecordIdAllowedValues({
        ...baseContext,
        opts: { object: objectId },
      });
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();
    });

    it('Should get attio workspace member allowed values', async () => {
      const allowed_values = await getAttioWorkspaceMemberIdAllowedValues(baseContext);
      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      objectId = allowed_values[0].value;
    });
  });
});
