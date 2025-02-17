import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';

export const issueEventInfoType = {
  type: 'hash',
  fields: {
    timestamp: { type: 'number' },
    webhookEvent: { type: 'string' },
    issue_event_type_name: { type: 'string' },
    user: {
      type: {
        type: 'hash',
        fields: {
          self: { type: 'string' },
          accountId: { type: 'string' },
          avatarUrls: {
            type: {
              type: 'hash',
              fields: {
                '48x48': { type: 'string' },
                '24x24': { type: 'string' },
                '16x16': { type: 'string' },
                '32x32': { type: 'string' },
              },
            },
          },
          displayName: { type: 'string' },
          active: { type: 'boolean' },
          timeZone: { type: 'string' },
          accountType: { type: 'string' },
        },
      },
    },
    issue: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          self: { type: 'string' },
          key: { type: 'string' },
          fields: {
            type: {
              type: 'hash',
              fields: {
                statuscategorychangedate: { type: 'string' },
                issuetype: {
                  type: {
                    type: 'hash',
                    fields: {
                      self: { type: 'string' },
                      id: { type: 'string' },
                      description: { type: 'string' },
                      iconUrl: { type: 'string' },
                      name: { type: 'string' },
                      subtask: { type: 'boolean' },
                      avatarId: { type: 'number' },
                      entityId: { type: 'string' },
                      hierarchyLevel: { type: 'number' },
                    },
                  },
                },
                timespent: { type: 'string' },
                customfield_10030: { type: 'hash' },
                project: {
                  type: {
                    type: 'hash',
                    fields: {
                      self: { type: 'string' },
                      id: { type: 'string' },
                      key: { type: 'string' },
                      name: { type: 'string' },
                      projectTypeKey: { type: 'string' },
                      simplified: { type: 'boolean' },
                      avatarUrls: {
                        type: {
                          type: 'hash',
                          fields: {
                            '48x48': { type: 'string' },
                            '24x24': { type: 'string' },
                            '16x16': { type: 'string' },
                            '32x32': { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
                customfield_10032: { type: 'hash' },
                fixVersions: {
                  type: {
                    type: 'list',
                    element_type: { type: 'hash', fields: {} },
                  },
                },
                customfield_10033: { type: 'hash' },
                customfield_10034: { type: 'hash' },
                aggregatetimespent: { type: 'string' },
                resolution: { type: 'hash' },
                customfield_10035: { type: 'hash' },
                customfield_10036: { type: 'hash' },
                customfield_10037: { type: 'hash' },
                customfield_10027: { type: 'hash' },
                customfield_10028: { type: 'hash' },
                customfield_10029: { type: 'hash' },
                resolutiondate: { type: 'string' },
                workratio: { type: 'number' },
                issuerestriction: {
                  type: {
                    type: 'hash',
                    fields: {
                      issuerestrictions: {
                        type: {
                          type: 'hash',
                          fields: {},
                        },
                      },
                      shouldDisplay: { type: 'boolean' },
                    },
                  },
                },
                lastViewed: { type: 'hash' },
                watches: {
                  type: {
                    type: 'hash',
                    fields: {
                      self: { type: 'string' },
                      watchCount: { type: 'number' },
                      isWatching: { type: 'boolean' },
                    },
                  },
                },
                created: { type: 'string' },
                customfield_10020: { type: 'hash' },
                customfield_10021: { type: 'hash' },
                customfield_10022: { type: 'hash' },
                priority: {
                  type: {
                    type: 'hash',
                    fields: {
                      self: { type: 'string' },
                      iconUrl: { type: 'string' },
                      name: { type: 'string' },
                      id: { type: 'string' },
                    },
                  },
                },
                customfield_10023: { type: 'hash' },
                customfield_10024: { type: 'hash' },
                customfield_10025: { type: 'hash' },
                customfield_10026: { type: 'hash' },
                labels: {
                  type: {
                    type: 'list',
                    element_type: { type: 'string' },
                  },
                },
                customfield_10016: { type: 'hash' },
                customfield_10017: { type: 'hash' },
                customfield_10018: {
                  type: {
                    type: 'hash',
                    fields: {
                      hasEpicLinkFieldDependency: { type: 'boolean' },
                      showField: { type: 'boolean' },
                      nonEditableReason: {
                        type: {
                          type: 'hash',
                          fields: {
                            reason: { type: 'string' },
                            message: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
                customfield_10019: { type: 'string' },
                timeestimate: { type: 'hash' },
                aggregatetimeoriginalestimate: { type: 'hash' },
                versions: {
                  type: {
                    type: 'list',
                    element_type: {
                      type: 'hash',
                      fields: {},
                    },
                  },
                },
                issuelinks: {
                  type: {
                    type: 'list',
                    element_type: {
                      type: 'hash',
                      fields: {},
                    },
                  },
                },
                assignee: { type: 'hash' },
                updated: { type: 'string' },
                status: {
                  type: {
                    type: 'hash',
                    fields: {
                      self: { type: 'string' },
                      description: { type: 'string' },
                      iconUrl: { type: 'string' },
                      name: { type: 'string' },
                      id: { type: 'string' },
                      statusCategory: {
                        type: {
                          type: 'hash',
                          fields: {
                            self: { type: 'string' },
                            id: { type: 'number' },
                            key: { type: 'string' },
                            colorName: { type: 'string' },
                            name: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
                components: {
                  type: {
                    type: 'list',
                    element_type: {
                      type: 'hash',
                      fields: {},
                    },
                  },
                },
                timeoriginalestimate: { type: 'hash' },
                description: { type: 'hash' },
                customfield_10010: { type: 'hash' },
                customfield_10014: { type: 'hash' },
                timetracking: {
                  type: {
                    type: 'hash',
                    fields: {},
                  },
                },
                customfield_10015: { type: 'hash' },
                customfield_10005: { type: 'hash' },
                customfield_10006: { type: 'hash' },
                security: { type: 'hash' },
                customfield_10007: { type: 'hash' },
                customfield_10008: { type: 'hash' },
                customfield_10009: { type: 'hash' },
                aggregatetimeestimate: { type: 'hash' },
                attachment: {
                  type: {
                    type: 'list',
                    element_type: {
                      type: 'hash',
                      fields: {},
                    },
                  },
                },
                summary: { type: 'string' },
                creator: {
                  type: {
                    type: 'hash',
                    fields: {
                      self: { type: 'string' },
                      accountId: { type: 'string' },
                      avatarUrls: {
                        type: {
                          type: 'hash',
                          fields: {
                            '48x48': { type: 'string' },
                            '24x24': { type: 'string' },
                            '16x16': { type: 'string' },
                            '32x32': { type: 'string' },
                          },
                        },
                      },
                      displayName: { type: 'string' },
                      active: { type: 'boolean' },
                      timeZone: { type: 'string' },
                      accountType: { type: 'string' },
                    },
                  },
                },
                subtasks: {
                  type: {
                    type: 'list',
                    element_type: {
                      type: 'hash',
                      fields: {},
                    },
                  },
                },
                customfield_10040: { type: 'hash' },
                customfield_10043: { type: 'hash' },
                reporter: {
                  type: {
                    type: 'hash',
                    fields: {
                      self: { type: 'string' },
                      accountId: { type: 'string' },
                      avatarUrls: {
                        type: {
                          type: 'hash',
                          fields: {
                            '48x48': { type: 'string' },
                            '24x24': { type: 'string' },
                            '16x16': { type: 'string' },
                            '32x32': { type: 'string' },
                          },
                        },
                      },
                      displayName: { type: 'string' },
                      active: { type: 'boolean' },
                      timeZone: { type: 'string' },
                      accountType: { type: 'string' },
                    },
                  },
                },
                aggregateprogress: {
                  type: {
                    type: 'hash',
                    fields: {
                      progress: { type: 'number' },
                      total: { type: 'number' },
                    },
                  },
                },
                customfield_10001: { type: 'hash' },
                customfield_10002: {
                  type: {
                    type: 'list',
                    element_type: { type: 'string' },
                  },
                },
                customfield_10003: { type: 'hash' },
                customfield_10004: { type: 'hash' },
                customfield_10038: {
                  type: {
                    type: 'list',
                    element_type: { type: 'string' },
                  },
                },
                customfield_10039: { type: 'hash' },
                environment: { type: 'hash' },
                duedate: { type: 'hash' },
                progress: {
                  type: {
                    type: 'hash',
                    fields: {
                      progress: { type: 'number' },
                      total: { type: 'number' },
                    },
                  },
                },
                votes: {
                  type: {
                    type: 'hash',
                    fields: {
                      self: { type: 'string' },
                      votes: { type: 'number' },
                      hasVoted: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    changelog: {
      type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          items: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: {
                  field: { type: 'string' },
                  fieldtype: { type: 'string' },
                  fieldId: { type: 'string' },
                  from: { type: 'hash' },
                  fromString: { type: 'hash' },
                  to: { type: 'hash' },
                  tmpFromAccountId: { type: 'hash' },
                  tmpToAccountId: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies TQoreTypeObject;
