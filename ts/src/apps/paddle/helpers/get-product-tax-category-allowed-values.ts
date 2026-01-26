/* eslint-disable max-len */
import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PaddleTaxCategoryAllowedValues = [
  {
    value: 'digital-goods',
    display_name: 'Digital Goods',
    desc: 'Non-customizable digital files or media (not software) acquired with an up front payment that can be accessed without any physical product being delivered.',
  },
  {
    value: 'ebooks',
    display_name: 'E-books',
    desc: 'Digital books and educational material which is sold with permanent rights for use by the customer.',
  },
  {
    value: 'implementation-services',
    display_name: 'Implementation Services',
    desc: 'Remote configuration, set-up, and integrating software on behalf of a customer.',
  },
  {
    value: 'professional-services',
    display_name: 'Professional Services',
    desc: 'Services that involve the application of your expertise and specialized knowledge of a software product.',
  },
  {
    value: 'saas',
    display_name: 'SaaS',
    desc: 'Products that allow users to connect to and use online or cloud-based applications over the Internet.',
  },
  {
    value: 'software-programming-services',
    display_name: 'Software Programming Services',
    desc: 'Services that can be used to customize and white label software products.',
  },
  {
    value: 'standard',
    display_name: 'Standard',
    desc: 'Software products that are pre-written and can be downloaded and installed onto a local device.',
  },
  {
    value: 'training-services',
    display_name: 'Training Services',
    desc: 'Training and education services related to software products.',
  },
  {
    value: 'website-hosting',
    display_name: 'Website Hosting',
    desc: 'Cloud storage service for personal or corporate information, assets, or intellectual property.',
  },
] satisfies IQoreAllowedValue<string>[];
