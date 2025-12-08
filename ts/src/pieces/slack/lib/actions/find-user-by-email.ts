import { WebClient } from '@slack/web-api';
import { createAction, Property } from 'core/framework';
import { slackAuth } from '../../';
import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const findUserByEmailResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'bool',
      display_name: 'Success',
      short_desc: 'Indicates if the channel was successfully created',
      desc: 'Indicates if the channel was successfully created',
      example_value: true,
    },
    user: {
      display_name: 'User',
      short_desc: 'The user found by email',
      desc: 'The user found by email',
      type: {
        type: 'hash',
        fields: {
          id: {
            type: 'string',
            display_name: 'User ID',
            short_desc: 'The unique identifier for the user',
            desc: 'The unique identifier for the user',
            example_value: 'U1234567890',
          },
          name: {
            type: 'string',
            display_name: 'User Name',
            short_desc: 'The name of the user',
            desc: 'The name of the user',
            example_value: 'john.doe',
          },
          profile: {
            display_name: 'Profile',
            short_desc: 'The profile of the user',
            desc: 'The profile of the user',
            type: {
              type: 'hash',
              fields: {
                title: {
                  type: 'string',
                  display_name: 'Title',
                  short_desc: 'The title of the user',
                  desc: 'The title of the user',
                  example_value: 'Software Engineer',
                },
                phone: {
                  type: 'string',
                  display_name: 'Phone',
                  short_desc: 'The phone number of the user',
                  desc: 'The phone number of the user',
                  example_value: '+1 123-456-7890',
                },
                skype: {
                  type: 'string',
                  display_name: 'Skype',
                  short_desc: 'The Skype ID of the user',
                  desc: 'The Skype ID of the user',
                  example_value: 'my.skype.id',
                },
                real_name: {
                  type: 'string',
                  display_name: 'Real Name',
                  short_desc: 'The real name of the user',
                  desc: 'The real name of the user',
                  example_value: 'John Doe',
                },
                real_name_normalized: {
                  type: 'string',
                  display_name: 'Normalized Real Name',
                  short_desc: 'The normalized real name of the user',
                  desc: 'The normalized real name of the user',
                  example_value: 'John Doe',
                },
                display_name: {
                  type: 'string',
                  display_name: 'Display Name',
                  short_desc: 'The display name of the user',
                  desc: 'The display name of the user',
                  example_value: 'John Doe',
                },
                display_name_normalized: {
                  type: 'string',
                  display_name: 'Normalized Display Name',
                  short_desc: 'The normalized display name of the user',
                  desc: 'The normalized display name of the user',
                  example_value: 'John Doe',
                },
                status_text: {
                  type: 'string',
                  display_name: 'Status Text',
                  short_desc: 'The status text of the user',
                  desc: 'The status text of the user',
                  example_value: 'Working from home',
                },
                status_emoji: {
                  type: 'string',
                  display_name: 'Status Emoji',
                  short_desc: 'The status emoji of the user',
                  desc: 'The status emoji of the user',
                  example_value: ':house_with_garden:',
                },
                status_expiration: {
                  type: 'number',
                  display_name: 'Status Expiration',
                  short_desc: 'The status expiration of the user',
                  desc: 'The status expiration of the user',
                  example_value: 0,
                },
                avatar_hash: {
                  type: 'string',
                  display_name: 'Avatar Hash',
                  short_desc: 'The avatar hash of the user',
                  desc: 'The avatar hash of the user',
                  example_value: 'g216345234',
                },
                email: {
                  type: 'string',
                  display_name: 'Email',
                  short_desc: 'The email address of the user',
                  desc: 'The email address of the user',
                  example_value: 'example@email.com',
                },
                first_name: {
                  type: 'string',
                  display_name: 'First Name',
                  short_desc: 'The first name of the user',
                  desc: 'The first name of the user',
                  example_value: 'John',
                },
                last_name: {
                  type: 'string',
                  display_name: 'Last Name',
                  short_desc: 'The last name of the user',
                  desc: 'The last name of the user',
                  example_value: 'Doe',
                },
                image_24: {
                  type: 'string',
                  display_name: 'Image 24',
                  short_desc: 'The 24x24 image of the user',
                  desc: 'The 24x24 image of the user',
                  example_value: 'https://example.com/image_24.jpg',
                },
                image_32: {
                  type: 'string',
                  display_name: 'Image 32',
                  short_desc: 'The 32x32 image of the user',
                  desc: 'The 32x32 image of the user',
                  example_value: 'https://example.com/image_32.jpg',
                },
                image_48: {
                  type: 'string',
                  display_name: 'Image 48',
                  short_desc: 'The 48x48 image of the user',
                  desc: 'The 48x48 image of the user',
                  example_value: 'https://example.com/image_48.jpg',
                },
                image_72: {
                  type: 'string',
                  display_name: 'Image 72',
                  short_desc: 'The 72x72 image of the user',
                  desc: 'The 72x72 image of the user',
                  example_value: 'https://example.com/image_72.jpg',
                },
                image_192: {
                  type: 'string',
                  display_name: 'Image 192',
                  short_desc: 'The 192x192 image of the user',
                  desc: 'The 192x192 image of the user',
                  example_value: 'https://example.com/image_192.jpg',
                },
                image_512: {
                  type: 'string',
                  display_name: 'Image 512',
                  short_desc: 'The 512x512 image of the user',
                  desc: 'The 512x512 image of the user',
                  example_value: 'https://example.com/image_512.jpg',
                },
                team: {
                  type: 'string',
                  display_name: 'Team',
                  short_desc: 'The team of the user',
                  desc: 'The team of the user',
                  example_value: 'T1234567890',
                },
              },
            },
          },
          team_id: {
            type: 'string',
            display_name: 'Team ID',
            short_desc: 'The unique identifier for the team',
            desc: 'The unique identifier for the team',
            example_value: 'T1234567890',
          },
          deleted: {
            type: 'bool',
            display_name: 'Deleted?',
            short_desc: 'Indicates if the user has been deleted',
            desc: 'Indicates if the user has been deleted',
            example_value: false,
          },
          color: {
            type: 'string',
            display_name: 'Color',
            short_desc: 'The color of the user',
            desc: 'The color of the user',
            example_value: '9f69e7',
          },
          real_name: {
            type: 'string',
            display_name: 'Real Name',
            short_desc: 'The real name of the user',
            desc: 'The real name of the user',
            example_value: 'John Doe',
          },
          tz: {
            type: 'string',
            display_name: 'Timezone',
            short_desc: 'The timezone of the user',
            desc: 'The timezone of the user',
            example_value: 'America/Los_Angeles',
          },
          tz_label: {
            type: 'string',
            display_name: 'Timezone Label',
            short_desc: 'The timezone label of the user',
            desc: 'The timezone label of the user',
            example_value: 'Pacific Daylight Time',
          },
          tz_offset: {
            type: 'number',
            display_name: 'Timezone Offset',
            short_desc: 'The timezone offset of the user',
            desc: 'The timezone offset of the user',
            example_value: -25200,
          },
          is_admin: {
            type: 'bool',
            display_name: 'Is Admin?',
            short_desc: 'Indicates if the user is an admin',
            desc: 'Indicates if the user is an admin',
            example_value: false,
          },
          is_owner: {
            type: 'bool',
            display_name: 'Is Owner?',
            short_desc: 'Indicates if the user is an owner',
            desc: 'Indicates if the user is an owner',
            example_value: false,
          },
          is_primary_owner: {
            type: 'bool',
            display_name: 'Is Primary Owner?',
            short_desc: 'Indicates if the user is a primary owner',
            desc: 'Indicates if the user is a primary owner',
            example_value: false,
          },
          is_restricted: {
            type: 'bool',
            display_name: 'Is Restricted?',
            short_desc: 'Indicates if the user is restricted',
            desc: 'Indicates if the user is restricted',
            example_value: false,
          },
          is_ultra_restricted: {
            type: 'bool',
            display_name: 'Is Ultra Restricted?',
            short_desc: 'Indicates if the user is ultra restricted',
            desc: 'Indicates if the user is ultra restricted',
            example_value: false,
          },
          is_bot: {
            type: 'bool',
            display_name: 'Is Bot?',
            short_desc: 'Indicates if the user is a bot',
            desc: 'Indicates if the user is a bot',
            example_value: false,
          },
          updated: {
            type: 'number',
            display_name: 'Updated',
            short_desc: 'The date the user was last updated',
            desc: 'The date the user was last updated',
            example_value: 1629983662,
          },
          is_app_user: {
            type: 'bool',
            display_name: 'Is App User?',
            short_desc: 'Indicates if the user is an app user',
            desc: 'Indicates if the user is an app user',
            example_value: false,
          },
          is_email_confirmed: {
            type: 'bool',
            display_name: 'Is Email Confirmed?',
            short_desc: 'Indicates if the user has confirmed their email',
            desc: 'Indicates if the user has confirmed their email',
            example_value: true,
          },
        },
      },
    },
  },
} satisfies TQoreResponseType;

export const findUserByEmailAction = createAction({
  auth: slackAuth,
  name: 'slack-find-user-by-email',
  displayName: 'Find User by Email',
  description: 'Finds a user by matching against their email address.',
  props: {
    email: Property.ShortText({
      displayName: 'Email',
      required: true,
    }),
  },
  responseType: findUserByEmailResponseType,
  async run({ auth, propsValue }) {
    const email = propsValue.email;
    const client = new WebClient(auth.access_token);

    const users = await client.users.lookupByEmail({
      email,
    });

    return users;
  },
});
