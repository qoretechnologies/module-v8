export interface IGoogleAnalyticsReportRow {
  dimension_values: { value: string }[];
  metric_values: { value: string }[];
}

export interface IGoogleAnalyticsReportHeader {
  name: string;
  type?: string;
}

export interface IGoogleAnalyticsReportMetadata {
  currency_code?: string;
  time_zone?: string;
}

export interface IGoogleAnalyticsPropertyQuota {
  tokens_per_day?: unknown;
  tokens_per_hour?: unknown;
  concurrent_requests?: unknown;
  server_errors_per_project_per_hour?: unknown;
}

export interface IGoogleAnalyticsRunReportResponse {
  row_count: number;
  dimension_headers: IGoogleAnalyticsReportHeader[];
  metric_headers: IGoogleAnalyticsReportHeader[];
  rows: IGoogleAnalyticsReportRow[];
  metadata?: IGoogleAnalyticsReportMetadata;
  property_quota?: IGoogleAnalyticsPropertyQuota;
}

export interface IGoogleAnalyticsDimensionMetadata {
  api_name?: string;
  ui_name?: string;
  description?: string;
  category?: string;
  custom_definition: boolean;
  deprecated_api_names: string[];
}

export interface IGoogleAnalyticsMetricMetadata {
  api_name?: string;
  ui_name?: string;
  description?: string;
  category?: string;
  type?: string;
  custom_definition: boolean;
  deprecated_api_names: string[];
  expression?: string;
}

export interface IGoogleAnalyticsGetMetadataResponse {
  name?: string;
  dimensions: IGoogleAnalyticsDimensionMetadata[];
  metrics: IGoogleAnalyticsMetricMetadata[];
  dimension_count: number;
  metric_count: number;
}

export interface IGoogleAnalyticsCompatibilityResult {
  dimension?: {
    api_name?: string;
    ui_name?: string;
    description?: string;
  };
  metric?: {
    api_name?: string;
    ui_name?: string;
    description?: string;
  };
  compatibility?: string;
}

export interface IGoogleAnalyticsCheckCompatibilityResponse {
  dimension_compatibilities: IGoogleAnalyticsCompatibilityResult[];
  metric_compatibilities: IGoogleAnalyticsCompatibilityResult[];
  summary: {
    total_dimensions: number;
    compatible_dimensions: number;
    incompatible_dimensions: number;
    total_metrics: number;
    compatible_metrics: number;
    incompatible_metrics: number;
    all_compatible: boolean;
  };
}
