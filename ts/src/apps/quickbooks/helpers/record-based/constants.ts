/**
 * QuickBooks Record-Based Constants
 *
 * Core definitions for entity types, field mappings, capabilities, and utilities
 * for record-based operations on QuickBooks Online entities.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';
import { EntityName } from 'quickbooks-node-promise';

/**
 * Custom error class for QuickBooks record-based operations
 */
export class QuickbooksRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuickbooksRecordError';
  }
}

/** Maximum number of batch items per QuickBooks batch API request */
export const BATCH_SIZE = 25;

/** Maximum number of results per QuickBooks query */
export const MAX_PAGE_SIZE = 1000;

/**
 * Supported QuickBooks entity types that can be used as "tables"
 * in the record-based interface.
 */
export const SUPPORTED_ENTITIES = [
  EntityName.Customer,
  EntityName.Vendor,
  EntityName.Invoice,
  EntityName.Bill,
  EntityName.Estimate,
  EntityName.Item,
  EntityName.Payment,
  EntityName.Account,
  EntityName.CreditMemo,
  EntityName.Deposit,
  EntityName.JournalEntry,
  EntityName.PurchaseOrder,
  EntityName.Purchase,
  EntityName.RefundReceipt,
  EntityName.SalesReceipt,
  EntityName.Employee,
  EntityName.BillPayment,
  EntityName.VendorCredit,
  EntityName.Transfer,
] as const;

export type SupportedEntity = (typeof SUPPORTED_ENTITIES)[number];

/**
 * CRUD capabilities per entity type.
 * Not all entities support all operations.
 */
export interface EntityCapabilities {
  create: boolean;
  update: boolean;
  delete: boolean;
  query: boolean;
}

export const ENTITY_CAPABILITIES: Record<SupportedEntity, EntityCapabilities> = {
  [EntityName.Customer]: { create: true, update: true, delete: false, query: true },
  [EntityName.Vendor]: { create: true, update: true, delete: false, query: true },
  [EntityName.Invoice]: { create: true, update: true, delete: true, query: true },
  [EntityName.Bill]: { create: true, update: true, delete: true, query: true },
  [EntityName.Estimate]: { create: true, update: true, delete: true, query: true },
  [EntityName.Item]: { create: true, update: true, delete: false, query: true },
  [EntityName.Payment]: { create: true, update: true, delete: true, query: true },
  [EntityName.Account]: { create: true, update: true, delete: false, query: true },
  [EntityName.CreditMemo]: { create: true, update: true, delete: true, query: true },
  [EntityName.Deposit]: { create: true, update: true, delete: true, query: true },
  [EntityName.JournalEntry]: { create: true, update: true, delete: true, query: true },
  [EntityName.PurchaseOrder]: { create: true, update: true, delete: true, query: true },
  [EntityName.Purchase]: { create: true, update: true, delete: true, query: true },
  [EntityName.RefundReceipt]: { create: true, update: true, delete: true, query: true },
  [EntityName.SalesReceipt]: { create: true, update: true, delete: true, query: true },
  [EntityName.Employee]: { create: true, update: true, delete: false, query: true },
  [EntityName.BillPayment]: { create: true, update: true, delete: true, query: true },
  [EntityName.VendorCredit]: { create: true, update: true, delete: true, query: true },
  [EntityName.Transfer]: { create: true, update: true, delete: true, query: true },
};

// ---- Common field definition types ----

type FieldDef = { type: string | object; desc: string };
type FieldDefsMap = Record<string, FieldDef>;

const REF_TYPE = {
  type: 'hash',
  fields: {
    value: { type: 'string' },
    name: { type: 'string' },
  },
};

const METADATA_TYPE = {
  type: 'hash',
  fields: {
    CreateTime: { type: 'string', desc: 'Creation timestamp' },
    LastUpdatedTime: { type: 'string', desc: 'Last update timestamp' },
  },
};

const ADDRESS_TYPE = {
  type: 'hash',
  fields: {
    Id: { type: 'string' },
    Line1: { type: 'string' },
    Line2: { type: 'string' },
    City: { type: 'string' },
    CountrySubDivisionCode: { type: 'string' },
    PostalCode: { type: 'string' },
    Lat: { type: 'string' },
    Long: { type: 'string' },
  },
};

const COMMON_FIELDS: FieldDefsMap = {
  Id: { type: 'string', desc: 'Unique identifier' },
  SyncToken: { type: 'string', desc: 'Version token for optimistic concurrency' },
  MetaData: { type: METADATA_TYPE, desc: 'Entity metadata' },
  domain: { type: 'string', desc: 'Domain' },
  sparse: { type: 'bool', desc: 'Sparse update flag' },
};

const TRANSACTION_COMMON_FIELDS: FieldDefsMap = {
  ...COMMON_FIELDS,
  DocNumber: { type: 'string', desc: 'Document number' },
  TxnDate: { type: 'string', desc: 'Transaction date' },
  PrivateNote: { type: 'string', desc: 'Private note' },
  TotalAmt: { type: 'number', desc: 'Total amount' },
  CurrencyRef: { type: REF_TYPE, desc: 'Currency reference' },
  LinkedTxn: { type: { type: 'list', element_type: { type: 'hash', fields: { TxnId: { type: 'string' }, TxnType: { type: 'string' } } } }, desc: 'Linked transactions' },
  Line: { type: { type: 'list', element_type: 'any' }, desc: 'Line items' },
};

// ---- Entity-specific field definitions ----

const CUSTOMER_FIELDS: FieldDefsMap = {
  ...COMMON_FIELDS,
  DisplayName: { type: 'string', desc: 'Customer display name' },
  GivenName: { type: 'string', desc: 'First name' },
  FamilyName: { type: 'string', desc: 'Last name' },
  FullyQualifiedName: { type: 'string', desc: 'Fully qualified name' },
  CompanyName: { type: 'string', desc: 'Company name' },
  PrintOnCheckName: { type: 'string', desc: 'Print on check name' },
  Active: { type: 'bool', desc: 'Active status' },
  Taxable: { type: 'bool', desc: 'Taxable flag' },
  Job: { type: 'bool', desc: 'Is a sub-customer (job)' },
  BillWithParent: { type: 'bool', desc: 'Bill with parent' },
  Balance: { type: 'number', desc: 'Outstanding balance' },
  BalanceWithJobs: { type: 'number', desc: 'Balance including sub-customers' },
  PreferredDeliveryMethod: { type: 'string', desc: 'Preferred delivery method' },
  IsProject: { type: 'bool', desc: 'Is a project' },
  BillAddr: { type: ADDRESS_TYPE, desc: 'Billing address' },
  ShipAddr: { type: ADDRESS_TYPE, desc: 'Shipping address' },
  PrimaryPhone: { type: { type: 'hash', fields: { FreeFormNumber: { type: 'string' } } }, desc: 'Primary phone' },
  PrimaryEmailAddr: { type: { type: 'hash', fields: { Address: { type: 'string' } } }, desc: 'Primary email' },
};

const VENDOR_FIELDS: FieldDefsMap = {
  ...COMMON_FIELDS,
  DisplayName: { type: 'string', desc: 'Vendor display name' },
  GivenName: { type: 'string', desc: 'First name' },
  FamilyName: { type: 'string', desc: 'Last name' },
  CompanyName: { type: 'string', desc: 'Company name' },
  PrintOnCheckName: { type: 'string', desc: 'Print on check name' },
  Active: { type: 'bool', desc: 'Active status' },
  Balance: { type: 'number', desc: 'Outstanding balance' },
  Vendor1099: { type: 'bool', desc: '1099 vendor' },
  BillAddr: { type: ADDRESS_TYPE, desc: 'Billing address' },
  PrimaryPhone: { type: { type: 'hash', fields: { FreeFormNumber: { type: 'string' } } }, desc: 'Primary phone' },
  PrimaryEmailAddr: { type: { type: 'hash', fields: { Address: { type: 'string' } } }, desc: 'Primary email' },
  WebAddr: { type: { type: 'hash', fields: { URI: { type: 'string' } } }, desc: 'Website URL' },
  AcctNum: { type: 'string', desc: 'Account number' },
  TaxIdentifier: { type: 'string', desc: 'Tax identifier' },
};

const INVOICE_FIELDS: FieldDefsMap = {
  ...TRANSACTION_COMMON_FIELDS,
  CustomerRef: { type: REF_TYPE, desc: 'Customer reference' },
  CustomerMemo: { type: { type: 'hash', fields: { value: { type: 'string' } } }, desc: 'Customer memo' },
  BillAddr: { type: ADDRESS_TYPE, desc: 'Billing address' },
  ShipAddr: { type: ADDRESS_TYPE, desc: 'Shipping address' },
  DueDate: { type: 'string', desc: 'Due date' },
  Balance: { type: 'number', desc: 'Balance due' },
  AllowIPNPayment: { type: 'bool', desc: 'Allow IPN payment' },
  AllowOnlinePayment: { type: 'bool', desc: 'Allow online payment' },
  AllowOnlineCreditCardPayment: { type: 'bool', desc: 'Allow online credit card payment' },
  AllowOnlineACHPayment: { type: 'bool', desc: 'Allow online ACH payment' },
  PrintStatus: { type: 'string', desc: 'Print status' },
  EmailStatus: { type: 'string', desc: 'Email status' },
  BillEmail: { type: { type: 'hash', fields: { Address: { type: 'string' } } }, desc: 'Billing email' },
  SalesTermRef: { type: REF_TYPE, desc: 'Sales term reference' },
  FreeFormAddress: { type: 'bool', desc: 'Free form address flag' },
  ApplyTaxAfterDiscount: { type: 'bool', desc: 'Apply tax after discount' },
};

const BILL_FIELDS: FieldDefsMap = {
  ...TRANSACTION_COMMON_FIELDS,
  VendorRef: { type: REF_TYPE, desc: 'Vendor reference' },
  APAccountRef: { type: REF_TYPE, desc: 'Accounts payable account reference' },
  DueDate: { type: 'string', desc: 'Due date' },
  Balance: { type: 'number', desc: 'Balance due' },
  VendorAddr: { type: ADDRESS_TYPE, desc: 'Vendor address' },
};

const ESTIMATE_FIELDS: FieldDefsMap = {
  ...TRANSACTION_COMMON_FIELDS,
  CustomerRef: { type: REF_TYPE, desc: 'Customer reference' },
  BillAddr: { type: ADDRESS_TYPE, desc: 'Billing address' },
  ShipAddr: { type: ADDRESS_TYPE, desc: 'Shipping address' },
  DueDate: { type: 'string', desc: 'Due date' },
  ExpirationDate: { type: 'string', desc: 'Expiration date' },
  TxnStatus: { type: 'string', desc: 'Transaction status' },
  PrintStatus: { type: 'string', desc: 'Print status' },
  EmailStatus: { type: 'string', desc: 'Email status' },
  BillEmail: { type: { type: 'hash', fields: { Address: { type: 'string' } } }, desc: 'Billing email' },
  AcceptedBy: { type: 'string', desc: 'Accepted by' },
  AcceptedDate: { type: 'string', desc: 'Accepted date' },
};

const ITEM_FIELDS: FieldDefsMap = {
  ...COMMON_FIELDS,
  Name: { type: 'string', desc: 'Item name' },
  Active: { type: 'bool', desc: 'Active status' },
  Type: { type: 'string', desc: 'Item type (Inventory, Service, NonInventory)' },
  Description: { type: 'string', desc: 'Item description' },
  UnitPrice: { type: 'number', desc: 'Unit price' },
  PurchaseDesc: { type: 'string', desc: 'Purchase description' },
  PurchaseCost: { type: 'number', desc: 'Purchase cost' },
  QtyOnHand: { type: 'number', desc: 'Quantity on hand' },
  Taxable: { type: 'bool', desc: 'Taxable flag' },
  IncomeAccountRef: { type: REF_TYPE, desc: 'Income account reference' },
  ExpenseAccountRef: { type: REF_TYPE, desc: 'Expense account reference' },
  AssetAccountRef: { type: REF_TYPE, desc: 'Asset account reference' },
  InvStartDate: { type: 'string', desc: 'Inventory start date' },
  TrackQtyOnHand: { type: 'bool', desc: 'Track quantity on hand' },
  FullyQualifiedName: { type: 'string', desc: 'Fully qualified name' },
};

const PAYMENT_FIELDS: FieldDefsMap = {
  ...COMMON_FIELDS,
  CustomerRef: { type: REF_TYPE, desc: 'Customer reference' },
  TotalAmt: { type: 'number', desc: 'Total amount' },
  TxnDate: { type: 'string', desc: 'Transaction date' },
  CurrencyRef: { type: REF_TYPE, desc: 'Currency reference' },
  PrivateNote: { type: 'string', desc: 'Private note' },
  PaymentMethodRef: { type: REF_TYPE, desc: 'Payment method reference' },
  DepositToAccountRef: { type: REF_TYPE, desc: 'Deposit to account reference' },
  UnappliedAmt: { type: 'number', desc: 'Unapplied amount' },
  ProcessPayment: { type: 'bool', desc: 'Process payment flag' },
  Line: { type: { type: 'list', element_type: 'any' }, desc: 'Line items' },
};

const ACCOUNT_FIELDS: FieldDefsMap = {
  ...COMMON_FIELDS,
  Name: { type: 'string', desc: 'Account name' },
  Active: { type: 'bool', desc: 'Active status' },
  AccountType: { type: 'string', desc: 'Account type' },
  AccountSubType: { type: 'string', desc: 'Account sub-type' },
  Classification: { type: 'string', desc: 'Classification (Asset, Equity, Expense, Liability, Revenue)' },
  CurrentBalance: { type: 'number', desc: 'Current balance' },
  CurrentBalanceWithSubAccounts: { type: 'number', desc: 'Current balance with sub-accounts' },
  FullyQualifiedName: { type: 'string', desc: 'Fully qualified name' },
  Description: { type: 'string', desc: 'Account description' },
  AcctNum: { type: 'string', desc: 'Account number' },
  CurrencyRef: { type: REF_TYPE, desc: 'Currency reference' },
};

const CREDIT_MEMO_FIELDS: FieldDefsMap = {
  ...TRANSACTION_COMMON_FIELDS,
  CustomerRef: { type: REF_TYPE, desc: 'Customer reference' },
  BillAddr: { type: ADDRESS_TYPE, desc: 'Billing address' },
  Balance: { type: 'number', desc: 'Remaining balance' },
  RemainingCredit: { type: 'number', desc: 'Remaining credit' },
  PrintStatus: { type: 'string', desc: 'Print status' },
  EmailStatus: { type: 'string', desc: 'Email status' },
  BillEmail: { type: { type: 'hash', fields: { Address: { type: 'string' } } }, desc: 'Billing email' },
};

const DEPOSIT_FIELDS: FieldDefsMap = {
  ...TRANSACTION_COMMON_FIELDS,
  DepositToAccountRef: { type: REF_TYPE, desc: 'Deposit to account reference' },
};

const JOURNAL_ENTRY_FIELDS: FieldDefsMap = {
  ...TRANSACTION_COMMON_FIELDS,
  Adjustment: { type: 'bool', desc: 'Adjustment flag' },
};

const PURCHASE_ORDER_FIELDS: FieldDefsMap = {
  ...TRANSACTION_COMMON_FIELDS,
  VendorRef: { type: REF_TYPE, desc: 'Vendor reference' },
  APAccountRef: { type: REF_TYPE, desc: 'Accounts payable account reference' },
  VendorAddr: { type: ADDRESS_TYPE, desc: 'Vendor address' },
  ShipAddr: { type: ADDRESS_TYPE, desc: 'Shipping address' },
  DueDate: { type: 'string', desc: 'Due date' },
  POStatus: { type: 'string', desc: 'Purchase order status' },
  POEmail: { type: { type: 'hash', fields: { Address: { type: 'string' } } }, desc: 'Purchase order email' },
};

const PURCHASE_FIELDS: FieldDefsMap = {
  ...TRANSACTION_COMMON_FIELDS,
  AccountRef: { type: REF_TYPE, desc: 'Account reference' },
  PaymentType: { type: 'string', desc: 'Payment type (Cash, Check, CreditCard)' },
  EntityRef: { type: REF_TYPE, desc: 'Entity reference (vendor, customer, or employee)' },
  Credit: { type: 'bool', desc: 'Credit flag' },
};

const REFUND_RECEIPT_FIELDS: FieldDefsMap = {
  ...TRANSACTION_COMMON_FIELDS,
  CustomerRef: { type: REF_TYPE, desc: 'Customer reference' },
  DepositToAccountRef: { type: REF_TYPE, desc: 'Deposit to account reference' },
  BillAddr: { type: ADDRESS_TYPE, desc: 'Billing address' },
  Balance: { type: 'number', desc: 'Balance' },
  PrintStatus: { type: 'string', desc: 'Print status' },
  PaymentMethodRef: { type: REF_TYPE, desc: 'Payment method reference' },
};

const SALES_RECEIPT_FIELDS: FieldDefsMap = {
  ...TRANSACTION_COMMON_FIELDS,
  CustomerRef: { type: REF_TYPE, desc: 'Customer reference' },
  DepositToAccountRef: { type: REF_TYPE, desc: 'Deposit to account reference' },
  BillAddr: { type: ADDRESS_TYPE, desc: 'Billing address' },
  ShipAddr: { type: ADDRESS_TYPE, desc: 'Shipping address' },
  Balance: { type: 'number', desc: 'Balance' },
  PrintStatus: { type: 'string', desc: 'Print status' },
  EmailStatus: { type: 'string', desc: 'Email status' },
  PaymentMethodRef: { type: REF_TYPE, desc: 'Payment method reference' },
  BillEmail: { type: { type: 'hash', fields: { Address: { type: 'string' } } }, desc: 'Billing email' },
};

const EMPLOYEE_FIELDS: FieldDefsMap = {
  ...COMMON_FIELDS,
  DisplayName: { type: 'string', desc: 'Employee display name' },
  GivenName: { type: 'string', desc: 'First name' },
  FamilyName: { type: 'string', desc: 'Last name' },
  PrintOnCheckName: { type: 'string', desc: 'Print on check name' },
  Active: { type: 'bool', desc: 'Active status' },
  PrimaryPhone: { type: { type: 'hash', fields: { FreeFormNumber: { type: 'string' } } }, desc: 'Primary phone' },
  PrimaryEmailAddr: { type: { type: 'hash', fields: { Address: { type: 'string' } } }, desc: 'Primary email' },
  PrimaryAddr: { type: ADDRESS_TYPE, desc: 'Primary address' },
  SSN: { type: 'string', desc: 'Social security number (last 4 digits only)' },
  BillableTime: { type: 'bool', desc: 'Billable time' },
  HiredDate: { type: 'string', desc: 'Hire date' },
  ReleasedDate: { type: 'string', desc: 'Release date' },
};

const BILL_PAYMENT_FIELDS: FieldDefsMap = {
  ...COMMON_FIELDS,
  VendorRef: { type: REF_TYPE, desc: 'Vendor reference' },
  TotalAmt: { type: 'number', desc: 'Total amount' },
  TxnDate: { type: 'string', desc: 'Transaction date' },
  CurrencyRef: { type: REF_TYPE, desc: 'Currency reference' },
  PrivateNote: { type: 'string', desc: 'Private note' },
  PayType: { type: 'string', desc: 'Payment type (Check, CreditCard)' },
  APAccountRef: { type: REF_TYPE, desc: 'Accounts payable account reference' },
  Line: { type: { type: 'list', element_type: 'any' }, desc: 'Line items' },
};

const VENDOR_CREDIT_FIELDS: FieldDefsMap = {
  ...TRANSACTION_COMMON_FIELDS,
  VendorRef: { type: REF_TYPE, desc: 'Vendor reference' },
  APAccountRef: { type: REF_TYPE, desc: 'Accounts payable account reference' },
  Balance: { type: 'number', desc: 'Balance' },
};

const TRANSFER_FIELDS: FieldDefsMap = {
  ...COMMON_FIELDS,
  FromAccountRef: { type: REF_TYPE, desc: 'From account reference' },
  ToAccountRef: { type: REF_TYPE, desc: 'To account reference' },
  Amount: { type: 'number', desc: 'Transfer amount' },
  TxnDate: { type: 'string', desc: 'Transaction date' },
  PrivateNote: { type: 'string', desc: 'Private note' },
  CurrencyRef: { type: REF_TYPE, desc: 'Currency reference' },
};

/**
 * Map of entity types to their field definitions.
 * Used by get-record-type to return schemas.
 */
export const ENTITY_FIELD_DEFINITIONS: Record<SupportedEntity, FieldDefsMap> = {
  [EntityName.Customer]: CUSTOMER_FIELDS,
  [EntityName.Vendor]: VENDOR_FIELDS,
  [EntityName.Invoice]: INVOICE_FIELDS,
  [EntityName.Bill]: BILL_FIELDS,
  [EntityName.Estimate]: ESTIMATE_FIELDS,
  [EntityName.Item]: ITEM_FIELDS,
  [EntityName.Payment]: PAYMENT_FIELDS,
  [EntityName.Account]: ACCOUNT_FIELDS,
  [EntityName.CreditMemo]: CREDIT_MEMO_FIELDS,
  [EntityName.Deposit]: DEPOSIT_FIELDS,
  [EntityName.JournalEntry]: JOURNAL_ENTRY_FIELDS,
  [EntityName.PurchaseOrder]: PURCHASE_ORDER_FIELDS,
  [EntityName.Purchase]: PURCHASE_FIELDS,
  [EntityName.RefundReceipt]: REFUND_RECEIPT_FIELDS,
  [EntityName.SalesReceipt]: SALES_RECEIPT_FIELDS,
  [EntityName.Employee]: EMPLOYEE_FIELDS,
  [EntityName.BillPayment]: BILL_PAYMENT_FIELDS,
  [EntityName.VendorCredit]: VENDOR_CREDIT_FIELDS,
  [EntityName.Transfer]: TRANSFER_FIELDS,
};

/**
 * Sortable fields per entity type (fields that support ORDER BY in QB queries).
 */
export const SORTABLE_FIELDS: Record<SupportedEntity, IQoreAllowedValue<string>[]> = {
  [EntityName.Customer]: [
    { value: 'DisplayName', display_name: 'Display Name' },
    { value: 'GivenName', display_name: 'Given Name' },
    { value: 'FamilyName', display_name: 'Family Name' },
    { value: 'Balance', display_name: 'Balance' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.Vendor]: [
    { value: 'DisplayName', display_name: 'Display Name' },
    { value: 'GivenName', display_name: 'Given Name' },
    { value: 'FamilyName', display_name: 'Family Name' },
    { value: 'Balance', display_name: 'Balance' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.Invoice]: [
    { value: 'DocNumber', display_name: 'Document Number' },
    { value: 'TxnDate', display_name: 'Transaction Date' },
    { value: 'DueDate', display_name: 'Due Date' },
    { value: 'TotalAmt', display_name: 'Total Amount' },
    { value: 'Balance', display_name: 'Balance' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.Bill]: [
    { value: 'DocNumber', display_name: 'Document Number' },
    { value: 'TxnDate', display_name: 'Transaction Date' },
    { value: 'DueDate', display_name: 'Due Date' },
    { value: 'TotalAmt', display_name: 'Total Amount' },
    { value: 'Balance', display_name: 'Balance' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.Estimate]: [
    { value: 'DocNumber', display_name: 'Document Number' },
    { value: 'TxnDate', display_name: 'Transaction Date' },
    { value: 'TotalAmt', display_name: 'Total Amount' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.Item]: [
    { value: 'Name', display_name: 'Item Name' },
    { value: 'Type', display_name: 'Item Type' },
    { value: 'UnitPrice', display_name: 'Unit Price' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.Payment]: [
    { value: 'TxnDate', display_name: 'Transaction Date' },
    { value: 'TotalAmt', display_name: 'Total Amount' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.Account]: [
    { value: 'Name', display_name: 'Account Name' },
    { value: 'AccountType', display_name: 'Account Type' },
    { value: 'CurrentBalance', display_name: 'Current Balance' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.CreditMemo]: [
    { value: 'DocNumber', display_name: 'Document Number' },
    { value: 'TxnDate', display_name: 'Transaction Date' },
    { value: 'TotalAmt', display_name: 'Total Amount' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.Deposit]: [
    { value: 'TxnDate', display_name: 'Transaction Date' },
    { value: 'TotalAmt', display_name: 'Total Amount' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.JournalEntry]: [
    { value: 'DocNumber', display_name: 'Document Number' },
    { value: 'TxnDate', display_name: 'Transaction Date' },
    { value: 'TotalAmt', display_name: 'Total Amount' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.PurchaseOrder]: [
    { value: 'DocNumber', display_name: 'Document Number' },
    { value: 'TxnDate', display_name: 'Transaction Date' },
    { value: 'TotalAmt', display_name: 'Total Amount' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.Purchase]: [
    { value: 'TxnDate', display_name: 'Transaction Date' },
    { value: 'TotalAmt', display_name: 'Total Amount' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.RefundReceipt]: [
    { value: 'DocNumber', display_name: 'Document Number' },
    { value: 'TxnDate', display_name: 'Transaction Date' },
    { value: 'TotalAmt', display_name: 'Total Amount' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.SalesReceipt]: [
    { value: 'DocNumber', display_name: 'Document Number' },
    { value: 'TxnDate', display_name: 'Transaction Date' },
    { value: 'TotalAmt', display_name: 'Total Amount' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.Employee]: [
    { value: 'DisplayName', display_name: 'Display Name' },
    { value: 'GivenName', display_name: 'Given Name' },
    { value: 'FamilyName', display_name: 'Family Name' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.BillPayment]: [
    { value: 'TxnDate', display_name: 'Transaction Date' },
    { value: 'TotalAmt', display_name: 'Total Amount' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.VendorCredit]: [
    { value: 'DocNumber', display_name: 'Document Number' },
    { value: 'TxnDate', display_name: 'Transaction Date' },
    { value: 'TotalAmt', display_name: 'Total Amount' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
  [EntityName.Transfer]: [
    { value: 'TxnDate', display_name: 'Transaction Date' },
    { value: 'Amount', display_name: 'Amount' },
    { value: 'MetaData.CreateTime', display_name: 'Create Time' },
    { value: 'MetaData.LastUpdatedTime', display_name: 'Last Updated Time' },
  ],
};

/**
 * Overrides for entities whose find method doesn't follow the simple "s" suffix pattern.
 */
const FIND_METHOD_OVERRIDES: Record<string, string> = {
  JournalEntry: 'findJournalEntries',
};

/**
 * Get the dynamic find method name for a given entity type.
 * QuickBooks library exposes find{PluralEntityName}() for each entity.
 */
export const getFindMethodName = (entityName: string): string => {
  return FIND_METHOD_OVERRIDES[entityName] || `find${entityName}s`;
};

/**
 * Extract entity array from QueryResponse.
 * The response key matches the entity name.
 */
export const getEntityFromQueryResponse = (response: Record<string, unknown>, entityName: string): unknown[] => {
  const queryResponse = response?.QueryResponse as Record<string, unknown> | undefined;
  if (!queryResponse) {
    return [];
  }
  return (queryResponse[entityName] as unknown[]) || [];
};

/**
 * Validate that a table name is a supported entity.
 */
export const validateEntityType = (tableName: string): SupportedEntity => {
  if (!SUPPORTED_ENTITIES.includes(tableName as SupportedEntity)) {
    throw new QuickbooksRecordError(`Unsupported entity type: ${tableName}`);
  }
  return tableName as SupportedEntity;
};
