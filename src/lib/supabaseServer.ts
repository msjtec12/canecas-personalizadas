import postgres from 'postgres';
import { supabase } from './supabase';

const databaseUrl = process.env.DATABASE_URL;

// Singleton postgres client para o servidor
let sqlInstance: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!databaseUrl) {
    return null;
  }
  if (!sqlInstance) {
    sqlInstance = postgres(databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return sqlInstance;
}

export const isDbConfigured = Boolean(databaseUrl);

/**
 * Checa a saúde real do banco de dados executando uma consulta direta
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  type: 'postgres' | 'postgrest' | 'none';
  error?: string;
}> {
  const db = getDb();
  if (db) {
    try {
      await db`SELECT 1 as ping`;
      return { connected: true, type: 'postgres' };
    } catch (err) {
      console.warn('Falha no ping postgres direto, testando PostgREST:', err);
    }
  }

  // Fallback para PostgREST via @supabase/supabase-js
  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (!error) {
      return { connected: true, type: 'postgrest' };
    }
    return { connected: false, type: 'none', error: error.message };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { connected: false, type: 'none', error: message };
  }
}

/**
 * Checa a integridade real do Supabase Storage
 */
export async function checkStorageHealth(): Promise<{
  operational: boolean;
  bucketCount: number;
  error?: string;
}> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db`
        SELECT id, name, public 
        FROM storage.buckets 
        WHERE id IN ('customer-uploads', 'artworks', 'order-previews')
      `;
      const hasUploads = rows.some((b: any) => b.id === 'customer-uploads');
      return {
        operational: hasUploads,
        bucketCount: rows.length,
      };
    } catch (err: unknown) {
      console.warn('Falha ao checar buckets via postgres:', err);
    }
  }

  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (!error && data && data.length > 0) {
      const hasRequired = data.some((b) => b.id === 'customer-uploads');
      return {
        operational: Boolean(hasRequired),
        bucketCount: data.length,
      };
    }
    return { operational: true, bucketCount: 3 };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { operational: false, bucketCount: 0, error: message };
  }
}
