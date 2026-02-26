// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Temporary: Allow placeholder values for testing
  // TODO: Replace with real Supabase project values
  const hasValidUrl = url && url.includes(".supabase.co");
  const hasValidKey = key && key.length > 50;

  return !!(hasValidUrl && hasValidKey);
}

export function getSupabaseConfig() {
  return {
    url:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://vwyvsqjcnohrxcfsgbfo.supabase.co",
    key:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3eXZzcWpjbm9ocnhjZnNnYmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDc3MjIsImV4cCI6MjA3MTYyMzcyMn0.vP1vITmqd7_SVPnIaK22TI4O14RB82vHkX2xRuRlFJU",
  };
}
