export const formatNotionFilterValues = (
  properties: Record<string, any>,
  filter_properties: Record<string, any>
): any[] => {
  const filterArray = [];

  for (const fieldKey in filter_properties) {
    const fieldValue = filter_properties[fieldKey];
    const fieldType = properties[fieldKey].type;
    if (fieldValue === '' || fieldValue === undefined) {
      continue;
    }
    switch (fieldType) {
      case 'number':
        filterArray.push({
          property: fieldKey,
          number: { equals: Number(fieldValue) },
        });
        break;
      case 'rich_text':
        filterArray.push({
          property: fieldKey,
          rich_text: { equals: fieldValue },
        });
        break;
      case 'email':
        filterArray.push({
          property: fieldKey,
          email: { equals: fieldValue },
        });
        break;
      case 'select':
        filterArray.push({
          property: fieldKey,
          select: { equals: fieldValue },
        });
        break;
      case 'phone_number':
        filterArray.push({
          property: fieldKey,
          phone_number: { equals: fieldValue },
        });
        break;
      case 'url':
        filterArray.push({ property: fieldKey, url: { equals: fieldValue } });
        break;
      case 'title':
        filterArray.push({
          property: fieldKey,
          title: { equals: fieldValue },
        });
        break;
    }
  }

  return filterArray;
};
