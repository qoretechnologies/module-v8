import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { LINKED_IN_ORGANIZATIONS_APP_NAME, LinkedInOrganizationsError } from '../constants';
import { linkedInOrganizationsApiClient } from '../helpers/constants';
import { getLinkedInOrganizationIdAllowedValues } from '../helpers/get-organization-allowed-values';

const action = 'list_organization_posts';

const options = {
  organization: {
    type: 'string',
    required: true,
    get_allowed_values: getLinkedInOrganizationIdAllowedValues,
  },
  count: {
    type: 'number',
    required: false,
    default_value: 10,
  },
  cursor: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listOrganizationPosts = QoreAppCreator.createLocalizedAction<typeof options>({
  app: LINKED_IN_ORGANIZATIONS_APP_NAME,
  action,
  options,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token, organization } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['organization'],
      ErrorClass: LinkedInOrganizationsError,
    });

    const { cursor, count = 10 } = obj || {};

    try {
      const posts = await linkedInOrganizationsApiClient<{
        elements: Array<{ id: string }>;
        metadata: {
          paginationCursorMetdata: {
            nextPaginationCursor: string;
          };
        };
      }>({
        token,
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
        },
        path:
          `dmaFeedContentsExternal?q=postsByAuthor` +
          `&author=urn%3Ali%3Aorganization%3A${organization}` +
          `&maxPaginationCount=${count}` +
          (cursor ? `&paginationCursor=${cursor}` : ''),
        method: 'GET',
      });

      const newCursor = posts.metadata?.paginationCursorMetdata?.nextPaginationCursor;
      const postIds = posts.elements.map((post) => encodeURIComponent(post.id));

      const postData = await linkedInOrganizationsApiClient<{
        results: Record<string, any>;
      }>({
        token,
        headers: {
          'X-Restli-Protocol-Version': '2.0.0',
        },
        path: `dmaPosts?ids=List(${postIds.join(',')})`,
        method: 'GET',
      });

      return {
        posts: Object.keys(postData.results).map((key) => postData.results[key]),
        cursor: newCursor,
      };
    } catch (error) {
      throw new LinkedInOrganizationsError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      posts: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              lifecycleState: { type: 'string' },
              visibility: { type: 'string' },
              publishedAt: { type: 'number' },
              isReshareDisabledByAuthor: { type: 'boolean' },
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
                    isEditedByAuthor: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
      cursor: { type: 'string' },
    },
  },
});

export default listOrganizationPosts;
