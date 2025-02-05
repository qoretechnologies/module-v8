import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { EQoreAppActionCode, TQorePartialEventAction } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../../utils/Debugger';
import { getNotionPageIdAllowedValues } from '../common/helpers/get-page-id-allowed-values';
import { pageItemQoreType } from './constants';

export default {
  action: 'updated_page',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    pageId: {
      required: true,
      get_allowed_values: getNotionPageIdAllowedValues,
      type: 'string',
    },
  },
  event_function: async (context, update, should_stop) => {
    const token = context?.conn_opts?.token;

    if (!token) {
      throw new Error('Notion token is required for updated_page event');
    }

    const pageId = context?.opts?.pageId;

    if (!pageId) {
      throw new Error('Notion Page Id is required for updated_page event');
    }

    try {
      let page = (await getPageById(token, pageId)) as PageObjectResponse;
      let lastEditedTime = page.last_edited_time;

      while (!should_stop()) {
        page = (await getPageById(token, pageId)) as PageObjectResponse;
        if (lastEditedTime !== page.last_edited_time) {
          update(page);
        }
        lastEditedTime = page.last_edited_time;

        await new Promise((resolve) => setTimeout(resolve, 30_000));
      }
    } catch (error) {
      Debugger.log('Error in updated_page event_function', error);
    }
  },
  event_info: {
    desc: 'Notion Page Updated Event Info',
    type: pageItemQoreType,
  },
  get_example_event_data: async (context) => {
    const token = context?.conn_opts?.token;
    const pageId = context?.opts?.pageId;

    if (!token || !pageId) return;

    const page = await getPageById(token, pageId);

    return page;
  },
} satisfies TQorePartialEventAction;

const getPageById = async (token: string, pageId: string) => {
  const notion = new Client({
    auth: token,
    notionVersion: '2022-02-22',
  });

  const response = await notion.pages.retrieve({
    page_id: pageId,
  });

  return response;
};
