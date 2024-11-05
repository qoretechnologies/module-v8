import { EQoreAppActionCode, IQoreAppActionWithEvent } from '../global/models/qore';

export const testActionWithEvent = {
  app: 'test',
  action: 'test',
  action_code: EQoreAppActionCode.EVENT,
  event_function: (context, update, should_stop) => {
    console.log('Event function called with:', context, update, should_stop);
  },
  event_info: {
    desc: 'Test',
    type: {
      id: {
        name: 'id',
        display_name: 'ID',
        short_desc: 'ID',
        desc: 'ID',
        type: 'int',
      },
    },
  },
} satisfies IQoreAppActionWithEvent;
