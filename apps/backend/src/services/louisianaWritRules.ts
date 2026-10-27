import { DeadlineRule } from './deadlineCalculator';

export const LOUISIANA_WRIT_RULES: DeadlineRule[] = [
  {
    id: 'notice_of_intent',
    name: 'Notice of Intent to Seek Supervisory Writ',
    description: 'Deadline to file notice of intent with trial court',
    baseDateField: 'order_date',
    offsetDays: 30,
    adjustForWeekends: true,
    adjustForHolidays: true,
    citation: 'La. C.C.P. Art. 2201'
  },
  {
    id: 'writ_application',
    name: 'Writ Application Deadline',
    description: 'Deadline to file writ application with appellate court',
    baseDateField: 'order_date',
    offsetDays: 30,
    adjustForWeekends: true,
    adjustForHolidays: true,
    citation: 'Uniform Rules—Courts of Appeal, Rule 4-3'
  }
];

export const LOUISIANA_APPEAL_RULES: DeadlineRule[] = [
  {
    id: 'notice_of_appeal',
    name: 'Notice of Appeal',
    description: 'Deadline to file notice of appeal',
    baseDateField: 'judgment_date',
    offsetDays: 60,
    adjustForWeekends: true,
    adjustForHolidays: true,
    citation: 'La. C.C.P. Art. 2087'
  },
  {
    id: 'record_on_appeal_no_testimony',
    name: 'Record on Appeal (No Testimony)',
    description: 'Return day when no testimony needs transcribing - 30 days from payment of costs',
    baseDateField: 'costs_paid_date',
    offsetDays: 30,
    adjustForWeekends: true,
    adjustForHolidays: true,
    citation: 'La. C.C.P. Art. 2125'
  },
  {
    id: 'record_on_appeal_with_testimony',
    name: 'Record on Appeal (With Testimony)',
    description: 'Return day when testimony needs transcribing - 45 days from payment of costs',
    baseDateField: 'costs_paid_date',
    offsetDays: 45,
    adjustForWeekends: true,
    adjustForHolidays: true,
    citation: 'La. C.C.P. Art. 2125'
  }
];

export const LOUISIANA_DISCOVERY_RULES: DeadlineRule[] = [
  {
    id: 'interrogatory_response',
    name: 'Response to Interrogatories',
    description: 'Deadline to respond to interrogatories',
    baseDateField: 'service_date',
    offsetDays: 30,
    adjustForWeekends: true,
    adjustForHolidays: true,
    citation: 'La. C.C.P. Art. 1457'
  },
  {
    id: 'request_for_production',
    name: 'Response to Request for Production of Documents',
    description: 'Deadline to respond to request for production of documents',
    baseDateField: 'service_date',
    offsetDays: 30,
    adjustForWeekends: true,
    adjustForHolidays: true,
    citation: 'La. C.C.P. Art. 1461'
  },
  {
    id: 'request_for_admission',
    name: 'Response to Request for Admission',
    description: 'Deadline to respond to request for admission',
    baseDateField: 'service_date',
    offsetDays: 30,
    adjustForWeekends: true,
    adjustForHolidays: true,
    citation: 'La. C.C.P. Art. 1469'
  }
];
