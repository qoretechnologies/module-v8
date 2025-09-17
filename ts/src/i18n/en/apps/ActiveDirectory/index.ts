const ActiveDirectoryEn = {
  displayName: 'Active Directory',
  shortDesc:
    'Seamlessly connect to Microsoft Active Directory to manage users, groups, and organizational resources.',
  longDesc:
    'The Active Directory integration provides comprehensive actions and triggers to interact with Microsoft Graph API for user and group management. Automate user provisioning, group membership management, and organizational administration tasks with enterprise-grade security and compliance.',

  triggers: {
    new_user: {
      displayName: 'New User',
      shortDesc: 'Triggers when a new user is created in Active Directory',
      longDesc:
        'Monitor Active Directory for newly created users. This trigger can be filtered by specific criteria such as user attributes, group membership, or organizational units to detect relevant user additions.',
      options: {
        group_id: {
          displayName: 'Group ID',
          shortDesc: 'Monitor users added to a specific group',
          longDesc:
            'Optional group identifier to monitor for new user additions. When specified, the trigger will only fire for users added to this particular group.',
        },
        filter: {
          displayName: 'Filter Criteria',
          shortDesc: 'Filter conditions for user monitoring',
          longDesc:
            'Optional filter criteria to specify which users should trigger the event. Configure field, operator, and value to match specific user attributes.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'User attribute to filter on',
                longDesc:
                  'The user attribute field to apply the filter condition against, such as displayName, email, or department.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Comparison operator for filtering',
                longDesc:
                  'The comparison operator to use when evaluating the filter condition (equals, not equals, starts with, ends with).',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Value to match against',
                longDesc:
                  'The value to compare against the specified field using the selected operator.',
              },
            },
          },
        },
      },
    },
    new_group: {
      displayName: 'New Group',
      shortDesc: 'Triggers when a new group is created in Active Directory',
      longDesc:
        'Monitor Active Directory for newly created groups. This trigger can be filtered by specific criteria such as group type, visibility, or naming patterns to detect relevant group additions.',
      options: {
        filter: {
          displayName: 'Filter Criteria',
          shortDesc: 'Filter conditions for group monitoring',
          longDesc:
            'Optional filter criteria to specify which groups should trigger the event. Configure field, operator, and value to match specific group attributes.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Group attribute to filter on',
                longDesc:
                  'The group attribute field to apply the filter condition against, such as displayName, description, or groupTypes.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Comparison operator for filtering',
                longDesc:
                  'The comparison operator to use when evaluating the filter condition (equals, not equals, starts with, ends with).',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Value to match against',
                longDesc:
                  'The value to compare against the specified field using the selected operator.',
              },
            },
          },
        },
      },
    },
  },

  actions: {
    create_user: {
      displayName: 'Create User',
      shortDesc: 'Create a new user in Active Directory',
      longDesc:
        'Create a new user account in Active Directory with comprehensive profile information, security settings, and organizational details. Supports setting passwords, contact information, and location data.',
      options: {
        displayName: {
          displayName: 'Display Name',
          shortDesc: 'Full name of the user',
          longDesc:
            'The full display name of the user as it will appear in Active Directory and throughout Microsoft services.',
        },
        givenName: {
          displayName: 'First Name',
          shortDesc: "User's first name",
          longDesc:
            'The given name (first name) of the user for profile completion and directory organization.',
        },
        surname: {
          displayName: 'Last Name',
          shortDesc: "User's last name",
          longDesc:
            'The surname (last name) of the user for profile completion and directory organization.',
        },
        mailNickname: {
          displayName: 'Mail Nickname',
          shortDesc: 'Email alias for the user',
          longDesc:
            "The mail nickname that will be used as part of the user's email address. Must contain only letters, numbers, periods, hyphens, and underscores.",
        },
        userPrincipalName: {
          displayName: 'User Principal Name',
          shortDesc: 'Primary login identifier',
          longDesc:
            'The user principal name (UPN) that serves as the primary login identifier. Must be in email format (user@domain.com).',
        },
        password: {
          displayName: 'Password',
          shortDesc: 'Initial password for the user',
          longDesc:
            "The initial password for the user account. Must meet your organization's password complexity requirements and be at least 8 characters long.",
        },
        forceChangePasswordNextSignIn: {
          displayName: 'Force Password Change',
          shortDesc: 'Require password change on first login',
          longDesc:
            'When enabled, the user will be required to change their password on their first sign-in to the account.',
        },
        forceChangePasswordNextSignInWithMfa: {
          displayName: 'Force Password Change with MFA',
          shortDesc: 'Require password change with multi-factor authentication',
          longDesc:
            'When enabled, the user will be required to change their password with multi-factor authentication on their first sign-in.',
        },
        jobTitle: {
          displayName: 'Job Title',
          shortDesc: "User's job title",
          longDesc:
            'The job title or position of the user within the organization for directory and contact information.',
        },
        department: {
          displayName: 'Department',
          shortDesc: "User's department",
          longDesc:
            'The department or organizational unit the user belongs to within the company structure.',
        },
        mobilePhone: {
          displayName: 'Mobile Phone',
          shortDesc: "User's mobile phone number",
          longDesc:
            'The mobile phone number for the user, used for contact information and potential multi-factor authentication.',
        },
        mail: {
          displayName: 'Email Address',
          shortDesc: 'Primary email address',
          longDesc:
            'The primary email address for the user. If not specified, it may be automatically generated based on the user principal name.',
        },
        streetAddress: {
          displayName: 'Street Address',
          shortDesc: 'Physical street address',
          longDesc:
            "The street address component of the user's physical location for contact and organizational purposes.",
        },
        city: {
          displayName: 'City',
          shortDesc: 'City of residence',
          longDesc: 'The city where the user is located for contact and organizational purposes.',
        },
        state: {
          displayName: 'State/Province',
          shortDesc: 'State or province',
          longDesc:
            'The state or province where the user is located for contact and organizational purposes.',
        },
        postalCode: {
          displayName: 'Postal Code',
          shortDesc: 'ZIP or postal code',
          longDesc: "The postal code or ZIP code for the user's location.",
        },
        country: {
          displayName: 'Country',
          shortDesc: 'Country of residence',
          longDesc:
            'The country where the user is located for contact and organizational purposes.',
        },
        accountEnabled: {
          displayName: 'Account Enabled',
          shortDesc: 'Enable the user account',
          longDesc:
            'Whether the user account should be enabled and able to sign in. When disabled, the user cannot access any services.',
        },
        usageLocation: {
          displayName: 'Usage Location',
          shortDesc: 'Country code for license assignment',
          longDesc:
            "The two-letter country code (ISO 3166-1 alpha-2) that represents the user's usage location. Required for license assignment in some regions.",
        },
      },
    },
    update_user: {
      displayName: 'Update User',
      shortDesc: 'Update an existing user in Active Directory',
      longDesc:
        'Modify properties of an existing user account in Active Directory. Update profile information, contact details, organizational data, and account settings.',
      options: {
        user_id: {
          displayName: 'User ID',
          shortDesc: 'Identifier of the user to update',
          longDesc:
            'The unique identifier of the user account to be updated. Select from existing users in your directory.',
        },
        displayName: {
          displayName: 'Display Name',
          shortDesc: 'Updated full name',
          longDesc:
            'The updated full display name of the user as it will appear in Active Directory and throughout Microsoft services.',
        },
        givenName: {
          displayName: 'First Name',
          shortDesc: 'Updated first name',
          longDesc: 'The updated given name (first name) of the user.',
        },
        surname: {
          displayName: 'Last Name',
          shortDesc: 'Updated last name',
          longDesc: 'The updated surname (last name) of the user.',
        },
        mailNickname: {
          displayName: 'Mail Nickname',
          shortDesc: 'Updated email alias',
          longDesc:
            'The updated mail nickname for the user. Must contain only letters, numbers, periods, hyphens, and underscores.',
        },
        jobTitle: {
          displayName: 'Job Title',
          shortDesc: 'Updated job title',
          longDesc: 'The updated job title or position of the user within the organization.',
        },
        department: {
          displayName: 'Department',
          shortDesc: 'Updated department',
          longDesc: 'The updated department or organizational unit the user belongs to.',
        },
        mobilePhone: {
          displayName: 'Mobile Phone',
          shortDesc: 'Updated mobile phone number',
          longDesc: 'The updated mobile phone number for the user.',
        },
        mail: {
          displayName: 'Email Address',
          shortDesc: 'Updated email address',
          longDesc: 'The updated primary email address for the user.',
        },
        streetAddress: {
          displayName: 'Street Address',
          shortDesc: 'Updated street address',
          longDesc: "The updated street address component of the user's physical location.",
        },
        city: {
          displayName: 'City',
          shortDesc: 'Updated city',
          longDesc: 'The updated city where the user is located.',
        },
        state: {
          displayName: 'State/Province',
          shortDesc: 'Updated state or province',
          longDesc: 'The updated state or province where the user is located.',
        },
        postalCode: {
          displayName: 'Postal Code',
          shortDesc: 'Updated postal code',
          longDesc: "The updated postal code or ZIP code for the user's location.",
        },
        country: {
          displayName: 'Country',
          shortDesc: 'Updated country',
          longDesc: 'The updated country where the user is located.',
        },
        accountEnabled: {
          displayName: 'Account Enabled',
          shortDesc: 'Enable or disable the account',
          longDesc:
            'Whether the user account should be enabled or disabled. Disabled accounts cannot sign in to any services.',
        },
        usageLocation: {
          displayName: 'Usage Location',
          shortDesc: 'Updated usage location',
          longDesc:
            "The updated two-letter country code representing the user's usage location for license assignment purposes.",
        },
      },
    },
    get_user: {
      displayName: 'Get User',
      shortDesc: 'Retrieve user information from Active Directory',
      longDesc:
        'Fetch detailed information about a specific user from Active Directory, including profile data, contact information, and account status.',
      options: {
        user_id: {
          displayName: 'User ID',
          shortDesc: 'Identifier of the user to retrieve',
          longDesc:
            'The unique identifier of the user account to retrieve information for. Select from existing users in your directory.',
        },
      },
    },
    delete_user: {
      displayName: 'Delete User',
      shortDesc: 'Delete a user from Active Directory',
      longDesc:
        'Permanently remove a user account from Active Directory. This action cannot be undone and will remove all associated data and access permissions.',
      options: {
        user_id: {
          displayName: 'User ID',
          shortDesc: 'Identifier of the user to delete',
          longDesc:
            'The unique identifier of the user account to be deleted. Select from existing users in your directory.',
        },
      },
    },
    disable_user: {
      displayName: 'Disable User',
      shortDesc: 'Disable a user account in Active Directory',
      longDesc:
        'Disable a user account to prevent sign-in while preserving the account and its data. The user will be unable to access any services until the account is re-enabled.',
      options: {
        user_id: {
          displayName: 'User ID',
          shortDesc: 'Identifier of the user to disable',
          longDesc:
            'The unique identifier of the user account to be disabled. Select from existing users in your directory.',
        },
      },
    },
    list_users: {
      displayName: 'List Users',
      shortDesc: 'Retrieve a list of users from Active Directory',
      longDesc:
        'Get a paginated list of users from Active Directory with optional filtering and group membership criteria. Useful for reporting and bulk operations.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of users to return',
          longDesc:
            'The maximum number of users to return in a single request. Default is 20, with pagination available for larger result sets.',
        },
        next_page_token: {
          displayName: 'Next Page Token',
          shortDesc: 'Token for pagination',
          longDesc:
            'The pagination token to retrieve the next page of results. Obtained from previous list operations.',
        },
        group_id: {
          displayName: 'Group ID',
          shortDesc: 'Filter users by group membership',
          longDesc:
            'Optional group identifier to filter users who are members of a specific group. When specified, only users belonging to this group will be returned.',
        },
        filter: {
          displayName: 'Filter Criteria',
          shortDesc: 'Additional filter conditions',
          longDesc:
            'Optional filter criteria to narrow down the user list based on specific attributes and conditions.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'User attribute to filter on',
                longDesc: 'The user attribute field to apply the filter condition against.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Comparison operator',
                longDesc: 'The comparison operator to use when evaluating the filter condition.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Value to match against',
                longDesc:
                  'The value to compare against the specified field using the selected operator.',
              },
            },
          },
        },
      },
    },
    create_group: {
      displayName: 'Create Group',
      shortDesc: 'Create a new group in Active Directory',
      longDesc:
        'Create a new group in Active Directory with specified properties, type, and security settings. Supports both security groups and Microsoft 365 groups.',
      options: {
        displayName: {
          displayName: 'Display Name',
          shortDesc: 'Name of the group',
          longDesc:
            'The display name of the group as it will appear in Active Directory and throughout Microsoft services.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Group description',
          longDesc: 'Optional description explaining the purpose and scope of the group.',
        },
        groupTypes: {
          displayName: 'Group Types',
          shortDesc: 'Type characteristics of the group',
          longDesc:
            'Optional array specifying special characteristics of the group, such as Unified (Microsoft 365) or DynamicMembership.',
        },
        mailEnabled: {
          displayName: 'Mail Enabled',
          shortDesc: 'Enable email functionality',
          longDesc:
            'Whether the group should be mail-enabled, allowing it to receive and send emails.',
        },
        mailNickname: {
          displayName: 'Mail Nickname',
          shortDesc: 'Email alias for the group',
          longDesc:
            "The mail nickname used for the group's email address. Must contain only letters, numbers, periods, hyphens, and underscores.",
        },
        securityEnabled: {
          displayName: 'Security Enabled',
          shortDesc: 'Enable security functionality',
          longDesc:
            'Whether the group should be security-enabled, allowing it to be assigned permissions and used for access control.',
        },
        isAssignableToRole: {
          displayName: 'Assignable to Role',
          shortDesc: 'Allow role assignment',
          longDesc:
            'Whether the group can be assigned to Azure AD roles. This setting cannot be changed after group creation.',
        },
        visibility: {
          displayName: 'Visibility',
          shortDesc: 'Group visibility setting',
          longDesc:
            'Controls who can see the group and its content. Options include Public, Private, or HiddenMembership.',
        },
      },
    },
    update_group: {
      displayName: 'Update Group',
      shortDesc: 'Update an existing group in Active Directory',
      longDesc:
        'Modify properties of an existing group in Active Directory, including display name, description, visibility, and other configurable settings.',
      options: {
        group_id: {
          displayName: 'Group ID',
          shortDesc: 'Identifier of the group to update',
          longDesc:
            'The unique identifier of the group to be updated. Select from existing groups in your directory.',
        },
        displayName: {
          displayName: 'Display Name',
          shortDesc: 'Updated group name',
          longDesc: 'The updated display name of the group as it will appear in Active Directory.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Updated group description',
          longDesc: 'The updated description explaining the purpose and scope of the group.',
        },
        mailNickname: {
          displayName: 'Mail Nickname',
          shortDesc: 'Updated email alias',
          longDesc:
            'The updated mail nickname for the group. Must contain only letters, numbers, periods, hyphens, and underscores.',
        },
        visibility: {
          displayName: 'Visibility',
          shortDesc: 'Updated visibility setting',
          longDesc:
            'The updated visibility setting controlling who can see the group and its content.',
        },
        preferredLanguage: {
          displayName: 'Preferred Language',
          shortDesc: "Group's preferred language",
          longDesc: "The preferred language for the group's communications and interface.",
        },
        allowExternalSenders: {
          displayName: 'Allow External Senders',
          shortDesc: 'Allow external email senders',
          longDesc: 'Whether people external to the organization can send messages to the group.',
        },
        autoSubscribeNewMembers: {
          displayName: 'Auto-Subscribe New Members',
          shortDesc: 'Automatically subscribe new members',
          longDesc:
            'Whether new members should be automatically subscribed to receive email notifications from the group.',
        },
        hideFromAddressLists: {
          displayName: 'Hide from Address Lists',
          shortDesc: 'Hide group from address lists',
          longDesc: 'Whether to hide this group from address lists and directory browsing.',
        },
        hideFromOutlookClients: {
          displayName: 'Hide from Outlook Clients',
          shortDesc: 'Hide group from Outlook clients',
          longDesc: 'Whether to hide this group from appearing in Outlook clients.',
        },
      },
    },
    get_group: {
      displayName: 'Get Group',
      shortDesc: 'Retrieve group information from Active Directory',
      longDesc:
        'Fetch detailed information about a specific group from Active Directory, including properties, settings, and configuration details.',
      options: {
        group_id: {
          displayName: 'Group ID',
          shortDesc: 'Identifier of the group to retrieve',
          longDesc:
            'The unique identifier of the group to retrieve information for. Select from existing groups in your directory.',
        },
      },
    },
    delete_group: {
      displayName: 'Delete Group',
      shortDesc: 'Delete a group from Active Directory',
      longDesc:
        'Permanently remove a group from Active Directory. This action cannot be undone and will remove all group memberships and associated permissions.',
      options: {
        group_id: {
          displayName: 'Group ID',
          shortDesc: 'Identifier of the group to delete',
          longDesc:
            'The unique identifier of the group to be deleted. Select from existing groups in your directory.',
        },
      },
    },
    list_groups: {
      displayName: 'List Groups',
      shortDesc: 'Retrieve a list of groups from Active Directory',
      longDesc:
        'Get a paginated list of groups from Active Directory with optional filtering criteria. Useful for reporting and group management operations.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of groups to return',
          longDesc:
            'The maximum number of groups to return in a single request. Default is 20, with pagination available for larger result sets.',
        },
        next_page_token: {
          displayName: 'Next Page Token',
          shortDesc: 'Token for pagination',
          longDesc:
            'The pagination token to retrieve the next page of results. Obtained from previous list operations.',
        },
        filter: {
          displayName: 'Filter Criteria',
          shortDesc: 'Filter conditions for groups',
          longDesc:
            'Optional filter criteria to narrow down the group list based on specific attributes and conditions.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Group attribute to filter on',
                longDesc: 'The group attribute field to apply the filter condition against.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Comparison operator',
                longDesc: 'The comparison operator to use when evaluating the filter condition.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Value to match against',
                longDesc:
                  'The value to compare against the specified field using the selected operator.',
              },
            },
          },
        },
      },
    },
    add_user_to_group: {
      displayName: 'Add User to Group',
      shortDesc: 'Add a user to an Active Directory group',
      longDesc:
        'Add a user as a member of an existing group in Active Directory. This grants the user any permissions and access rights associated with the group.',
      options: {
        user_id: {
          displayName: 'User ID',
          shortDesc: 'User to add to the group',
          longDesc:
            'The unique identifier of the user to be added to the group. Select from existing users in your directory.',
        },
        group_id: {
          displayName: 'Group ID',
          shortDesc: 'Target group',
          longDesc:
            'The unique identifier of the group to add the user to. Select from existing groups in your directory.',
        },
      },
    },
    remove_user_from_group: {
      displayName: 'Remove User from Group',
      shortDesc: 'Remove a user from an Active Directory group',
      longDesc:
        'Remove a user from membership in an existing group in Active Directory. This revokes any permissions and access rights the user had through this group.',
      options: {
        group_id: {
          displayName: 'Group ID',
          shortDesc: 'Source group',
          longDesc:
            'The unique identifier of the group to remove the user from. Select from existing groups in your directory.',
        },
        user_id: {
          displayName: 'User ID',
          shortDesc: 'User to remove from the group',
          longDesc:
            'The unique identifier of the user to be removed from the group. Select from existing users in your directory.',
        },
      },
    },
  },
};

export default ActiveDirectoryEn;
