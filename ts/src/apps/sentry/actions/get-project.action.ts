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
      isBookmarked: { type: 'bool' },
      isMember: { type: 'bool' },
      features: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      firstEvent: { type: 'string' },
      firstTransactionEvent: { type: 'bool' },
      access: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      hasAccess: { type: 'bool' },
      hasMinifiedStackTrace: { type: 'bool' },
      hasFeedbacks: { type: 'bool' },
      hasMonitors: { type: 'bool' },
      hasNewFeedbacks: { type: 'bool' },
      hasProfiles: { type: 'bool' },
      hasReplays: { type: 'bool' },
      hasFlags: { type: 'bool' },
      hasSessions: { type: 'bool' },
      hasInsightsHttp: { type: 'bool' },
      hasInsightsDb: { type: 'bool' },
      hasInsightsAssets: { type: 'bool' },
      hasInsightsAppStart: { type: 'bool' },
      hasInsightsScreenLoad: { type: 'bool' },
      hasInsightsVitals: { type: 'bool' },
      hasInsightsCaches: { type: 'bool' },
      hasInsightsQueues: { type: 'bool' },
      hasInsightsLlmMonitoring: { type: 'bool' },
      hasInsightsAgentMonitoring: { type: 'bool' },
      hasInsightsMCP: { type: 'bool' },
      hasLogs: { type: 'bool' },
      isInternal: { type: 'bool' },
      isPublic: { type: 'bool' },
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
            'sentry:scrub_defaults': { type: 'bool' },
            'sentry:scrape_javascript': { type: 'bool' },
            'mail:subject_prefix': { type: 'string' },
            'sentry:relay_pii_config': { type: 'string' },
            'sentry:scrub_data': { type: 'bool' },
            'sentry:token': { type: 'string' },
            'sentry:resolve_age': { type: 'integer' },
            'sentry:grouping_config': { type: 'string' },
            'quotas:spike-protection-disabled': { type: 'bool' },
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
            'sentry:scrub_ip_address': { type: 'bool' },
            'sentry:default_environment': { type: 'string' },
            'sentry:verify_ssl': { type: 'bool' },
            'sentry:csp_ignored_sources_defaults': { type: 'bool' },
            'sentry:csp_ignored_sources': { type: 'string' },
            'filters:blacklisted_ips': { type: 'string' },
            'filters:react-hydration-errors': { type: 'bool' },
            'filters:chunk-load-error': { type: 'bool' },
            'filters:releases': { type: 'string' },
            'filters:error_messages': { type: 'string' },
            'feedback:branding': { type: 'bool' },
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
      dataScrubber: { type: 'bool' },
      dataScrubberDefaults: { type: 'bool' },
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
      verifySSL: { type: 'bool' },
      scrubIPAddresses: { type: 'bool' },
      scrapeJavaScript: { type: 'bool' },
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
            isEarlyAdopter: { type: 'bool' },
            allowMemberInvite: { type: 'bool' },
            allowMemberProjectCreation: { type: 'bool' },
            allowSuperuserAccess: { type: 'bool' },
            require2FA: { type: 'bool' },
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
            hasAuthProvider: { type: 'bool' },
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
              canDisable: { type: 'bool' },
              isTestable: { type: 'bool' },
              hasConfiguration: { type: 'bool' },
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
              enabled: { type: 'bool' },
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
              isDeprecated: { type: 'bool' },
              isHidden: { type: 'bool' },
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
              active: { type: 'bool' },
            },
          },
        },
      },
      symbolSources: { type: 'string' },
      tempestFetchScreenshots: { type: 'bool' },
      tempestFetchDumps: { type: 'bool' },
      debugFilesRole: { type: 'string' },
      isDynamicallySampled: { type: 'bool' },
      autofixAutomationTuning: { type: 'string' },
      seerScannerAutomation: { type: 'bool' },
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
