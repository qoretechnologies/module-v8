import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { fetchNetsuiteAllowedValues } from './constants';

export const getNetsuiteRecordTypesAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const account_id = context?.conn_opts?.account_id;

  if (!token || !account_id) {
    throw new Error('The token and account_id are required to get NetSuite record types');
  }

  try {
    const customTypes = await fetchNetsuiteAllowedValues({
      account_id,
      token,
      mapItemToAllowedValue: (item: any): IQoreAllowedValue<string> => ({
        value: item.scriptid || `customrecord_${item.internalid}`,
        display_name: item.name,
        desc:
          `Custom record type\n\n` +
          `ID: ${item.internalid || 'N/A'}${item.scriptid ? `\n\nScript ID: ${item.scriptid}` : ''}`,
      }),
      query: 'SELECT internalid, name, scriptid FROM customrecordtype ORDER BY name',
    });

    return [...standardRecordTypes, ...customTypes] as IQoreAllowedValue<string>[];
  } catch (error) {
    return standardRecordTypes;
  }
};

const standardRecordTypes: IQoreAllowedValue<string>[] = [
  { value: 'accountingperiod', display_name: 'Accounting Period', desc: 'Standard record type' },
  { value: 'accountingbook', display_name: 'Accounting Book', desc: 'Standard record type' },
  { value: 'billingaccount', display_name: 'Billing Account', desc: 'Standard record type' },
  { value: 'billingschedule', display_name: 'Billing Schedule', desc: 'Standard record type' },
  { value: 'bin', display_name: 'Bin', desc: 'Standard record type' },
  { value: 'bom', display_name: 'Bill of Materials', desc: 'Standard record type' },
  { value: 'bomrevision', display_name: 'BOM Revision', desc: 'Standard record type' },
  { value: 'budget', display_name: 'Budget', desc: 'Standard record type' },
  { value: 'calendarevent', display_name: 'Calendar Event', desc: 'Standard record type' },
  { value: 'campaign', display_name: 'Campaign', desc: 'Standard record type' },
  { value: 'campaigncategory', display_name: 'Campaign Category', desc: 'Standard record type' },
  { value: 'campaignresponse', display_name: 'Campaign Response', desc: 'Standard record type' },
  { value: 'campaigntemplate', display_name: 'Campaign Template', desc: 'Standard record type' },
  { value: 'cashrefund', display_name: 'Cash Refund', desc: 'Standard record type' },
  { value: 'cashsale', display_name: 'Cash Sale', desc: 'Standard record type' },
  { value: 'charge', display_name: 'Charge', desc: 'Standard record type' },
  { value: 'check', display_name: 'Check', desc: 'Standard record type' },
  { value: 'classification', display_name: 'Classification', desc: 'Standard record type' },
  { value: 'contact', display_name: 'Contact', desc: 'Standard record type' },
  { value: 'contactcategory', display_name: 'Contact Category', desc: 'Standard record type' },
  { value: 'contactrole', display_name: 'Contact Role', desc: 'Standard record type' },
  { value: 'costcategory', display_name: 'Cost Category', desc: 'Standard record type' },
  { value: 'couponcode', display_name: 'Coupon Code', desc: 'Standard record type' },
  { value: 'creditmemo', display_name: 'Credit Memo', desc: 'Standard record type' },
  { value: 'currency', display_name: 'Currency', desc: 'Standard record type' },
  { value: 'customerpayment', display_name: 'Customer Payment', desc: 'Standard record type' },
  { value: 'customerdeposit', display_name: 'Customer Deposit', desc: 'Standard record type' },
  { value: 'customer', display_name: 'Customer', desc: 'Standard record type' },
  {
    value: 'customersubsidiaryrelationship',
    display_name: 'Customer-Subsidiary Relationship',
    desc: 'Standard record type',
  },
  { value: 'customercategory', display_name: 'Customer Category', desc: 'Standard record type' },
  { value: 'customerstatus', display_name: 'Customer Status', desc: 'Standard record type' },
  { value: 'customertype', display_name: 'Customer Type', desc: 'Standard record type' },
  { value: 'department', display_name: 'Department', desc: 'Standard record type' },
  { value: 'deposit', display_name: 'Deposit', desc: 'Standard record type' },
  {
    value: 'depositapplication',
    display_name: 'Deposit Application',
    desc: 'Standard record type',
  },
  { value: 'emailtemplate', display_name: 'Email Template', desc: 'Standard record type' },
  { value: 'employee', display_name: 'Employee', desc: 'Standard record type' },
  {
    value: 'entityaccountmapping',
    display_name: 'Entity Account Mapping',
    desc: 'Standard record type',
  },
  { value: 'estimate', display_name: 'Estimate', desc: 'Standard record type' },
  { value: 'expensecategory', display_name: 'Expense Category', desc: 'Standard record type' },
  { value: 'expensereport', display_name: 'Expense Report', desc: 'Standard record type' },
  {
    value: 'fairvaluepricemodel',
    display_name: 'Fair Value Price Model',
    desc: 'Standard record type',
  },
  { value: 'fairvalueprice', display_name: 'Fair Value Price', desc: 'Standard record type' },
  { value: 'file', display_name: 'File', desc: 'Standard record type' },
  { value: 'folder', display_name: 'Folder', desc: 'Standard record type' },
  { value: 'giftcertificate', display_name: 'Gift Certificate', desc: 'Standard record type' },
  {
    value: 'giftcertificateitem',
    display_name: 'Gift Certificate Item',
    desc: 'Standard record type',
  },
  {
    value: 'globalaccountmapping',
    display_name: 'Global Account Mapping',
    desc: 'Standard record type',
  },
  { value: 'goal', display_name: 'Goal', desc: 'Standard record type' },
  { value: 'inboundshipment', display_name: 'Inbound Shipment', desc: 'Standard record type' },
  {
    value: 'inventoryadjustment',
    display_name: 'Inventory Adjustment',
    desc: 'Standard record type',
  },
  { value: 'inventorynumber', display_name: 'Inventory Number', desc: 'Standard record type' },
  { value: 'inventorystatus', display_name: 'Inventory Status', desc: 'Standard record type' },
  { value: 'inventorytransfer', display_name: 'Inventory Transfer', desc: 'Standard record type' },
  { value: 'invoice', display_name: 'Invoice', desc: 'Standard record type' },
  { value: 'item', display_name: 'Item', desc: 'Standard record type' },
  {
    value: 'itemaccountmapping',
    display_name: 'Item Account Mapping',
    desc: 'Standard record type',
  },
  { value: 'itemdemandplan', display_name: 'Item Demand Plan', desc: 'Standard record type' },
  { value: 'itemfulfillment', display_name: 'Item Fulfillment', desc: 'Standard record type' },
  { value: 'itemgroup', display_name: 'Item Group', desc: 'Standard record type' },
  { value: 'itemreceipt', display_name: 'Item Receipt', desc: 'Standard record type' },
  { value: 'itemrevision', display_name: 'Item Revision', desc: 'Standard record type' },
  { value: 'itemsupplyplan', display_name: 'Item Supply Plan', desc: 'Standard record type' },
  { value: 'job', display_name: 'Job', desc: 'Standard record type' },
  { value: 'journalentry', display_name: 'Journal Entry', desc: 'Standard record type' },
  { value: 'kititem', display_name: 'Kit Item', desc: 'Standard record type' },
  { value: 'location', display_name: 'Location', desc: 'Standard record type' },
  {
    value: 'manufacturingcosttemplate',
    display_name: 'Manufacturing Cost Template',
    desc: 'Standard record type',
  },
  {
    value: 'manufacturingoperation',
    display_name: 'Manufacturing Operation',
    desc: 'Standard record type',
  },
  {
    value: 'manufacturingrouting',
    display_name: 'Manufacturing Routing',
    desc: 'Standard record type',
  },
  {
    value: 'merchandisehierarchynode',
    display_name: 'Merchandise Hierarchy Node',
    desc: 'Standard record type',
  },
  { value: 'nexus', display_name: 'Nexus', desc: 'Standard record type' },
  { value: 'note', display_name: 'Note', desc: 'Standard record type' },
  { value: 'noticetype', display_name: 'Notice Type', desc: 'Standard record type' },
  { value: 'opportunity', display_name: 'Opportunity', desc: 'Standard record type' },
  { value: 'paycheck', display_name: 'Paycheck', desc: 'Standard record type' },
  { value: 'paymentitem', display_name: 'Payment Item', desc: 'Standard record type' },
  { value: 'paymentmethod', display_name: 'Payment Method', desc: 'Standard record type' },
  { value: 'payroll', display_name: 'Payroll', desc: 'Standard record type' },
  { value: 'phonecall', display_name: 'Phone Call', desc: 'Standard record type' },
  { value: 'priceplan', display_name: 'Price Plan', desc: 'Standard record type' },
  { value: 'pricinggroup', display_name: 'Pricing Group', desc: 'Standard record type' },
  { value: 'projecttask', display_name: 'Project Task', desc: 'Standard record type' },
  { value: 'promotioncode', display_name: 'Promotion Code', desc: 'Standard record type' },
  { value: 'purchasecontract', display_name: 'Purchase Contract', desc: 'Standard record type' },
  { value: 'purchaseorder', display_name: 'Purchase Order', desc: 'Standard record type' },
  {
    value: 'purchaserequisition',
    display_name: 'Purchase Requisition',
    desc: 'Standard record type',
  },
  { value: 'reallocateitem', display_name: 'Reallocate Item', desc: 'Standard record type' },
  {
    value: 'resourceallocation',
    display_name: 'Resource Allocation',
    desc: 'Standard record type',
  },
  {
    value: 'returnauthorization',
    display_name: 'Return Authorization',
    desc: 'Standard record type',
  },
  { value: 'salesorder', display_name: 'Sales Order', desc: 'Standard record type' },
  { value: 'salesrole', display_name: 'Sales Role', desc: 'Standard record type' },
  { value: 'salestaxitem', display_name: 'Sales Tax Item', desc: 'Standard record type' },
  { value: 'serviceitem', display_name: 'Service Item', desc: 'Standard record type' },
  { value: 'solution', display_name: 'Solution', desc: 'Standard record type' },
  {
    value: 'statisticaljournal',
    display_name: 'Statistical Journal',
    desc: 'Standard record type',
  },
  {
    value: 'statisticaljournalentry',
    display_name: 'Statistical Journal Entry',
    desc: 'Standard record type',
  },
  { value: 'subscription', display_name: 'Subscription', desc: 'Standard record type' },
  { value: 'subscriptionplan', display_name: 'Subscription Plan', desc: 'Standard record type' },
  { value: 'subsidiary', display_name: 'Subsidiary', desc: 'Standard record type' },
  { value: 'subtotalitem', display_name: 'Subtotal Item', desc: 'Standard record type' },
  { value: 'supportcase', display_name: 'Support Case', desc: 'Standard record type' },
  { value: 'task', display_name: 'Task', desc: 'Standard record type' },
  { value: 'taxgroup', display_name: 'Tax Group', desc: 'Standard record type' },
  { value: 'taxperiod', display_name: 'Tax Period', desc: 'Standard record type' },
  { value: 'taxtype', display_name: 'Tax Type', desc: 'Standard record type' },
  { value: 'term', display_name: 'Term', desc: 'Standard record type' },
  { value: 'timebill', display_name: 'Time Bill', desc: 'Standard record type' },
  { value: 'timesheet', display_name: 'Timesheet', desc: 'Standard record type' },
  { value: 'topic', display_name: 'Topic', desc: 'Standard record type' },
  { value: 'transferorder', display_name: 'Transfer Order', desc: 'Standard record type' },
  { value: 'units', display_name: 'Units', desc: 'Standard record type' },
  { value: 'vendor', display_name: 'Vendor', desc: 'Standard record type' },
  { value: 'vendorbill', display_name: 'Vendor Bill', desc: 'Standard record type' },
  { value: 'vendorcategory', display_name: 'Vendor Category', desc: 'Standard record type' },
  { value: 'vendorcredit', display_name: 'Vendor Credit', desc: 'Standard record type' },
  { value: 'vendorpayment', display_name: 'Vendor Payment', desc: 'Standard record type' },
  {
    value: 'vendorreturnauthorization',
    display_name: 'Vendor Return Authorization',
    desc: 'Standard record type',
  },
  {
    value: 'vendorsubsidiaryrelationship',
    display_name: 'Vendor-Subsidiary Relationship',
    desc: 'Standard record type',
  },
  { value: 'winlossreason', display_name: 'Win/Loss Reason', desc: 'Standard record type' },
  { value: 'workorder', display_name: 'Work Order', desc: 'Standard record type' },
  { value: 'workorderissue', display_name: 'Work Order Issue', desc: 'Standard record type' },
  {
    value: 'workordercompletion',
    display_name: 'Work Order Completion',
    desc: 'Standard record type',
  },
] satisfies IQoreAllowedValue<string>[];
