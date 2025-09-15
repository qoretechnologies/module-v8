import { forEach } from 'lodash';
import { TQoreTypeObject } from '@qoretechnologies/ts-toolkit';

export const responseHasCorrectStructure = (
  response: Record<string, unknown>,
  expectedStructure: Record<string, unknown>
): void => {
  if (!response) {
    expect(expectedStructure).toBeNull();

    return;
  }

  forEach(response, (_value, key) => {
    expect(expectedStructure).toHaveProperty(key);
  });
};

export const validateResponseProperties = (
  expectedType: string | TQoreTypeObject,
  actualResponse: Record<string, any>
) => {
  if (typeof expectedType === 'string') {
    expect(actualResponse).toBe(expectedType);

    return;
  }
  if (expectedType.type !== 'hash') return;
  const fields = expectedType.fields;

  forEach(fields, (fieldDefinition, key) => {
    const expectedFieldType = fieldDefinition.type || fieldDefinition;
    const actualValue = actualResponse[key];

    if (fieldDefinition.required === false) return;

    expect(actualResponse).toHaveProperty(key);

    if (
      (expectedFieldType === 'list' || expectedFieldType === '*list') &&
      Array.isArray(actualValue) &&
      actualValue.length > 0 &&
      Array.isArray(fieldDefinition.example_value)
    ) {
      const exampleItem = fieldDefinition.example_value?.[0] || {};
      validateResponseProperties(exampleItem, actualValue[0]);
    } else if (typeof expectedFieldType === 'object' && expectedFieldType.type === 'hash') {
      validateResponseProperties(fieldDefinition.type, actualValue);
    }
  });
};

export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      console.log(`Success on attempt ${i + 1}`);

      return result;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Retry ${i + 1} failed. Retrying in ${delay}ms...`);
      console.error(error);
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }
  throw new Error('Max retries reached');
};
