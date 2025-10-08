import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const createSupabaseClient = (options: {
  projectId: string;
  token: string;
}): SupabaseClient => {
  const { projectId, token } = options;

  const supabaseUrl = `https://${projectId}.supabase.co`;
  return createClient(supabaseUrl, token);
};

export type TSupabaseTablesResponse = {
  data: {
    definitions: Record<
      string,
      {
        description: string;
        required: string[];
        properties: Record<
          string,
          {
            type?: string;
            format?: string;
            description?: string;
            default?: any;
            items?: {
              type?: string;
            };
          }
        >;
      }
    >;
    paths?: Record<string, unknown>;
  };
};
