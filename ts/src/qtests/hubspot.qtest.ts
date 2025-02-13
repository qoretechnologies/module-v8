import { TCustomConnOptions, TQoreAppActionFunctionContext } from '@qoretechnologies/ts-toolkit';
import { getHubspotCompanyAllowedValues } from '../apps/hubspot/helpers/get-company-allowed-values';
import { getHubspotContactAllowedValues } from '../apps/hubspot/helpers/get-contact-allowed-values';
import { getHubspotCustomObjectIdAllowedValues } from '../apps/hubspot/helpers/get-cusom-object-id-allowed-values';
import { getHubspotCustomObjectTypeAllowedValues } from '../apps/hubspot/helpers/get-custom-object-type-allwed-values';
import { getHubspotDealAllowedValues } from '../apps/hubspot/helpers/get-deal-allowed-values';
import { getHubspotLeadAllowedValues } from '../apps/hubspot/helpers/get-lead-allowed-values';
import { getHubspotProductAllowedValues } from '../apps/hubspot/helpers/get-product.allowe-values';
import { getHubspotTicketAllowedValues } from '../apps/hubspot/helpers/get-ticket-allowed-value';
import { getHubspotUserAllowedValues } from '../apps/hubspot/helpers/get-user-allowed-values';

let connection: string;

describe('Tests Hubspot actions', () => {
  const token = process.env.HUBSPOT_TOKEN;

  beforeAll(() => {
    expect(token).toBeDefined();

    connection = testApi.createConnection('hubspot', {
      opts: {
        token,
      },
    });

    expect(connection).toBeDefined();
  });

  // Allowed values
  describe('Tests Hubspot options allowed values', () => {
    const baseContext = {
      conn_opts: {
        token: token!,
      },
    } as TQoreAppActionFunctionContext<TCustomConnOptions>;

    let objectType: string;

    it('Should get Hubspot contact allowed values', async () => {
      const allowedValues = await getHubspotContactAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });

    it('Should get Hubspot company allowed values', async () => {
      const allowedValues = await getHubspotCompanyAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });

    it('Should get Hubspot custom object type allowed values', async () => {
      const allowedValues = await getHubspotCustomObjectTypeAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();

      objectType = allowedValues[0].value;
    });

    it('Should get Hubspot custom object ID allowed values', async () => {
      const allowedValues = await getHubspotCustomObjectIdAllowedValues({
        ...baseContext,
        opts: {
          objectType,
        },
      });

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });

    it('Should get Hubspot deal allowed values', async () => {
      const allowedValues = await getHubspotDealAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });

    it('Should get Hubspot ticket allowed values', async () => {
      const allowedValues = await getHubspotTicketAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });

    it('Should get Hubspot lead allowed values', async () => {
      const allowedValues = await getHubspotLeadAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });

    it('Should get Hubspot product allowed values', async () => {
      const allowedValues = await getHubspotProductAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });

    it('Should get Hubspot user allowed values', async () => {
      const allowedValues = await getHubspotUserAllowedValues(baseContext);

      expect(allowedValues).toBeDefined();
      expect(allowedValues.length).toBeGreaterThan(0);
      expect(allowedValues[0]?.value).not.toBeFalsy();
    });
  });
});
