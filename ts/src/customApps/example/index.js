'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const ts_toolkit_1 = require('@qoretechnologies/ts-toolkit');
const CustomAction = ts_toolkit_1.QoreAppCreator.createAction({
  action: 'custom-action',
  app: 'External-app',
  display_name: 'Custom App Action',
  desc: 'This is a custom external action',
  action_code: ts_toolkit_1.EQoreAppActionCode.ACTION,
  options: {
    message: {
      type: 'string',
      required: true,
      short_desc: 'Message to be displayed',
      display_name: 'Test Message',
      desc: 'This is a test message',
    },
  },
  short_desc: 'Custom App Action',
  api_function: (data) => {
    return {
      message: `Server received message: ${data?.message}`,
    };
  },
  response_type: {
    type: 'hash',
    fields: {
      message: {
        type: 'string',
        required: true,
        display_name: 'Server Response',
        short_desc: 'Response from the server',
        example_value: 'Server response message',
        desc: 'This is a response message from the server',
      },
    },
  },
});
const CustomApp = ts_toolkit_1.QoreAppCreator.createApp({
  name: 'External-app',
  display_name: 'Testing External App',
  desc: 'This is a custom testing external app',
  short_desc: 'External testing app',
  groups: ['Other'],
  logo:
    'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUF' +
    'VCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2' +
    'ZzExLmR0ZCI+Cjxzdmcgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDYzIDYzIiB2ZXJzaW9uPSIxLj' +
    'EiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkv' +
    'eGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHN0eWxlPSJmaW' +
    'xsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6' +
    'MjsiPgogICAgPGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwtMTAuNzUxOCwtMjIuNzE5KSI+CiAgICAgICAgPHBhdGggZD' +
    '0iTTY4LjM2Myw2My45NzNMNjguMzYzLDQwLjEwOUM2OC4zNjMsNDAuMTA5IDY4LjM2MywzNy4xMTMgNjUuNzY4LDM1LjYxNUw0' +
    'NS4xMDIsMjMuNjgzQzQ1LjEwMiwyMy42ODMgNDIuNTA3LDIyLjE4NSAzOS45MTIsMjMuNjgzTDE5LjI0NSwzNS42MTVDMTkuMj' +
    'Q1LDM1LjYxNSAxNi42NSwzNy4xMTMgMTYuNjUsNDAuMTA5TDE2LjY1LDYzLjk3M0MxNi42NSw2My45NzMgMTYuNjUsNjYuOTY5' +
    'IDE5LjI0NSw2OC40NjdMNDcuODM5LDg0LjgyMkM0Ny44MzksODQuODIyIDUwLjQzNCw4Ni4zNjggNTMuMDI5LDg0Ljg3TDY0Lj' +
    'Y1Miw3OC4xMTJMNDIuNTIsNjUuNTAzTDQyLjUwNyw2NS41MTFMMzAuODQzLDU4Ljc3NkwzMC44NDMsNDUuMzA3TDQyLjUwNywz' +
    'OC41NzNMNTQuMTcxLDQ1LjMwN0w1NC4xNzEsNTguNzc2TDQ1LjIxMyw2My45NDhMNTkuNTY1LDcyLjA1TDY1Ljc2OCw2OC40Nj' +
    'lDNjUuNzY5LDY4LjQ2OCA2OC4zNjMsNjYuOTcgNjguMzYzLDYzLjk3MyIgc3R5bGU9ImZpbGw6cmdiKDAsMjMxLDI1NSk7Zmls' +
    'bC1ydWxlOm5vbnplcm87Ii8+CiAgICA8L2c+Cjwvc3ZnPgo=',
  logo_file_name: 'test.svg',
  logo_mime_type: 'image/svg+xml',
  actions: [CustomAction],
});
exports.default = CustomApp;
//# sourceMappingURL=index.js.map
