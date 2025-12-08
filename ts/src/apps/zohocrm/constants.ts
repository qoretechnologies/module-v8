import {
  EQoreRecordBasedAppErrorCodes,
  IQoreRestConnectionModifiers,
  TCustomConnOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../global/helpers';

export const ZOHO_CRM_APP_NAME = 'ZohoCRM';
export const ZOHO_CRM_APP_LOGO =
  'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI0LjIuMywgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6IzIxNzFCMTt9Cgkuc3Qxe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU+CjxjaXJjbGUgY2xhc3M9InN0MCIgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjQ1LjUiLz4KPGc+Cgk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNNDIzLjIsMjU2YzAuOCw0Ny4zLTM0LjMsOTUuMy04OC41LDEwMy45Yy0zNC4zLDUuNC02NS0zLjgtOTAuMi0yOC4xYy0xOS45LTE5LjItMzkuMi0zOS01OC43LTU4LjYKCQljLTEwLTEwLjEtMTIuOS0yMi40LTktMzUuOGMzLjktMTMuNSwxMy4zLTIyLjEsMjcuMi0yNC45YzEyLjQtMi41LDIzLjYsMC43LDMyLjgsOS45YzE3LjMsMTcuMywzNC41LDM0LjYsNTEuOSw1MS44CgkJYzguMSw4LDIwLDYuNiwyNS4xLTIuOGMzLjEtNS42LDIuMy0xMy0yLjUtMTcuOGMtMjAuMS0yMC4yLTM5LjctNDEuMS02MC43LTYwLjNjLTI0LjItMjIuMS01My4xLTI3LjctODQtMTcuMwoJCWMtMzAuNiwxMC4zLTQ5LjMsMzIuNC01NS42LDY0Yy05LjUsNDcuMywyMi44LDkyLjMsNzEsOTkuNmMxMS4yLDEuNywyMi4zLDEuMiwzMy4zLTEuN2M4LjMtMi4yLDE0LDAuMSwxNS43LDYuNAoJCWMxLjgsNi41LTEuOSwxMS42LTEwLjQsMTMuN2MtNjEuNiwxNS42LTExOS4xLTI0LjctMTI5LjktODEuOWMtMTEuMS01OC40LDI2LjktMTE0LjIsODUuOS0xMjRjMzQuMy01LjcsNjUsMy42LDkwLjMsMjcuOQoJCWMyMCwxOS4zLDM5LjUsMzkuMiw1OSw1OC45YzEwLDEwLjEsMTIuOCwyMi40LDguOSwzNS44Yy0zLjksMTMuMy0xMy4yLDIxLjktMjYuOCwyNC43Yy0xMywyLjctMjQuNC0wLjgtMzMuOS0xMC4zCgkJYy0xNi42LTE2LjctMzMuMy0zMy40LTUwLTUwLjFjLTMuNC0zLjQtNi45LTYuMi0xMi02LjNjLTYuOS0wLjItMTEuOCwyLjgtMTQuOCw4LjhjLTIuNiw1LjQtMS40LDEyLjQsMywxNwoJCWM1LjEsNS40LDEwLjUsMTAuNSwxNS43LDE1LjhjMTMuOCwxMy44LDI3LjUsMjcuNiw0MS40LDQxLjRjMTksMTguOSw0Mi4yLDI2LjksNjguNywyNC43YzM1LjItMi45LDY2LjItMzAuNSw3My45LTY1LjEKCQljMTAuNS00Ny40LTE5LTkyLjctNjYuOC0xMDIuM2MtMTIuMS0yLjQtMjQuMy0yLTM2LjMsMS4xYy0yLjEsMC41LTQuMiwxLjEtNi40LDEuMmMtNSwwLjItOS4xLTMuMS0xMC4xLTcuOAoJCWMtMS4xLTUuMywxLjItMTAuNCw2LjMtMTEuOWM2LjctMS45LDEzLjUtMy43LDIwLjQtNC4zYzU4LjctNS4yLDEwNC42LDM1LjMsMTEzLjgsODQuN0M0MjIsMjQyLjUsNDIyLjQsMjQ5LjMsNDIzLjIsMjU2eiIvPgo8L2c+Cjwvc3ZnPgo=';

export const ZOHO_CRM_API_VERSION = 'v8';

export class ZohoCrmError extends Error {
  public errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = 'ZohoCrmError';
    this.errorCode = errorCode;
  }
}

export const ZOHOCRM_DUPLICATE_ERROR_CODE = 'DUPLICATE_DATA';

export const ZohoCrmErrorCodeToQoreErrorCodeMap: Record<string, string> = {
  [ZOHOCRM_DUPLICATE_ERROR_CODE]: EQoreRecordBasedAppErrorCodes.DUPLICATE_RECORD,
};

export const ZOHO_CRM_CONN_OPTIONS = {
  location: {
    type: 'string',
  },
  'accounts-server': {
    type: 'string',
  },
} satisfies TCustomConnOptions;

export const setZohoCrmOptionsPostAuth: IQoreRestConnectionModifiers['set_options_post_auth'] = (
  context
) => {
  const { 'accounts-server': accountsServer, location } = getQoreContextRequiredValues({
    context,
    connectionFields: ['accounts-server', 'location'],
  });

  return {
    url: `https://www.zohoapis.${location}`,
    'accounts-server': accountsServer,
    location,
  };
};
