export const CraftTaskResponseType = {
  type: 'hash',
  fields: {
    id: { type: 'string' },
    markdown: { type: 'string' },
    taskInfo: {
      type: {
        type: 'hash',
        fields: {
          state: { type: 'string' },
          scheduleDate: { type: 'string' },
          deadlineDate: { type: 'string' },
        },
      },
    },
    location: {
      type: {
        type: 'hash',
        fields: {
          type: { type: 'string' },
          title: { type: 'string' },
          date: { type: 'string' },
        },
      },
    },
  },
} as const;
