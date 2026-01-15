/**
 * File Categories Helper
 *
 * Fetches and caches file categories from BambooHR.
 * Used for allowed values in file upload actions.
 *
 * @see https://documentation.bamboohr.com/reference/metadata-get-employee-file-categories
 */

import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';
import { bambooHRClient } from '../client';
import { IBambooHRConnectionOptions, IBambooHRFileCategory } from '../types';

// Cache for employee file categories with 5-minute TTL
const employeeCategoriesCache = new Map<string, { data: IBambooHRFileCategory[]; timestamp: number }>();
// Cache for company file categories with 5-minute TTL
const companyCategoriesCache = new Map<string, { data: IBambooHRFileCategory[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Clear the file categories cache. Useful for testing.
 */
export const clearFileCategoriesCache = (): void => {
  employeeCategoriesCache.clear();
  companyCategoriesCache.clear();
};

/**
 * Get employee file categories from BambooHR.
 * Results are cached for 5 minutes.
 */
export const getEmployeeFileCategories = async (
  connectionOptions: IBambooHRConnectionOptions
): Promise<IBambooHRFileCategory[]> => {
  const cacheKey = connectionOptions.company_domain;
  const cached = employeeCategoriesCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const response = await bambooHRClient.get<IBambooHRFileCategory[]>('meta/files/categories', {
    token: connectionOptions.api_key,
    connectionOptions: { company_domain: connectionOptions.company_domain },
  });

  const categories = response || [];

  employeeCategoriesCache.set(cacheKey, {
    data: categories,
    timestamp: Date.now(),
  });

  return categories;
};

/**
 * Get company file categories from BambooHR.
 * Results are cached for 5 minutes.
 */
export const getCompanyFileCategories = async (
  connectionOptions: IBambooHRConnectionOptions
): Promise<IBambooHRFileCategory[]> => {
  const cacheKey = connectionOptions.company_domain;
  const cached = companyCategoriesCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const response = await bambooHRClient.get<IBambooHRFileCategory[]>('files/categories', {
    token: connectionOptions.api_key,
    connectionOptions: { company_domain: connectionOptions.company_domain },
  });

  const categories = response || [];

  companyCategoriesCache.set(cacheKey, {
    data: categories,
    timestamp: Date.now(),
  });

  return categories;
};

/**
 * Get employee file categories as allowed values for action options.
 */
export const getEmployeeFileCategoriesAllowedValues = async (
  context: Record<string, unknown>
): Promise<IQoreAllowedValue<string>[]> => {
  const connOpts = context?.conn_opts as IBambooHRConnectionOptions | undefined;

  if (!connOpts?.api_key || !connOpts?.company_domain) {
    return [];
  }

  try {
    const categories = await getEmployeeFileCategories(connOpts);

    return categories.map((category) => ({
      value: String(category.id),
      display_name: category.name,
    }));
  } catch {
    return [];
  }
};

/**
 * Get company file categories as allowed values for action options.
 */
export const getCompanyFileCategoriesAllowedValues = async (
  context: Record<string, unknown>
): Promise<IQoreAllowedValue<string>[]> => {
  const connOpts = context?.conn_opts as IBambooHRConnectionOptions | undefined;

  if (!connOpts?.api_key || !connOpts?.company_domain) {
    return [];
  }

  try {
    const categories = await getCompanyFileCategories(connOpts);

    return categories.map((category) => ({
      value: String(category.id),
      display_name: category.name,
    }));
  } catch {
    return [];
  }
};
