import { QoreAppCreator, TQoreOptions, EQoreAppActionCode } from '@qoretechnologies/ts-toolkit';
import { L } from '../i18n/i18n-node';

const options = {
  option1: {
    display_name: L.en.apps._testing.actions.test.options.option1.displayName(),
    short_desc: L.en.apps._testing.actions.test.options.option1.shortDesc(),
    desc: L.en.apps._testing.actions.test.options.option1.longDesc(),
    type: 'string',
    required: true,
    example_value: '123',
  },
} satisfies TQoreOptions;

export default QoreAppCreator.createLocalizedAction({
  action: 'delete-attachment',
  app: 'test',
  action_code: EQoreAppActionCode.ACTION,
  api_function: (data) => {
    try {
      return {
        channel: {
          id: data?.option1,
        },
      };
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  },
  options: options,
  override_options: {
    token: {
      required: true,
      short_desc: 'Token of the attachment to delete',
      get_allowed_values: (context) => {
        console.log(context);

        return [{ value: 123 }];
      },
    },
  },
  response_type: {
    type: 'hash',
    fields: {
      channel: {
        type: {
          type: 'hash',
          fields: {
            id: {
              display_name: 'test',
              short_desc: 'test',
              desc: 'test',
              type: 'int',
            },
          },
          display_name: 'dname',
          short_desc: 'sdesc',
          desc: 'desc',
        },
      },
    },
  },
});
