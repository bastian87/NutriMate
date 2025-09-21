import { NextRequest, NextResponse } from "next/server"
import { cleanupAbandonedAccounts } from "@/scripts/cleanup-abandoned-accounts"

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret) {
      console.error('CRON_SECRET environment variable not set')
      return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 })
    }
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request:', { 
        authHeader: authHeader ? 'present' : 'missing',
        expected: `Bearer ${cronSecret.substring(0, 8)}...`
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🧹 Starting cleanup via Vercel Cron...')
    console.log('⏰ Timestamp:', new Date().toISOString())
    
    // Run the cleanup process
    await cleanupAbandonedAccounts()
    
    console.log('✅ Cleanup completed successfully via Vercel Cron')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cleanup completed successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Cleanup failed via Vercel Cron:', error)
    
    return NextResponse.json({ 
      success: false,
      error: 'Cleanup failed', 
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
