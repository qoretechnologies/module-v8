import { EQoreAppActionCode, TQoreAppAction } from '../global/models/qore';

const testActionWithEvent = {
  app: 'test',
  action: 'test',
  action_code: EQoreAppActionCode.EVENT,
  event_function: (context, update) => {
    console.log('Event:', context, update({ id: 1 }));
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
} satisfies TQoreAppAction;
