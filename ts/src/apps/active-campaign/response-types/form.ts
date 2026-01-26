import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const FormActionType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    email: { type: 'string' },
    fromname: { type: 'string' },
    fromemail: { type: 'string' },
    subject: { type: 'string' },
    list: { type: 'string' },
  },
} satisfies TQoreResponseType;

const FormActionDataType = {
  type: 'hash',
  fields: {
    actions: {
      type: {
        type: 'list',
        element_type: FormActionType,
      },
    },
  },
} satisfies TQoreResponseType;

const FormSubmitDataType = {
  type: 'hash',
  fields: {
    url: { type: 'string' },
  },
} satisfies TQoreResponseType;

const FormBorderType = {
  type: 'hash',
  fields: {
    width: { type: 'number' },
    style: { type: 'string' },
    color: { type: 'string' },
    radius: { type: 'number' },
  },
} satisfies TQoreResponseType;

const FormButtonStyleType = {
  type: 'hash',
  fields: {
    padding: { type: 'number' },
    background: { type: 'string' },
    fontcolor: { type: 'string' },
    border: { type: FormBorderType },
  },
} satisfies TQoreResponseType;

const FormStyleType = {
  type: 'hash',
  fields: {
    background: { type: 'string' },
    dark: { type: 'bool' },
    fontcolor: { type: 'string' },
    layout: { type: 'string' },
    border: { type: FormBorderType },
    width: { type: 'number' },
    ac_branding: { type: 'bool' },
    button: { type: FormButtonStyleType },
    customcss: { type: 'string' },
  },
} satisfies TQoreResponseType;

const FormOptionsType = {
  type: 'hash',
  fields: {
    blanks_overwrite: { type: 'bool' },
    confaction: { type: 'string' },
    sendoptin: { type: 'bool' },
    optin_id: { type: 'number' },
    optin_created: { type: 'bool' },
    confform: { type: 'string' },
  },
} satisfies TQoreResponseType;

const FormFieldType = {
  type: 'hash',
  fields: {
    type: { type: 'string' },
    header: { type: 'string' },
    class: { type: 'string' },
    required_options: { type: 'hash' },
    html: { type: 'string' },
    default_text: { type: 'string' },
    required: { type: 'bool' },
    id: { type: 'string' },
  },
} satisfies TQoreResponseType;

const FormLinksType = {
  type: 'hash',
  fields: {
    address: { type: 'string' },
  },
} satisfies TQoreResponseType;

export const FormResponseType = {
  type: 'hash',
  fields: {
    name: { type: 'string' },
    action: { type: 'string' },
    actiondata: { type: FormActionDataType },
    submit: { type: 'string' },
    submitdata: { type: FormSubmitDataType },
    url: { type: 'string' },
    layout: { type: 'string' },
    title: { type: 'string' },
    body: { type: 'string' },
    button: { type: 'string' },
    thanks: { type: 'string' },
    style: { type: FormStyleType },
    options: { type: FormOptionsType },
    cfields: {
      type: {
        type: 'list',
        element_type: FormFieldType,
      },
    },
    parentformid: { type: 'string' },
    userid: { type: 'string' },
    addressid: { type: 'string' },
    cdate: { type: 'string' },
    udate: { type: 'string' },
    entries: { type: 'string' },
    aid: { type: 'string' },
    defaultscreenshot: { type: 'string' },
    recent: {
      type: {
        type: 'list',
        element_type: { type: 'hash' },
      },
    },
    contacts: { type: 'number' },
    deals: { type: 'number' },
    links: { type: FormLinksType },
    id: { type: 'string' },
    address: { type: 'string' },
  },
} satisfies TQoreResponseType;
