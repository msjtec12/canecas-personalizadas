import { NextResponse } from 'next/server';
import { checkDatabaseHealth, checkStorageHealth } from '@/lib/supabaseServer';

export async function GET() {
  const [dbHealth, storageHealth] = await Promise.all([
    checkDatabaseHealth(),
    checkStorageHealth(),
  ]);

  return NextResponse.json({
    database: {
      status: dbHealth.connected ? 'connected' : 'disconnected',
      type: dbHealth.type,
      error: dbHealth.error,
    },
    storage: {
      status: storageHealth.operational ? 'operational' : 'unavailable',
      bucketCount: storageHealth.bucketCount,
      error: storageHealth.error,
    },
    timestamp: new Date().toISOString(),
  });
}
