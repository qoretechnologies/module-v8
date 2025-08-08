import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { LINKED_IN_APP_NAME, LinkedInError } from '../constants';
import { linkedInApiClient } from '../helpers/constants';

const action = 'delete_user_post';

const options = {
  post: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const deleteUserPost = QoreAppCreator.createLocalizedAction<typeof options>({
  app: LINKED_IN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, post } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['post'],
      ErrorClass: LinkedInError,
    });

    try {
      await linkedInApiClient({
        token,
        path: `ugcPosts/${post}`,
        method: 'DELETE',
      });
    } catch (error) {
      throw new LinkedInError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
});

export default deleteUserPost;
