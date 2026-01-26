import { IQorePartialAppActionWithSwaggerPath } from '@qoretechnologies/ts-toolkit';
import { CONFLUENCE_BLOG_POSTS_ACTIONS } from './blogposts';
import { CONFLUENCE_PAGES_ACTIONS } from './pages';
import { CONFLUENCE_SPACES_ACTIONS } from './spaces';
import { CONFLUENCE_TASKS_ACTIONS } from './tasks';

export const CONFLUENCE_ACTIONS = [
  ...CONFLUENCE_BLOG_POSTS_ACTIONS,
  ...CONFLUENCE_PAGES_ACTIONS,
  ...CONFLUENCE_SPACES_ACTIONS,
  ...CONFLUENCE_TASKS_ACTIONS,
] satisfies IQorePartialAppActionWithSwaggerPath[];
