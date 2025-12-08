import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { LINKED_IN_ORGANIZATIONS_APP_NAME, LinkedInOrganizationsError } from '../constants';
import { linkedInOrganizationsApiClient } from '../helpers/constants';
import { getLinkedInOrganizationPageAllowedValues } from '../helpers/get-organization-allowed-values';
import { getLinkedInOrganizationPostIdAllowedValues } from '../helpers/get-organization-posts-allowed-values';

const action = 'get_post';

const options = {
  organization: {
    type: 'string',
    required: false,
    preselected: true,
    get_allowed_values: getLinkedInOrganizationPageAllowedValues,
  },
  post: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getLinkedInOrganizationPostIdAllowedValues,
  },
} satisfies TQoreOptions;

const getPost = QoreAppCreator.createLocalizedAction<typeof options>({
  app: LINKED_IN_ORGANIZATIONS_APP_NAME,
  action,
  options,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, post } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['post'],
      ErrorClass: LinkedInOrganizationsError,
    });

    try {
      const postData = await linkedInOrganizationsApiClient<{
        results: Record<string, any>;
      }>({
        token,
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
        },
        path: `dmaPosts?ids=List(${encodeURIComponent(post)})`,
        method: 'GET',
      });

      return postData.results[post];
    } catch (error) {
      throw new LinkedInOrganizationsError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      lifecycleState: { type: 'string' },
      visibility: { type: 'string' },
      publishedAt: { type: 'number' },
      isReshareDisabledByAuthor: { type: 'bool' },
      commentary: { type: 'string' },
      created: {
        type: {
          type: 'hash',
          fields: {
            actor: { type: 'string' },
            time: { type: 'number' },
            impersonator: { type: 'string' },
          },
        },
      },
      lastModified: {
        type: {
          type: 'hash',
          fields: {
            actor: { type: 'string' },
            time: { type: 'number' },
          },
        },
      },
      distribution: {
        type: {
          type: 'hash',
          fields: {
            feedDistribution: { type: 'string' },
            thirdPartyDistributionChannels: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
          },
        },
      },
      reshareContext: {
        type: {
          type: 'hash',
          fields: {
            parent: { type: 'string' },
            root: { type: 'string' },
          },
        },
      },
      content: {
        type: {
          type: 'hash',
          fields: {
            media: {
              type: {
                type: 'hash',
                fields: {
                  title: { type: 'string' },
                  altText: { type: 'string' },
                  media: {
                    type: {
                      type: 'hash',
                      fields: {
                        video: {
                          type: {
                            type: 'hash',
                            fields: {
                              downloadUrl: { type: 'string' },
                              downloadUrlExpiresAt: { type: 'number' },
                              status: { type: 'string' },
                              thumbnails: {
                                type: {
                                  type: 'list',
                                  element_type: {
                                    type: 'hash',
                                    fields: {
                                      downloadUrl: { type: 'string' },
                                      downloadUrlExpiresAt: { type: 'number' },
                                    },
                                  },
                                },
                              },
                              captions: {
                                type: {
                                  type: 'list',
                                  element_type: {
                                    type: 'hash',
                                    fields: {
                                      downloadUrl: { type: 'string' },
                                      downloadUrlExpiresAt: { type: 'number' },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        image: {
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
                },
              },
            },
            multiImage: {
              type: {
                type: 'hash',
                fields: {
                  images: {
                    type: {
                      type: 'list',
                      element_type: {
                        type: 'hash',
                        fields: {
                          altText: { type: 'string' },
                          media: {
                            type: {
                              type: 'hash',
                              fields: {
                                image: {
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
                          taggedEntities: {
                            type: {
                              type: 'list',
                              element_type: {
                                type: 'hash',
                                fields: {
                                  type: { type: 'string' },
                                  entity: { type: 'string' },
                                  position: {
                                    type: {
                                      type: 'hash',
                                      fields: {
                                        firstCorner: {
                                          type: {
                                            type: 'hash',
                                            fields: {
                                              xOffsetPercentage: { type: 'number' },
                                              yOffsetPercentage: { type: 'number' },
                                            },
                                          },
                                        },
                                        secondCorner: {
                                          type: {
                                            type: 'hash',
                                            fields: {
                                              xOffsetPercentage: { type: 'number' },
                                              yOffsetPercentage: { type: 'number' },
                                            },
                                          },
                                        },
                                        thirdCorner: {
                                          type: {
                                            type: 'hash',
                                            fields: {
                                              xOffsetPercentage: { type: 'number' },
                                              yOffsetPercentage: { type: 'number' },
                                            },
                                          },
                                        },
                                        fourthCorner: {
                                          type: {
                                            type: 'hash',
                                            fields: {
                                              xOffsetPercentage: { type: 'number' },
                                              yOffsetPercentage: { type: 'number' },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            article: {
              type: {
                type: 'hash',
                fields: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  source: { type: 'string' },
                  thumbnail: {
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
          },
        },
      },
      lifecycleStateInfo: {
        type: {
          type: 'hash',
          fields: {
            isEditedByAuthor: { type: 'bool' },
          },
        },
      },
    },
  },
});

export default getPost;
