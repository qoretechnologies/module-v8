import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const GoogleFormsQuestionTypes = [
  { value: 'TEXT', display_name: 'Short Answer' },
  { value: 'PARAGRAPH', display_name: 'Paragraph' },
  { value: 'MULTIPLE_CHOICE', display_name: 'Multiple Choice' },
  { value: 'CHECKBOX', display_name: 'Checkboxes' },
  { value: 'DROPDOWN', display_name: 'Dropdown' },
  { value: 'SCALE', display_name: 'Linear Scale' },
  { value: 'DATE', display_name: 'Date' },
  { value: 'TIME', display_name: 'Time' },
] satisfies IQoreAllowedValue<string>[];
