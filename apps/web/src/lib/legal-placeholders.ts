/**
 * Single source of truth for the business/legal details that Contact, Privacy,
 * Terms and Refund-Cancellation currently reference as placeholders. Fill these
 * in once real values exist (legal entity, registered address, support inbox,
 * grievance officer, GSTIN) and every page picks them up.
 */
export const LEGAL = {
  entityName: '[Legal entity name — e.g. EduBridge Network Pvt. Ltd.]',
  registeredAddress: '[Registered business address]',
  operatingAddress: '[Operating / correspondence address, if different]',
  supportEmail: '[support email address]',
  supportPhone: '[support phone number]',
  supportHours: '[support hours, e.g. Mon–Sat, 10am–7pm IST]',
  grievanceOfficerName: '[Grievance officer name]',
  grievanceOfficerEmail: '[grievance officer email]',
  gstin: '[GSTIN, if registered]',
  cin: '[CIN / registration number, if applicable]',
  jurisdiction: '[City], India',
  refundWindowDays: '[X]',
  refundProcessingDays: '[X]',
  lastUpdated: '[DD Month YYYY]',
} as const;
