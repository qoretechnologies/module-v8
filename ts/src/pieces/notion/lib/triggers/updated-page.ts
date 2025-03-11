import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { Debugger } from '../../../../utils/Debugger';
import { getNotionPageIdAllowedValues } from '../common/helpers/get-page-id-allowed-values';
import { NOTION_FETCH_DELAY, NOTION_FETCH_MAX_RETRIES, pageItemQoreType } from './constants';
import { DEFAULT_TRIGGER_POLLING_INTERVAL } from '../../../../global/constants';
import { delayOrCancel } from '../../../../global/helpers/event-triggers';
import { mapNotionProperties } from '../common/properties-mapping';
import { delay } from '../../../../global/helpers';

const notionUpdatedPageEvent = QoreAppCreator.createLocalizedTrigger({
  app: 'Notion',
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

        await delayOrCancel(DEFAULT_TRIGGER_POLLING_INTERVAL, should_stop);
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
});

const getPageById = async (token: string, pageId: string) => {
  const notion = new Client({
    auth: token,
    notionVersion: '2022-02-22',
  });

  let retries = 0;

  while (true) {
    try {
      const response = await notion.pages.retrieve({
        page_id: pageId,
      });

      return {
        ...response,
        ...('properties' in response
          ? { properties: mapNotionProperties(response.properties) }
          : {}),
      };
    } catch (error) {
      retries++;

      if (retries > NOTION_FETCH_MAX_RETRIES) {
        throw error;
      }

      Debugger.log(
        `Notion API page request failed (attempt ${retries}/${NOTION_FETCH_MAX_RETRIES}). Reason:`,
        error
      );

      await delay(NOTION_FETCH_DELAY);
    }
  }
};

export default notionUpdatedPageEvent;
