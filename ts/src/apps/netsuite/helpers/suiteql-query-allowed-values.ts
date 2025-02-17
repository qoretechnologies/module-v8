import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const NetsuiteSuiteQLQueryAllowedValues = [
  {
    display_name: 'Get all accounts',
    value: 'SELECT * FROM account',
  },
  {
    display_name: 'Get all customers',
    value: 'SELECT * FROM customer',
  },
  {
    display_name: 'Get all invoices',
    value: `SELECT * FROM transaction WHERE type = 'CustInvc'`,
  },
  {
    display_name: 'Get all journal entries',
    value: `SELECT * FROM transaction WHERE type = 'Journal'`,
  },
  {
    display_name: 'Get all purchase orders',
    value: `SELECT * FROM transaction WHERE type = 'PurchOrd'`,
  },
  {
    display_name: 'Get all sales orders',
    value: `SELECT * FROM transaction  WHERE type = 'SalesOrd'`,
  },
  {
    display_name: 'Get all vendors',
    value: 'SELECT * FROM vendor',
  },
] satisfies IQoreAllowedValue[];
