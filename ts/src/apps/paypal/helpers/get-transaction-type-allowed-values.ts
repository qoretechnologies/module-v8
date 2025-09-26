import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PayPalTransactionTypeAllowedValues = [
  {
    value: 'T0000',
    display_name: 'General Payment',
    desc: 'General: received payment of a type not belonging to the other T00nn categories.',
  },
  { value: 'T0001', display_name: 'MassPay Payment', desc: 'MassPay payment.' },
  {
    value: 'T0002',
    display_name: 'Subscription Payment',
    desc: 'Subscription payment. Either payment sent or payment received.',
  },
  {
    value: 'T0003',
    display_name: 'Pre-approved Payment',
    desc: 'Pre-approved payment (BillUser API). Either sent or received.',
  },
  { value: 'T0004', display_name: 'eBay Auction Payment', desc: 'eBay auction payment.' },
  { value: 'T0005', display_name: 'Direct Payment API', desc: 'Direct payment API.' },
  { value: 'T0006', display_name: 'PayPal Checkout APIs', desc: 'PayPal Checkout APIs.' },
  {
    value: 'T0007',
    display_name: 'Website Payments Standard',
    desc: 'Website payments standard payment.',
  },
  { value: 'T0008', display_name: 'Postage Payment', desc: 'Postage payment to carrier.' },
  {
    value: 'T0009',
    display_name: 'Gift Certificate Payment',
    desc: 'Gift certificate payment. Purchase of gift certificate.',
  },
  {
    value: 'T0010',
    display_name: 'Third-party Auction Payment',
    desc: 'Third-party auction payment.',
  },
  {
    value: 'T0011',
    display_name: 'Mobile Payment',
    desc: 'Mobile payment, made through a mobile phone.',
  },
  { value: 'T0012', display_name: 'Virtual Terminal Payment', desc: 'Virtual terminal payment.' },
  { value: 'T0013', display_name: 'Donation Payment', desc: 'Donation payment.' },
  { value: 'T0014', display_name: 'Rebate Payments', desc: 'Rebate payments.' },
  { value: 'T0015', display_name: 'Third-party Payout', desc: 'Third-party payout.' },
  { value: 'T0016', display_name: 'Third-party Recoupment', desc: 'Third-party recoupment.' },
  { value: 'T0017', display_name: 'Store-to-store Transfers', desc: 'Store-to-store transfers.' },
  { value: 'T0018', display_name: 'PayPal Here Payment', desc: 'PayPal Here payment.' },
  {
    value: 'T0019',
    display_name: 'Generic Instrument-funded Payment',
    desc: 'Generic instrument-funded payment.',
  },
  { value: 'T0021', display_name: 'Cryptocurrency Payment', desc: 'Cryptocurrency payment.' },

  {
    value: 'T0100',
    display_name: 'General Non-payment Fee',
    desc: 'General non-payment fee of a type not belonging to the other T01nn categories.',
  },
  {
    value: 'T0101',
    display_name: 'Website Payments Pro Fee',
    desc: 'Website payments. Pro account monthly fee.',
  },
  {
    value: 'T0102',
    display_name: 'Foreign Bank Withdrawal Fee',
    desc: 'Foreign bank withdrawal fee.',
  },
  {
    value: 'T0103',
    display_name: 'WorldLink Check Withdrawal Fee',
    desc: 'WorldLink check withdrawal fee.',
  },
  { value: 'T0104', display_name: 'Mass Payment Batch Fee', desc: 'Mass payment batch fee.' },
  { value: 'T0105', display_name: 'Check Withdrawal', desc: 'Check withdrawal.' },
  { value: 'T0106', display_name: 'Chargeback Processing Fee', desc: 'Chargeback processing fee.' },
  { value: 'T0107', display_name: 'Payment Fee', desc: 'Payment fee.' },
  { value: 'T0108', display_name: 'ATM Withdrawal', desc: 'ATM withdrawal.' },
  { value: 'T0109', display_name: 'Auto-sweep from Account', desc: 'Auto-sweep from account.' },
  {
    value: 'T0110',
    display_name: 'International Credit Card Withdrawal',
    desc: 'International credit card withdrawal.',
  },
  { value: 'T0111', display_name: 'Warranty Fee', desc: 'Warranty fee for warranty purchase.' },
  {
    value: 'T0112',
    display_name: 'Gift Certificate Expiration Fee',
    desc: 'Gift certificate expiration fee.',
  },
  { value: 'T0113', display_name: 'Partner Fee', desc: 'Partner fee.' },
  { value: 'T0114', display_name: 'Dispute Fee', desc: 'Dispute fee.' },

  {
    value: 'T0200',
    display_name: 'General Currency Conversion',
    desc: 'General currency conversion.',
  },
  {
    value: 'T0201',
    display_name: 'User-initiated Currency Conversion',
    desc: 'User-initiated currency conversion.',
  },
  {
    value: 'T0202',
    display_name: 'System Currency Conversion',
    desc: 'Currency conversion required to cover negative balance. PayPal-system generated.',
  },

  {
    value: 'T0300',
    display_name: 'General Bank Deposit',
    desc: 'General funding of PayPal account. Deposit to PayPal balance from a bank account.',
  },
  {
    value: 'T0301',
    display_name: 'Balance Manager Funding',
    desc: 'PayPal balance manager funding of PayPal account. PayPal-system generated.',
  },
  {
    value: 'T0302',
    display_name: 'ACH Funding Recovery',
    desc: 'ACH funding for funds recovery from account balance.',
  },
  {
    value: 'T0303',
    display_name: 'Electronic Funds Transfer',
    desc: 'Electronic funds transfer (EFT) (German banking).',
  },

  {
    value: 'T0400',
    display_name: 'General Bank Withdrawal',
    desc: 'General withdrawal from PayPal account. Settlement withdrawal or user-initiated.',
  },
  { value: 'T0401', display_name: 'AutoSweep', desc: 'AutoSweep.' },
  {
    value: 'T0403',
    display_name: 'Bank Transfer',
    desc: 'You initiated a transfer from your PayPal balance to your bank account.',
  },

  {
    value: 'T0500',
    display_name: 'General Debit Card Transaction',
    desc: 'General PayPal debit card transaction.',
  },
  {
    value: 'T0501',
    display_name: 'Virtual Debit Card Transaction',
    desc: 'Virtual PayPal debit card transaction.',
  },
  {
    value: 'T0502',
    display_name: 'Debit Card ATM Withdrawal',
    desc: 'PayPal debit card withdrawal to ATM.',
  },
  {
    value: 'T0503',
    display_name: 'Hidden Virtual Debit Card',
    desc: 'Hidden virtual PayPal debit card transaction.',
  },
  {
    value: 'T0504',
    display_name: 'Debit Card Cash Advance',
    desc: 'PayPal debit card cash advance.',
  },
  { value: 'T0505', display_name: 'Debit Authorization', desc: 'PayPal debit authorization.' },

  {
    value: 'T0600',
    display_name: 'General Credit Card Withdrawal',
    desc: 'General credit card withdrawal. Reversal of purchase with a credit card.',
  },

  {
    value: 'T0700',
    display_name: 'General Credit Card Deposit',
    desc: 'General credit card deposit. Purchase with a credit card.',
  },
  {
    value: 'T0701',
    display_name: 'Credit Card Negative Balance',
    desc: 'Credit card deposit for negative PayPal account balance.',
  },

  {
    value: 'T0800',
    display_name: 'General Bonus',
    desc: 'General bonus of a type not belonging to the other T08nn categories.',
  },
  {
    value: 'T0801',
    display_name: 'Debit Card Cash Back Bonus',
    desc: 'Debit card cash back bonus.',
  },
  {
    value: 'T0802',
    display_name: 'Merchant Referral Bonus',
    desc: 'Merchant referral account bonus.',
  },
  { value: 'T0803', display_name: 'Balance Manager Bonus', desc: 'Balance manager account bonus.' },
  { value: 'T0804', display_name: 'Buyer Warranty Bonus', desc: 'PayPal buyer warranty bonus.' },
  {
    value: 'T0805',
    display_name: 'Protection Bonus',
    desc: 'PayPal protection bonus, payout for PayPal buyer protection.',
  },
  { value: 'T0806', display_name: 'First ACH Bonus', desc: 'Bonus for first ACH use.' },
  {
    value: 'T0807',
    display_name: 'Security Charge Refund',
    desc: 'Credit card security charge refund.',
  },
  {
    value: 'T0808',
    display_name: 'Credit Card Cash Back Bonus',
    desc: 'Credit card cash back bonus.',
  },

  {
    value: 'T0900',
    display_name: 'General Incentive',
    desc: 'General incentive or certificate redemption.',
  },
  {
    value: 'T0901',
    display_name: 'Gift Certificate Redemption',
    desc: 'Gift certificate redemption.',
  },
  { value: 'T0902', display_name: 'Points Redemption', desc: 'Points incentive redemption.' },
  { value: 'T0903', display_name: 'Coupon Redemption', desc: 'Coupon redemption.' },
  { value: 'T0904', display_name: 'eBay Loyalty Incentive', desc: 'eBay loyalty incentive.' },
  { value: 'T0905', display_name: 'Offers Funding', desc: 'Offers used as funding source.' },

  { value: 'T1000', display_name: 'Bill Pay Transaction', desc: 'Bill pay transaction.' },

  {
    value: 'T1100',
    display_name: 'General Reversal',
    desc: 'General reversal of a type not belonging to the other T11nn categories.',
  },
  {
    value: 'T1101',
    display_name: 'ACH Withdrawal Reversal',
    desc: 'Reversal of ACH withdrawal transaction.',
  },
  {
    value: 'T1102',
    display_name: 'Debit Card Reversal',
    desc: 'Reversal of debit card transaction.',
  },
  { value: 'T1103', display_name: 'Points Usage Reversal', desc: 'Reversal of points usage.' },
  { value: 'T1104', display_name: 'ACH Deposit Reversal', desc: 'Reversal of ACH deposit.' },
  {
    value: 'T1105',
    display_name: 'Account Hold Reversal',
    desc: 'Reversal of general account hold.',
  },
  {
    value: 'T1106',
    display_name: 'Payment Reversal',
    desc: 'Payment reversal, initiated by PayPal.',
  },
  {
    value: 'T1107',
    display_name: 'Payment Refund',
    desc: 'Payment refund, initiated by merchant.',
  },
  { value: 'T1108', display_name: 'Fee Reversal', desc: 'Fee reversal.' },
  { value: 'T1109', display_name: 'Fee Refund', desc: 'Fee refund.' },
  { value: 'T1110', display_name: 'Hold for Dispute', desc: 'Hold for dispute investigation.' },
  {
    value: 'T1111',
    display_name: 'Cancel Hold',
    desc: 'Cancellation of hold for dispute resolution.',
  },
  { value: 'T1112', display_name: 'MAM Reversal', desc: 'MAM reversal.' },
  { value: 'T1113', display_name: 'Non-reference Credit', desc: 'Non-reference credit payment.' },
  { value: 'T1114', display_name: 'MassPay Reversal', desc: 'MassPay reversal transaction.' },
  { value: 'T1115', display_name: 'MassPay Refund', desc: 'MassPay refund transaction.' },
  { value: 'T1116', display_name: 'IPR Reversal', desc: 'Instant payment review (IPR) reversal.' },
  { value: 'T1117', display_name: 'Rebate Reversal', desc: 'Rebate or cash back reversal.' },
  {
    value: 'T1118',
    display_name: 'Generic Instrument Reversal (Seller)',
    desc: 'Generic instrument/Open Wallet reversals (seller side).',
  },
  {
    value: 'T1119',
    display_name: 'Generic Instrument Reversal (Buyer)',
    desc: 'Generic instrument/Open Wallet reversals (buyer side).',
  },

  {
    value: 'T1200',
    display_name: 'General Account Adjustment',
    desc: 'General account adjustment.',
  },
  { value: 'T1201', display_name: 'Chargeback', desc: 'Chargeback.' },
  { value: 'T1202', display_name: 'Chargeback Reversal', desc: 'Chargeback reversal.' },
  { value: 'T1203', display_name: 'Charge-off Adjustment', desc: 'Charge-off adjustment.' },
  { value: 'T1204', display_name: 'Incentive Adjustment', desc: 'Incentive adjustment.' },
  {
    value: 'T1205',
    display_name: 'Chargeback Reimbursement',
    desc: 'Reimbursement of chargeback.',
  },
  {
    value: 'T1207',
    display_name: 'Chargeback Re-presentment Rejection',
    desc: 'Chargeback re-presentment rejection.',
  },
  { value: 'T1208', display_name: 'Chargeback Cancellation', desc: 'Chargeback cancellation.' },

  { value: 'T1300', display_name: 'General Authorization', desc: 'General authorization.' },
  { value: 'T1301', display_name: 'Reauthorization', desc: 'Reauthorization.' },
  { value: 'T1302', display_name: 'Void Authorization', desc: 'Void of authorization.' },

  { value: 'T1400', display_name: 'General Dividend', desc: 'General dividend.' },

  {
    value: 'T1500',
    display_name: 'General Hold',
    desc: 'General temporary hold of a type not belonging to the other T15nn categories.',
  },
  {
    value: 'T1501',
    display_name: 'Authorization Hold',
    desc: 'Account hold for open authorization.',
  },
  { value: 'T1502', display_name: 'ACH Deposit Hold', desc: 'Account hold for ACH deposit.' },
  { value: 'T1503', display_name: 'Balance Hold', desc: 'Temporary hold on available balance.' },

  {
    value: 'T1600',
    display_name: 'Buyer Credit Funding',
    desc: 'PayPal buyer credit payment funding.',
  },
  { value: 'T1601', display_name: 'BML Credit', desc: 'BML credit. Transfer from BML.' },
  { value: 'T1602', display_name: 'Buyer Credit Payment', desc: 'Buyer credit payment.' },
  {
    value: 'T1603',
    display_name: 'Buyer Credit Withdrawal',
    desc: 'Buyer credit payment withdrawal. Transfer to BML.',
  },

  {
    value: 'T1700',
    display_name: 'General Non-bank Withdrawal',
    desc: 'General withdrawal to non-bank institution.',
  },
  { value: 'T1701', display_name: 'WorldLink Withdrawal', desc: 'WorldLink withdrawal.' },

  {
    value: 'T1800',
    display_name: 'General Buyer Credit Payment',
    desc: 'General buyer credit payment.',
  },
  { value: 'T1801', display_name: 'BML Withdrawal', desc: 'BML withdrawal. Transfer to BML.' },

  {
    value: 'T1900',
    display_name: 'General Account Correction',
    desc: 'General adjustment without business-related event.',
  },

  {
    value: 'T2000',
    display_name: 'General Intra-account Transfer',
    desc: 'General intra-account transfer.',
  },
  { value: 'T2001', display_name: 'Settlement Consolidation', desc: 'Settlement consolidation.' },
  {
    value: 'T2002',
    display_name: 'Funds Transfer from Payable',
    desc: 'Transfer of funds from payable.',
  },
  { value: 'T2003', display_name: 'External GL Transfer', desc: 'Transfer to external GL entity.' },
  { value: 'T2004', display_name: 'Receivables Financing', desc: 'Receivables financing.' },

  { value: 'T2101', display_name: 'General Hold', desc: 'General hold.' },
  { value: 'T2102', display_name: 'General Hold Release', desc: 'General hold release.' },
  { value: 'T2103', display_name: 'Reserve Hold', desc: 'Reserve hold.' },
  { value: 'T2104', display_name: 'Reserve Release', desc: 'Reserve release.' },
  { value: 'T2105', display_name: 'Payment Review Hold', desc: 'Payment review hold.' },
  { value: 'T2106', display_name: 'Payment Review Release', desc: 'Payment review release.' },
  { value: 'T2107', display_name: 'Payment Hold', desc: 'Payment hold.' },
  { value: 'T2108', display_name: 'Payment Hold Release', desc: 'Payment hold release.' },
  { value: 'T2109', display_name: 'Gift Certificate Purchase', desc: 'Gift certificate purchase.' },
  {
    value: 'T2110',
    display_name: 'Gift Certificate Redemption',
    desc: 'Gift certificate redemption.',
  },
  { value: 'T2111', display_name: 'Funds Not Yet Available', desc: 'Funds not yet available.' },
  { value: 'T2112', display_name: 'Funds Available', desc: 'Funds available.' },
  { value: 'T2113', display_name: 'Blocked Payments', desc: 'Blocked payments.' },

  {
    value: 'T2201',
    display_name: 'Credit Card Restricted Balance Transfer',
    desc: 'Transfer to and from a credit-card-funded restricted balance.',
  },

  {
    value: 'T3000',
    display_name: 'Generic Instrument Transaction',
    desc: 'Generic instrument/Open Wallet transaction.',
  },

  {
    value: 'T5000',
    display_name: 'Deferred Disbursement',
    desc: 'Deferred disbursement. Funds collected for disbursement.',
  },
  {
    value: 'T5001',
    display_name: 'Delayed Disbursement',
    desc: 'Delayed disbursement. Funds disbursed.',
  },
  {
    value: 'T9700',
    display_name: 'Account Receivable for Shipping',
    desc: 'Account receivable for shipping.',
  },
  {
    value: 'T9701',
    display_name: 'Funds Payable',
    desc: 'Funds payable. PayPal-provided funds that must be paid back.',
  },
  {
    value: 'T9702',
    display_name: 'Funds Receivable',
    desc: 'Funds receivable. PayPal-provided funds that are being paid back.',
  },
  { value: 'T9800', display_name: 'Display Only Transaction', desc: 'Display only transaction.' },
  { value: 'T9900', display_name: 'Other', desc: 'Other.' },
] satisfies IQoreAllowedValue<string>[];
