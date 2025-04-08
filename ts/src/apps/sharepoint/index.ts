import { TQoreAppWithActions } from '@qoretechnologies/ts-toolkit';
import L from '../../i18n/i18n-node';
import { Locales } from '../../i18n/i18n-types';
import { SHAREPOINT_APP_NAME } from './constants';
import * as actions from './actions';
import * as SHAREPOINT_TRIGGERS from './triggers';
import { mapActionsToApp, mapTriggersToApp } from '../../global/helpers';

const SHAREPOINT_ACTIONS = Object.values(actions);

export default (locale: Locales) =>
  ({
    display_name: L[locale].apps[SHAREPOINT_APP_NAME].displayName(),
    short_desc: L[locale].apps[SHAREPOINT_APP_NAME].shortDesc(),
    desc: L[locale].apps[SHAREPOINT_APP_NAME].longDesc(),
    name: SHAREPOINT_APP_NAME,
    actions: [
      ...mapActionsToApp(SHAREPOINT_APP_NAME, SHAREPOINT_ACTIONS, locale),
      ...mapTriggersToApp(SHAREPOINT_APP_NAME, SHAREPOINT_TRIGGERS, locale),
    ],
    logo:
      'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsb' +
      'HVzdHJhdG9yIDIzLjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMC' +
      'kgIC0tPgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d' +
      '3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiIFsKCTwhRU5USVRZIG5zX2V4dGVuZCAi' +
      'aHR0cDovL25zLmFkb2JlLmNvbS9FeHRlbnNpYmlsaXR5LzEuMC8iPgoJPCFFTlRJVFkgbnNfYWkgImh0dHA6L' +
      'y9ucy5hZG9iZS5jb20vQWRvYmVJbGx1c3RyYXRvci8xMC4wLyI+Cgk8IUVOVElUWSBuc19ncmFwaHMgImh0dH' +
      'A6Ly9ucy5hZG9iZS5jb20vR3JhcGhzLzEuMC8iPgoJPCFFTlRJVFkgbnNfdmFycyAiaHR0cDovL25zLmFkb2J' +
      'lLmNvbS9WYXJpYWJsZXMvMS4wLyI+Cgk8IUVOVElUWSBuc19pbXJlcCAiaHR0cDovL25zLmFkb2JlLmNvbS9J' +
      'bWFnZVJlcGxhY2VtZW50LzEuMC8iPgoJPCFFTlRJVFkgbnNfc2Z3ICJodHRwOi8vbnMuYWRvYmUuY29tL1Nhd' +
      'mVGb3JXZWIvMS4wLyI+Cgk8IUVOVElUWSBuc19jdXN0b20gImh0dHA6Ly9ucy5hZG9iZS5jb20vR2VuZXJpY0' +
      'N1c3RvbU5hbWVzcGFjZS8xLjAvIj4KCTwhRU5USVRZIG5zX2Fkb2JlX3hwYXRoICJodHRwOi8vbnMuYWRvYmU' +
      'uY29tL1hQYXRoLzEuMC8iPgpdPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxpdmVsbG9fMSIgeG1sbnM6eD0i' +
      'Jm5zX2V4dGVuZDsiIHhtbG5zOmk9IiZuc19haTsiIHhtbG5zOmdyYXBoPSImbnNfZ3JhcGhzOyIKCSB4bWxuc' +
      'z0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOT' +
      'k5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDE5OTIuMzMzIDE5NDYiCgkgZW5hYmxlLWJ' +
      'hY2tncm91bmQ9Im5ldyAwIDAgMTk5Mi4zMzMgMTk0NiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxtZXRhZGF0' +
      'YT4KCTxzZncgIHhtbG5zPSImbnNfc2Z3OyI+CgkJPHNsaWNlcz48L3NsaWNlcz4KCQk8c2xpY2VTb3VyY2VCb' +
      '3VuZHMgIGJvdHRvbUxlZnRPcmlnaW49InRydWUiIGhlaWdodD0iMTk0NiIgd2lkdGg9IjE5OTIuMzMzIiB4PS' +
      'ItOTk1LjMzMyIgeT0iLTk0OSI+PC9zbGljZVNvdXJjZUJvdW5kcz4KCTwvc2Z3Pgo8L21ldGFkYXRhPgo8Y2l' +
      'yY2xlIGZpbGw9IiMwMzZDNzAiIGN4PSIxMDE5LjMzMyIgY3k9IjU1NiIgcj0iNTU2Ii8+CjxjaXJjbGUgZmls' +
      'bD0iIzFBOUJBMSIgY3g9IjE0ODIuNjY3IiBjeT0iMTA2NS42NjciIHI9IjUwOS42NjciLz4KPGNpcmNsZSBma' +
      'WxsPSIjMzdDNkQwIiBjeD0iMTA4OC44MzMiIGN5PSIxNTUyLjE2NyIgcj0iMzkzLjgzMyIvPgo8cGF0aCBvcG' +
      'FjaXR5PSIwLjEiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgICAgIiBkPSJNMTExMiw1MDEuNzl2OTg4Ljc1M2M' +
      'tMC4yMywzNC4zNTctMjEuMDUsNjUuMjIyLTUyLjgyLDc4LjMwMwoJYy0xMC4xMTYsNC4yNzktMjAuOTg3LDYu' +
      'NDg0LTMxLjk3LDYuNDg3SDY5NS40NjNjLTAuNDYzLTcuODc3LTAuNDYzLTE1LjI5LTAuNDYzLTIzLjE2N2MtM' +
      'C4xNTQtNy43MzQsMC4xNTUtMTUuNDcsMC45MjctMjMuMTY3CgljOC40OC0xNDguMTA2LDk5LjcyMS0yNzguNz' +
      'gyLDIzNS44MzctMzM3Ljc3di04Ni4xOGMtMzAyLjkzMi00OC4wMDUtNTA5LjU5Mi0zMzIuNDk1LTQ2MS41ODc' +
      'tNjM1LjQyNwoJYzAuMzMzLTIuMDk4LDAuNjc3LTQuMTk1LDEuMDM0LTYuMjg5YzIuMzA2LTE1LjYyNiw1LjU1' +
      'Ni0zMS4wOTksOS43My00Ni4zMzNoNTQ2LjI3QzEwNzMuOTY0LDQxNy4xNzgsMTExMS44MjIsNDU1LjAzNiwxM' +
      'TEyLDUwMS43OQoJeiIvPgo8cGF0aCBvcGFjaXR5PSIwLjIiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgICAgIi' +
      'BkPSJNOTgwLjg3Nyw0NjMuMzMzSDQ3MS4yMWMtNTEuNDg2LDMwMi4zODYsMTUxLjkwOCw1ODkuMjU2LDQ1NC4' +
      'yOTMsNjQwLjc0MgoJYzkuMTU2LDEuNTU5LDE4LjM1LDIuODg4LDI3LjU3MywzLjk4NmMtMTQzLjYzMyw2OC4x' +
      'MS0yNDguMywyNjEuNTUyLTI1Ny4xOTYsNDIwLjkzOGMtMC43NzEsNy42OTctMS4wODEsMTUuNDMzLTAuOTI3L' +
      'DIzLjE2NwoJYzAsNy44NzcsMCwxNS4yOSwwLjQ2MywyMy4xNjdjMC44MzYsMTUuNTc0LDIuODUsMzEuMDYzLD' +
      'YuMDIzLDQ2LjMzM2gyNzkuMzljMzQuMzU3LTAuMjMsNjUuMjIyLTIxLjA1LDc4LjMwMy01Mi44MgoJYzQuMjc' +
      '5LTEwLjExNSw2LjQ4NS0yMC45ODcsNi40ODctMzEuOTdWNTQ4LjEyM0MxMDY1LjQ0Myw1MDEuMzg3LDEwMjcu' +
      'NjEzLDQ2My41MzcsOTgwLjg3Nyw0NjMuMzMzeiIvPgo8cGF0aCBvcGFjaXR5PSIwLjIiIGVuYWJsZS1iYWNrZ' +
      '3JvdW5kPSJuZXcgICAgIiBkPSJNOTgwLjg3Nyw0NjMuMzMzSDQ3MS4yMWMtNTEuNDc1LDMwMi40MTQsMTUxLj' +
      'k1LDU4OS4yOTcsNDU0LjM2NCw2NDAuNzczCgljNi4xODYsMS4wNTMsMTIuMzg5LDIuMDAxLDE4LjYwNywyLjg' +
      '0NGMtMTM5LDczLjAyMS0yMzkuNTQzLDI2Ni0yNDguMjU0LDQyMi4wNWgyODQuOTVjNDYuNjgxLTAuMzUzLDg0' +
      'LjQzNy0zOC4xMDksODQuNzktODQuNzkKCVY1NDguMTIzQzEwNjUuNDg5LDUwMS4zNjksMTAyNy42MzEsNDYzL' +
      'jUxMSw5ODAuODc3LDQ2My4zMzN6Ii8+CjxwYXRoIG9wYWNpdHk9IjAuMiIgZW5hYmxlLWJhY2tncm91bmQ9Im' +
      '5ldyAgICAiIGQ9Ik05MzQuNTQzLDQ2My4zMzNINDcxLjIxYy00OC42MDYsMjg1LjQ4MiwxMzAuMjc5LDU2MC4' +
      '0MDQsNDEwLjk3Nyw2MzEuNjE2CglDNzc1LjkwMSwxMjE2LjM4NCw3MTAuNzExLDEzNjguMzAxLDY5NS45Mjcs' +
      'MTUyOWgyMzguNjE3YzQ2Ljc1NC0wLjE3OCw4NC42MTItMzguMDM2LDg0Ljc5LTg0Ljc5VjU0OC4xMjMKCUMxM' +
      'DE5LjMwOCw1MDEuMzA2LDk4MS4zNjEsNDYzLjM1OSw5MzQuNTQzLDQ2My4zMzN6Ii8+CjxsaW5lYXJHcmFkaW' +
      'VudCBpZD0iU1ZHSURfMV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMTc3LjA3ODgiIHk' +
      'xPSIxNTUxLjAyODQiIHgyPSI4NDIuMjU0NSIgeTI9IjM5OC45NzE2IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0' +
      'cml4KDEgMCAwIC0xIDAgMTk0OCkiPgoJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6IzA1O' +
      'EY5MiIvPgoJPHN0b3AgIG9mZnNldD0iMC41IiBzdHlsZT0ic3RvcC1jb2xvcjojMDM4NDg5Ii8+Cgk8c3RvcC' +
      'Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojMDI2RDcxIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxwYXR' +
      'oIGZpbGw9InVybCgjU1ZHSURfMV8pIiBkPSJNODQuOTI5LDQ2My4zMzNoODQ5LjQ3NWM0Ni45MDUsMCw4NC45' +
      'MjksMzguMDI0LDg0LjkyOSw4NC45Mjl2ODQ5LjQ3NQoJYzAsNDYuOTA1LTM4LjAyNCw4NC45MjktODQuOTI5L' +
      'Dg0LjkyOUg4NC45MjljLTQ2LjkwNSwwLTg0LjkyOS0zOC4wMjQtODQuOTI5LTg0LjkyOVY1NDguMjYyCglDMC' +
      'w1MDEuMzU3LDM4LjAyNCw0NjMuMzMzLDg0LjkyOSw0NjMuMzMzeiIvPgo8cGF0aCBmaWxsPSIjRkZGRkZGIiB' +
      'kPSJNMzc5LjMzMSw5NjIuNjIxYy0xOS45MDMtMTMuMjAyLTM2LjUyOC0zMC43NzctNDguNjA0LTUxLjM4NGMt' +
      'MTEuNzAxLTIxLjU0Mi0xNy41MzMtNDUuNzgxLTE2LjkxMi03MC4yODgKCWMtMS4wNDItMzMuMTgxLDEwLjE1N' +
      'S02NS41ODYsMzEuNDYtOTEuMDQ1YzIyLjM4OC0yNS40OSw1MS4zMjYtNDQuMzY2LDgzLjY3OC01NC41ODFjMz' +
      'YuODcxLTEyLjEzNiw3NS40OS0xOC4xMTYsMTE0LjMwNC0xNy42OTkKCWM1MS4wNDMtMS44NjUsMTAyLjAxNSw' +
      '1LjI3MiwxNTAuNTgzLDIxLjA4MnYxMDYuNTY3Yy0yMS4xMDMtMTIuNzg0LTQ0LjA4OC0yMi4xNjYtNjguMTEt' +
      'MjcuOAoJYy0yNi4wNjUtNi4zOTItNTIuODEtOS41OTctNzkuNjQ3LTkuNTQ1Yy0yOC4zLTEuMDM5LTU2LjQxO' +
      'Sw0LjkxMy04MS44NzEsMTcuMzI5Yy0xOS42NSw4LjQ3NS0zMi4zOTIsMjcuODA3LTMyLjQzMyw0OS4yMDYKCW' +
      'MtMC4wOCwxMi45ODEsNC45MDcsMjUuNDgxLDEzLjksMzQuODQzYzEwLjYyMiwxMS4wMzcsMjMuMTg3LDIwLjA' +
      'yMSwzNy4wNjcsMjYuNTAzYzE1LjQ0NCw3LjY5MSwzOC42MTEsMTcuOTE2LDY5LjUsMzAuNjczCgljMy40MDEs' +
      'MS4wNzUsNi43MTYsMi40MDcsOS45MTUsMy45ODVjMzAuNDAxLDExLjg4MSw1OS43MjksMjYuMzQ0LDg3LjY2M' +
      'yw0My4yMjljMjEuMTU0LDEzLjA0MywzOC45MDgsMzAuOTI0LDUxLjgwMSw1Mi4xNzEKCWMxMy4yMTgsMjQuMD' +
      'g1LDE5LjYyNSw1MS4zMTUsMTguNTMzLDc4Ljc2N2MxLjUwOSwzNC4wNjYtOC45MTMsNjcuNTkxLTI5LjQ2OCw' +
      '5NC43OThjLTIwLjQ4OCwyNS4wMTItNDcuODgsNDMuNDQ2LTc4Ljc2Nyw1My4wMDUKCWMtMzYuMzI5LDExLjM4' +
      'Ny03NC4yNDUsMTYuODkyLTExMi4zMTIsMTYuMzA5Yy0zNC4xNTQsMC4xNTUtNjguMjU4LTIuNjM1LTEwMS45M' +
      'zMtOC4zNGMtMjguNDM0LTQuNjUzLTU2LjE4Mi0xMi44MDctODIuNjEyLTI0LjI3OQoJdi0xMTIuMzU4YzI1Lj' +
      'I2NCwxOC4wNDMsNTMuNDg5LDMxLjUyOSw4My40LDM5Ljg0N2MyOS44MSw5LjI4OSw2MC43OTgsMTQuMjUxLDk' +
      'yLjAxOCwxNC43MzRjMjguODk1LDEuODMsNTcuNzM5LTQuMjkxLDgzLjQtMTcuNjk5CgljMTcuOTc2LTEwLjE0' +
      'NCwyOC45MDktMjkuMzU4LDI4LjQ0OS00OS45OTRjMC4xMi0xNC4zNTktNS41Ni0yOC4xNTgtMTUuNzUzLTM4L' +
      'jI3MWMtMTIuNjc2LTEyLjQ0NC0yNy4zNTItMjIuNjcxLTQzLjQxNC0zMC4yNTYKCWMtMTguNTMzLTkuMjY3LT' +
      'Q1LjgyNC0yMS40ODMtODEuODcxLTM2LjY1QzQzMi42MTgsOTkzLjk1MSw0MDUuMTYxLDk3OS41OTQsMzc5LjM' +
      'zMSw5NjIuNjIxeiIvPgo8L3N2Zz4K',
    logo_file_name: 'sharepoint-logo.svg',
    logo_mime_type: 'image/svg+xml',
    rest: {
      url: 'https://graph.microsoft.com',
      data: 'json',
      oauth2_grant_type: 'authorization_code',
      oauth2_auth_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      oauth2_token_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      oauth2_scopes: [
        'openid',
        'email',
        'profile',
        'offline_access',
        'Sites.Manage.All',
        'Files.ReadWrite',
        'Sites.Read.All',
        'User.Read',
        'AllSites.Manage',
      ],
      ping_method: 'GET',
      ping_path: '/v1.0/me',
    },
  }) satisfies TQoreAppWithActions;
