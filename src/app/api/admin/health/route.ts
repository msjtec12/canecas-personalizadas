import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth, checkStorageHealth } from '@/lib/supabaseServer';
import { isAuthenticatedAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  if (!isAuthenticatedAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Acesso não autorizado.' }, { status: 401 });
  }

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
