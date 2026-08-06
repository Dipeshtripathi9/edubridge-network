/**
 * Single source of truth for the business/legal details referenced across
 * Contact, Privacy, Terms and Refund-Cancellation. Update here to update
 * every page at once.
 */
export const LEGAL = {
  entityName: 'EduBridge Network (proprietorship, currently unregistered)',
  registeredAddress: '2/F, Block 329, Sector Mu-2, Greater Noida, Gautam Budh Nagar, Uttar Pradesh, India – 201310',
  supportEmail: '365edubridge@gmail.com',
  supportPhone: '+91 88518 69281',
  supportHours: '24/7',
  grievanceOfficerName: 'EduBridge Network (Proprietor)',
  grievanceOfficerEmail: '365edubridge@gmail.com',
  gstin: '09BYZPT9200R1Z0',
  jurisdiction: 'Gautam Budh Nagar, Uttar Pradesh',
  refundWindowDays: '7',
  refundProcessingDays: '7',
  lastUpdated: '6 August 2026',
} as const;
