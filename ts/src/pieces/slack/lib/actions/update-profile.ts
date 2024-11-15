import { WebClient } from '@slack/web-api';
import { createAction, Property } from 'core/framework';
import { slackAuth } from '../../';
import { IActionResponse } from 'global/models/actions';

const updateProfileResponseType = {
  type: 'hash',
  fields: {
    ok: {
      type: 'boolean',
      display_name: 'Success',
      short_desc: 'Indicates if the profile was successfully updated',
      desc: 'Indicates if the reaction was successfully added',
      example_value: true,
    },
    username: {
      type: 'string',
      display_name: 'Username',
      desc: 'The user’s username',
      short_desc: 'The user’s username',
      example_value: 'spengler',
    },
    profile: {
      display_name: 'Profile',
      desc: 'The user’s profile',
      short_desc: "The user's profile",
      type: 'hash',
      fields: {
        title: {
          type: 'string',
          display_name: 'Title',
          desc: 'The user’s title',
          short_desc: 'The user’s title',
          example_value: 'Software Engineer',
        },
        phone: {
          type: 'string',
          display_name: 'Phone',
          desc: 'The user’s phone number',
          short_desc: 'The user’s phone number',
          example_value: '+1 123 456 7890',
        },
        skype: {
          type: 'string',
          display_name: 'Skype',
          desc: 'The user’s Skype ID',
          short_desc: 'The user’s Skype ID',
          example_value: 'my_skype_id',
        },
        real_name: {
          type: 'string',
          display_name: 'Real Name',
          desc: 'The user’s real name',
          short_desc: 'The user’s real name',
          example_value: 'Egon Spengler',
        },
        display_name: {
          type: 'string',
          display_name: 'Display Name',
          desc: 'The user’s display name',
          short_desc: 'The user’s display name',
          example_value: 'spengler',
        },
        email: {
          type: 'string',
          display_name: 'Email',
          desc: 'The user’s email address',
          short_desc: 'The user’s email address',
          example_value: 'example@email.com',
        },
        first_name: {
          type: 'string',
          display_name: 'First Name',
          desc: 'The user’s first name',
          short_desc: 'The user’s first name',
          example_value: 'Egon',
        },
        last_name: {
          type: 'string',
          display_name: 'Last Name',
          desc: 'The user’s last name',
          short_desc: 'The user’s last name',
          example_value: 'Spengler',
        },
        image_24: {
          type: 'string',
          display_name: 'Image 24',
          desc: 'The 24x24 image of the user',
          short_desc: 'The 24x24 image of the user',
          example_value: 'https://example.com/image_24.jpg',
        },
        image_32: {
          type: 'string',
          display_name: 'Image 32',
          desc: 'The 32x32 image of the user',
          short_desc: 'The 32x32 image of the user',
          example_value: 'https://example.com/image_32.jpg',
        },
        image_48: {
          type: 'string',
          display_name: 'Image 48',
          desc: 'The 48x48 image of the user',
          short_desc: 'The 48x48 image of the user',
          example_value: 'https://example.com/image_48.jpg',
        },
        image_72: {
          type: 'string',
          display_name: 'Image 72',
          desc: 'The 72x72 image of the user',
          short_desc: 'The 72x72 image of the user',
          example_value: 'https://example.com/image_72.jpg',
        },
        image_192: {
          type: 'string',
          display_name: 'Image 192',
          desc: 'The 192x192 image of the user',
          short_desc: 'The 192x192 image of the user',
          example_value: 'https://example.com/image_192.jpg',
        },
        image_512: {
          type: 'string',
          display_name: 'Image 512',
          desc: 'The 512x512 image of the user',
          short_desc: 'The 512x512 image of the user',
          example_value: 'https://example.com/image_512.jpg',
        },
      },
    },
  },
} satisfies IActionResponse;

export const updateProfileAction = createAction({
  auth: slackAuth,
  name: 'slack-update-profile',
  displayName: 'Update Profile',
  description: 'Update basic profile field such as name or title.',
  props: {
    firstName: Property.ShortText({
      displayName: 'First Name',
      required: false,
    }),
    lastName: Property.ShortText({
      displayName: 'Last Name',
      required: false,
    }),
    email: Property.ShortText({
      displayName: 'Email',
      description: `Changing a user's email address will send an email to both the old and new addresses, and also post a slackbot message to the user informing them of the change.`,
      required: false,
    }),
    userId: Property.ShortText({
      displayName: 'User',
      description:
        'ID of user to change. This argument may only be specified by admins on paid teams.You can use **Find User by Email** action to retrieve ID.',
      required: false,
    }),
  },
  responseType: updateProfileResponseType,
  async run({ auth, propsValue }) {
    const client = new WebClient(auth.data['authed_user']?.access_token);

    return client.users.profile.set({
      profile: {
        first_name: propsValue.firstName,
        last_name: propsValue.lastName,
        email: propsValue.email,
      },
      user: propsValue.userId,
    });
  },
});
