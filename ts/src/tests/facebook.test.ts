import { Page, Post } from 'facebook-nodejs-business-sdk';
import {
  FacebookCreatePagePost,
  FacebookGetPage,
  FacebookGetPagePost,
  FacebookGetPagePostInsights,
  FacebookGetPostComments,
  FacebookLikePostComment,
  FacebookReplyToComment,
  FacebookSearchPagePosts,
} from '../apps/facebook-pages/actions';
import { createFacebookClient } from '../apps/facebook-pages/helpers/constants';
import { getFacebookCommentIdAllowedValues } from '../apps/facebook-pages/helpers/get-comment-id-allowed-values';
import { getFacebookPageIdAllowedValues } from '../apps/facebook-pages/helpers/get-page-id-allowed-values';
import { getFacebookPostIdAllowedValues } from '../apps/facebook-pages/helpers/get-post-id-allowed-values';
import { Debugger, DebugLevels } from '../utils/Debugger';

Debugger.level = DebugLevels.Verbose;

describe('Facebook', () => {
  const base_context = {
    conn_opts: {
      token: '',
    } as any,
  };

  beforeAll(() => {
    const facebookToken = process.env.FACEBOOK_TOKEN;

    if (!facebookToken) {
      throw new Error(`
        Please set the FACEBOOK_TOKEN environment variable.
      `);
    }

    base_context.conn_opts.token = facebookToken;
  });

  let pageId: string | undefined;
  let postId: string | undefined;
  let commentId: string | undefined;
  let createdPostId: string | undefined;

  describe('Should test facebook allowed values', () => {
    it('Should get page allowed values', async () => {
      const allowed_values = await getFacebookPageIdAllowedValues(base_context);

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      pageId = allowed_values[0].value;
    });

    it('Should get post allowed values', async () => {
      const allowed_values = await getFacebookPostIdAllowedValues({
        ...base_context,
        opts: { page_id: pageId },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      postId = allowed_values[0].value;
    });

    it('Should get comment allowed values', async () => {
      const allowed_values = await getFacebookCommentIdAllowedValues({
        ...base_context,
        opts: { page_id: pageId, post_id: postId },
      });

      expect(allowed_values).toBeDefined();
      expect(allowed_values.length).toBeGreaterThan(0);
      expect(allowed_values[0].value).toBeDefined();

      commentId = allowed_values[0].value;
      expect(commentId).toBeDefined();
    });
  });

  describe('Should test facebook pages actions', () => {
    it('Should get page metrics', async () => {
      const action = FacebookGetPagePostInsights;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          page_id: pageId,
          post_id: postId,
          metrics: ['post_impressions', 'post_clicks'],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should search for posts', async () => {
      const action = FacebookSearchPagePosts;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          page_id: pageId,
          limit: 10,
          fields: ['comments.summary(true)', 'likes.summary(true)'],
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('Should create a page post', async () => {
      const action = FacebookCreatePagePost;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          page_id: pageId,
          message: 'Test post from Qore',
          link: 'https://qoretechnologies.com',
          published: true,
          feed_story_visibility: 'visible',
          timeline_visibility: 'normal',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      createdPostId = result.post_id;
    });

    it('Should get a page post', async () => {
      const action = FacebookGetPagePost;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          page_id: pageId,
          post_id: createdPostId,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.post_id).toBe(createdPostId);
    });

    it('Should get a page', async () => {
      const action = FacebookGetPage;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          page_id: pageId,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.page_id).toBe(pageId);
    });

    it('Should get post comments', async () => {
      const action = FacebookGetPostComments;

      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          page_id: pageId,
          post_id: postId,
          include_replies: true,
          limit: 10,
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.comments).toBeDefined();
      expect(result.comments.length).toBeGreaterThan(0);
    });

    it('Should like a comment', async () => {
      const action = FacebookLikePostComment;
      if (!('api_function' in action)) throw new Error('api_function not found in action');
      const result = await action.api_function(
        {
          page_id: pageId,
          post_id: postId,
          comment_id: commentId,
          action: 'like',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
    });

    it('Should reply to a comment', async () => {
      const action = FacebookReplyToComment;
      if (!('api_function' in action)) throw new Error('api_function not found in action');

      const result = await action.api_function(
        {
          page_id: pageId,
          post_id: postId,
          comment_id: commentId,
          attachment_url: 'https://streetphotography.com/wp-content/uploads/2017/08/test.png',
          message: 'This is a test reply from Qore',
        },
        undefined,
        base_context
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('Should clean up ', () => {
    it('Should delete the created post', async () => {
      let fb = createFacebookClient(base_context.conn_opts.token);

      if (!createdPostId) {
        throw new Error('No created post ID found to delete');
      }

      const page = new Page(pageId, undefined, undefined, fb);
      const pageInfo = await page.read(['id', 'name', 'access_token']);
      fb = createFacebookClient(pageInfo._data.access_token);
      const post = new Post(createdPostId, undefined, undefined, fb);
      await post.delete([]);
    });
  });
});
