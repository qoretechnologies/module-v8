import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { getLinkedInOrganizationIdAllowedValues } from '../helpers/get-organization-allowed-values';
import { LINKED_IN_ORGANIZATIONS_APP_NAME, LinkedInOrganizationsError } from '../constants';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { linkedInOrganizationsApiClient } from '../helpers/constants';

const trigger = 'new_post';

const options = {
  organization: {
    type: 'string',
    required: true,
    get_allowed_values: getLinkedInOrganizationIdAllowedValues,
  },
} satisfies TQoreOptions;

const newPost = QoreAppCreator.createLocalizedTrigger<typeof options>({
  app: LINKED_IN_ORGANIZATIONS_APP_NAME,
  action: trigger,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, organization } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['organization'],
      ErrorClass: LinkedInOrganizationsError,
    });

    const getItems = () => {
      return fetchLatestItems({
        token,
        organization,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `linkedin_${trigger}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, organization } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['organization'],
      ErrorClass: LinkedInOrganizationsError,
    });
    const items = await fetchLatestItems({
      token,
      organization,
    });

    return items?.length ? items[0] : null;
  },
  event_info: {
    desc: 'LinkedIn Organizations New Post Trigger Event Info',
    type: {
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
});

const fetchLatestItems = async (options: {
  token: string;
  organization: string;
}): Promise<Array<Record<string, any>>> => {
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;
  const { token, organization } = options;

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
        `&maxPaginationCount=${limit}`,
      method: 'GET',
    });

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

    return Object.keys(postData.results).map((key) => postData.results[key]) || [];
  } catch (error) {
    throw new LinkedInOrganizationsError(`Failed to fetch latest posts: ${error.message || error}`);
  }
};

export default newPost;
