import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { LINKED_IN_ORGANIZATIONS_APP_NAME, LinkedInOrganizationsError } from '../constants';
import { linkedInOrganizationsApiClient } from '../helpers/constants';

const action = 'list_user_organizations';

const listUserOrganizations = QoreAppCreator.createLocalizedAction({
  app: LINKED_IN_ORGANIZATIONS_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: LinkedInOrganizationsError,
    });

    try {
      const organizations = await linkedInOrganizationsApiClient<
        {
          key: {
            organization: string;
          };
        }[]
      >({
        token,
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
        },
        path: `dmaOrganizationAcls?q=roleAssignee&state=(value:APPROVED)&start=0&count=100`,
        object: 'elements',
        method: 'GET',
      });

      const organizationIds = [
        ...new Set(
          organizations.map((org) => org.key.organization.replace('urn:li:organization:', ''))
        ),
      ];

      const response = await linkedInOrganizationsApiClient<{
        results: Record<string, any>;
      }>({
        token,
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
        },
        path: `dmaOrganizations?ids=List(${organizationIds.join(',')})`,
        method: 'GET',
      });

      return Object.keys(response.results).map((key) => response.results[key]);
    } catch (error) {
      throw new LinkedInOrganizationsError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },

  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'number' },
        localizedName: { type: 'string' },
        localizedDescription: { type: 'string' },
        localizedTagline: { type: 'string' },
        localizedWebsite: { type: 'string' },
        vanityName: { type: 'string' },
        staffCountRange: { type: 'string' },
        organizationType: { type: 'string' },
        entityStatus: { type: 'string' },
        organizationStatus: { type: 'string' },
        autoCreated: { type: 'boolean' },
        parentCareersUsed: { type: 'boolean' },
        foundedOn: {
          type: {
            type: 'hash',
            fields: {
              year: { type: 'number' },
            },
          },
        },
        created: {
          type: {
            type: 'hash',
            fields: {
              time: { type: 'number' },
            },
          },
        },
        lastModified: {
          type: {
            type: 'hash',
            fields: {
              time: { type: 'number' },
            },
          },
        },
        logoV2: {
          type: {
            type: 'hash',
            fields: {
              cropped: {
                type: {
                  type: 'hash',
                  fields: {
                    downloadUrl: { type: 'string' },
                    downloadUrlExpiresAt: { type: 'number' },
                    status: { type: 'string' },
                  },
                },
              },
              original: {
                type: {
                  type: 'hash',
                  fields: {
                    downloadUrl: { type: 'string' },
                    downloadUrlExpiresAt: { type: 'number' },
                    status: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        coverPhotoV2: {
          type: {
            type: 'hash',
            fields: {
              cropped: {
                type: {
                  type: 'hash',
                  fields: {
                    downloadUrl: { type: 'string' },
                    downloadUrlExpiresAt: { type: 'number' },
                    status: { type: 'string' },
                  },
                },
              },
              original: {
                type: {
                  type: 'hash',
                  fields: {
                    downloadUrl: { type: 'string' },
                    downloadUrlExpiresAt: { type: 'number' },
                    status: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        industriesV2: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        localizedSpecialties: {
          type: {
            type: 'list',
            element_type: 'string',
          },
        },
        locations: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                localizedDescription: { type: 'string' },
                locationType: { type: 'string' },
                address: {
                  type: {
                    type: 'hash',
                    fields: {
                      country: { type: 'string' },
                      city: { type: 'string' },
                      line1: { type: 'string' },
                      postalCode: { type: 'string' },
                      geographicArea: { type: 'string' },
                    },
                  },
                },
                geoLocation: { type: 'string' },
              },
            },
          },
        },
        callToAction: {
          type: {
            type: 'hash',
            fields: {
              active: { type: 'boolean' },
              redirectUrl: { type: 'string' },
              ctaType: { type: 'string' },
            },
          },
        },
        primaryPhoneNumber: {
          type: {
            type: 'hash',
            fields: {
              number: { type: 'string' },
            },
          },
        },
        pinnedPost: { type: 'string' },
      },
    },
  },
});

export default listUserOrganizations;
