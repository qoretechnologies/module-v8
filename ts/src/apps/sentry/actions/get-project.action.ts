import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SENTRY_APP_NAME, SentryError } from '../constants';
import { sentryApiClient } from '../helpers/constants';
import { getSentryProjectAllowedValues } from '../helpers/get-project-allowed-values';

const action = 'get_project';

const options = {
  projectId: {
    type: 'string',
    required: true,
    get_allowed_values: getSentryProjectAllowedValues,
  },
} satisfies TQoreOptions;

const getProject = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SENTRY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, organization, projectId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'organization'],
      optionFields: ['projectId'],
      ErrorClass: SentryError,
    });

    try {
      const response = await sentryApiClient<Record<string, any>>({
        path: `/api/0/projects/${organization}/${projectId}/`,
        method: 'GET',
        token,
      });

      return response;
    } catch (error) {
      throw new SentryError(`Failed to ${humanizeNameTitle(action)}: ${error?.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      slug: { type: 'string' },
      name: { type: 'string' },
      platform: { type: 'string' },
      dateCreated: { type: 'string' },
      isBookmarked: { type: 'boolean' },
      isMember: { type: 'boolean' },
      features: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      firstEvent: { type: 'string' },
      firstTransactionEvent: { type: 'boolean' },
      access: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      hasAccess: { type: 'boolean' },
      hasMinifiedStackTrace: { type: 'boolean' },
      hasFeedbacks: { type: 'boolean' },
      hasMonitors: { type: 'boolean' },
      hasNewFeedbacks: { type: 'boolean' },
      hasProfiles: { type: 'boolean' },
      hasReplays: { type: 'boolean' },
      hasFlags: { type: 'boolean' },
      hasSessions: { type: 'boolean' },
      hasInsightsHttp: { type: 'boolean' },
      hasInsightsDb: { type: 'boolean' },
      hasInsightsAssets: { type: 'boolean' },
      hasInsightsAppStart: { type: 'boolean' },
      hasInsightsScreenLoad: { type: 'boolean' },
      hasInsightsVitals: { type: 'boolean' },
      hasInsightsCaches: { type: 'boolean' },
      hasInsightsQueues: { type: 'boolean' },
      hasInsightsLlmMonitoring: { type: 'boolean' },
      hasInsightsAgentMonitoring: { type: 'boolean' },
      hasInsightsMCP: { type: 'boolean' },
      hasLogs: { type: 'boolean' },
      isInternal: { type: 'boolean' },
      isPublic: { type: 'boolean' },
      avatar: {
        type: {
          type: 'hash',
          fields: {
            avatarType: { type: 'string' },
            avatarUuid: { type: 'string' },
          },
        },
      },
      color: { type: 'string' },
      status: { type: 'string' },
      team: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
          },
        },
      },
      teams: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              slug: { type: 'string' },
            },
          },
        },
      },
      latestRelease: {
        type: {
          type: 'hash',
          fields: {
            version: { type: 'string' },
          },
        },
      },
      options: {
        type: {
          type: 'hash',
          fields: {
            'sentry:transaction_name_cluster_rules': {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            'digests:mail:maximum_delay': { type: 'integer' },
            'sentry:scrub_defaults': { type: 'boolean' },
            'sentry:scrape_javascript': { type: 'boolean' },
            'mail:subject_prefix': { type: 'string' },
            'sentry:relay_pii_config': { type: 'string' },
            'sentry:scrub_data': { type: 'boolean' },
            'sentry:token': { type: 'string' },
            'sentry:resolve_age': { type: 'integer' },
            'sentry:grouping_config': { type: 'string' },
            'quotas:spike-protection-disabled': { type: 'boolean' },
            'sentry:store_crash_reports': { type: 'integer' },
            'digests:mail:minimum_delay': { type: 'integer' },
            'sentry:secondary_grouping_config': { type: 'string' },
            'sentry:secondary_grouping_expiry': { type: 'integer' },
            'sentry:builtin_symbol_sources': {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            'sentry:origins': {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            'sentry:sensitive_fields': {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            'sentry:scrub_ip_address': { type: 'boolean' },
            'sentry:default_environment': { type: 'string' },
            'sentry:verify_ssl': { type: 'boolean' },
            'sentry:csp_ignored_sources_defaults': { type: 'boolean' },
            'sentry:csp_ignored_sources': { type: 'string' },
            'filters:blacklisted_ips': { type: 'string' },
            'filters:react-hydration-errors': { type: 'boolean' },
            'filters:chunk-load-error': { type: 'boolean' },
            'filters:releases': { type: 'string' },
            'filters:error_messages': { type: 'string' },
            'feedback:branding': { type: 'boolean' },
          },
        },
      },
      digestsMinDelay: { type: 'integer' },
      digestsMaxDelay: { type: 'integer' },
      subjectPrefix: { type: 'string' },
      allowedDomains: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      resolveAge: { type: 'integer' },
      dataScrubber: { type: 'boolean' },
      dataScrubberDefaults: { type: 'boolean' },
      safeFields: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      storeCrashReports: { type: 'integer' },
      sensitiveFields: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      subjectTemplate: { type: 'string' },
      securityToken: { type: 'string' },
      securityTokenHeader: { type: 'string' },
      verifySSL: { type: 'boolean' },
      scrubIPAddresses: { type: 'boolean' },
      scrapeJavaScript: { type: 'boolean' },
      groupingConfig: { type: 'string' },
      groupingEnhancements: { type: 'string' },
      derivedGroupingEnhancements: { type: 'string' },
      secondaryGroupingExpiry: { type: 'integer' },
      secondaryGroupingConfig: { type: 'string' },
      fingerprintingRules: { type: 'string' },
      organization: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            slug: { type: 'string' },
            status: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
            name: { type: 'string' },
            dateCreated: { type: 'string' },
            isEarlyAdopter: { type: 'boolean' },
            allowMemberInvite: { type: 'boolean' },
            allowMemberProjectCreation: { type: 'boolean' },
            allowSuperuserAccess: { type: 'boolean' },
            require2FA: { type: 'boolean' },
            avatar: {
              type: {
                type: 'hash',
                fields: {
                  avatarType: { type: 'string' },
                  avatarUuid: { type: 'string' },
                },
              },
            },
            features: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            links: {
              type: {
                type: 'hash',
                fields: {
                  organizationUrl: { type: 'string' },
                  regionUrl: { type: 'string' },
                },
              },
            },
            hasAuthProvider: { type: 'boolean' },
          },
        },
      },
      plugins: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              slug: { type: 'string' },
              shortName: { type: 'string' },
              type: { type: 'string' },
              canDisable: { type: 'boolean' },
              isTestable: { type: 'boolean' },
              hasConfiguration: { type: 'boolean' },
              metadata: { type: 'hash' },
              contexts: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              status: { type: 'string' },
              assets: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              doc: { type: 'string' },
              firstPartyAlternative: { type: 'string' },
              deprecationDate: { type: 'string' },
              altIsSentryApp: { type: 'string' },
              enabled: { type: 'boolean' },
              version: { type: 'string' },
              author: {
                type: {
                  type: 'hash',
                  fields: {
                    name: { type: 'string' },
                    url: { type: 'string' },
                  },
                },
              },
              isDeprecated: { type: 'boolean' },
              isHidden: { type: 'boolean' },
              description: { type: 'string' },
              features: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              featureDescriptions: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      description: { type: 'string' },
                      featureGate: { type: 'string' },
                    },
                  },
                },
              },
              resourceLinks: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      title: { type: 'string' },
                      url: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      platforms: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      processingIssues: { type: 'integer' },
      defaultEnvironment: { type: 'string' },
      relayPiiConfig: { type: 'string' },
      builtinSymbolSources: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      dynamicSamplingBiases: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              active: { type: 'boolean' },
            },
          },
        },
      },
      symbolSources: { type: 'string' },
      tempestFetchScreenshots: { type: 'boolean' },
      tempestFetchDumps: { type: 'boolean' },
      debugFilesRole: { type: 'string' },
      isDynamicallySampled: { type: 'boolean' },
      autofixAutomationTuning: { type: 'string' },
      seerScannerAutomation: { type: 'boolean' },
      highlightTags: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      highlightContext: { type: 'hash' },
      highlightPreset: {
        type: {
          type: 'hash',
          fields: {
            tags: {
              type: {
                type: 'list',
                element_type: 'string',
              },
            },
            context: { type: 'hash' },
          },
        },
      },
    },
  },
});

export default getProject;
