/**
 * File Categories Helper
 *
 * Fetches and caches file categories from BambooHR.
 * Used for allowed values in file upload actions.
 *
 * Note: BambooHR doesn't have separate category endpoints.
 * Categories are extracted from the files/view endpoints.
 *
 * @see https://documentation.bamboohr.com/reference/list-company-files-and-categories
 * @see https://documentation.bamboohr.com/reference/list-employee-files
 */

import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';
import { bambooHRClient } from '../client';
import {
  IBambooHRCompanyFilesResponse,
  IBambooHRConnectionOptions,
  IBambooHREmployeeFilesResponse,
  IBambooHRFileCategory,
} from '../types';

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
 * Categories are extracted from the employee files endpoint.
 * Results are cached for 5 minutes.
 *
 * @param connectionOptions - Connection options with token and company_domain
 * @param employeeId - Employee ID to fetch categories for (required)
 */
export const getEmployeeFileCategories = async (
  connectionOptions: IBambooHRConnectionOptions,
  employeeId: string
): Promise<IBambooHRFileCategory[]> => {
  const cacheKey = `${connectionOptions.company_domain}_${employeeId}`;
  const cached = employeeCategoriesCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Fetch from files/view endpoint and extract categories
  const response = await bambooHRClient.get<IBambooHREmployeeFilesResponse>(
    `employees/${employeeId}/files/view/`,
    {
      token: connectionOptions.token,
      connectionOptions: { company_domain: connectionOptions.company_domain },
    }
  );

  const categories: IBambooHRFileCategory[] = (response?.categories || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
  }));

  employeeCategoriesCache.set(cacheKey, {
    data: categories,
    timestamp: Date.now(),
  });

  return categories;
};

/**
 * Get company file categories from BambooHR.
 * Categories are extracted from the company files endpoint.
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

  // Fetch from files/view endpoint and extract categories
  const response = await bambooHRClient.get<IBambooHRCompanyFilesResponse>('files/view/', {
    token: connectionOptions.token,
    connectionOptions: { company_domain: connectionOptions.company_domain },
  });

  const categories: IBambooHRFileCategory[] = (response?.categories || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
  }));

  companyCategoriesCache.set(cacheKey, {
    data: categories,
    timestamp: Date.now(),
  });

  return categories;
};

/**
 * Get employee file categories as allowed values for action options.
 * Requires employee_id to be set in context.opts.
 */
export const getEmployeeFileCategoriesAllowedValues = async (
  context: Record<string, unknown>
): Promise<IQoreAllowedValue<string>[]> => {
  const connOpts = context?.conn_opts as IBambooHRConnectionOptions | undefined;
  const opts = context?.opts as Record<string, unknown> | undefined;
  const employeeId = opts?.employee_id as string | undefined;

  if (!connOpts?.token || !connOpts?.company_domain || !employeeId) {
    return [];
  }

  try {
    const categories = await getEmployeeFileCategories(connOpts, employeeId);

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

  if (!connOpts?.token || !connOpts?.company_domain) {
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
