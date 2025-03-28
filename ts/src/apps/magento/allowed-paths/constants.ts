import { TCustomConnOptions, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { MagentoConditionTypeAllowedValues } from '../helpers/condition-type-allowed-values';

export const getMagentoSearchCriteriaOptions = (
  getFieldsAllowedValues: TQoreGetAllowedValuesFunction<TCustomConnOptions, string>
) => ({
  'searchCriteria[filterGroups][0][filters][0][field]': {
    allowed_values_creatable: true,
    get_allowed_values: getFieldsAllowedValues,
  },
  'searchCriteria[filterGroups][0][filters][0][conditionType]': {
    allowed_values: MagentoConditionTypeAllowedValues,
  },
  'searchCriteria[sortOrders][0][direction]': {
    allowed_values: [
      { value: 'ASC', display_name: 'Ascending' },
      { value: 'DESC', display_name: 'Descending' },
    ],
  },
  'searchCriteria[sortOrders][0][field]': {
    allowed_values_creatable: true,
    get_allowed_values: getFieldsAllowedValues,
  },
});
