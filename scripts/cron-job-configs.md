# Cron Job Configurations for Abandoned Account Cleanup

## Overview

This document provides configuration examples for running the abandoned account cleanup script on different hosting platforms and environments.

## Script Location

- **Main Script**: `scripts/cleanup-abandoned-accounts.ts`
- **Wrapper Script**: `scripts/run-cleanup.sh` (created by setup script)
- **Logs**: `logs/cleanup.log`

## Platform Configurations

### 1. Vercel (Recommended)

#### Using Vercel Cron Jobs

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-accounts",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

Create `app/api/cron/cleanup-accounts/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { cleanupAbandonedAccounts } from "@/scripts/cleanup-abandoned-accounts"

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🧹 Starting cleanup via Vercel Cron...')
    await cleanupAbandonedAccounts()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cleanup completed successfully' 
    })
  } catch (error) {
    console.error('Cleanup failed:', error)
    return NextResponse.json({ 
      error: 'Cleanup failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
```

#### Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_random_secret_string
```

### 2. Railway

#### Using Railway Cron Jobs

Create `railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start"

[cron]
cleanup = "0 */6 * * *"
```

Create `scripts/railway-cleanup.js`:

```javascript
const { exec } = require('child_process')
const path = require('path')

const scriptPath = path.join(__dirname, 'cleanup-abandoned-accounts.ts')

exec(`npx tsx ${scriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error('Cleanup failed:', error)
    process.exit(1)
  }
  console.log(stdout)
  if (stderr) console.error(stderr)
})
```

### 3. DigitalOcean App Platform

#### Using App Platform Cron Jobs

Create `.do/app.yaml`:

```yaml
name: nutrimate
services:
- name: web
  source_dir: /
  github:
    repo: your-username/nutrimate
    branch: main
  run_command: npm run start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NEXT_PUBLIC_SUPABASE_URL
    value: ${NEXT_PUBLIC_SUPABASE_URL}
  - key: SUPABASE_SERVICE_ROLE_KEY
    value: ${SUPABASE_SERVICE_ROLE_KEY}

jobs:
- name: cleanup-accounts
  source_dir: /
  github:
    repo: your-username/nutrimate
    branch: main
  run_command: npx tsx scripts/cleanup-abandoned-accounts.ts
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  schedule: "0 */6 * * *"
  envs:
  - key: NEXT_PUBLIC_SUPABASE_URL
    value: ${NEXT_PUBLIC_SUPABASE_URL}
  - key: SUPABASE_SERVICE_ROLE_KEY
    value: ${SUPABASE_SERVICE_ROLE_KEY}
```

### 4. AWS Lambda + EventBridge

#### Using AWS Lambda for Cleanup

Create `lambda/cleanup-accounts.js`:

```javascript
const { exec } = require('child_process')
const path = require('path')

exports.handler = async (event) => {
  try {
    console.log('🧹 Starting cleanup via AWS Lambda...')
    
    // Set environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    // Run the cleanup script
    const result = await new Promise((resolve, reject) => {
      exec('npx tsx scripts/cleanup-abandoned-accounts.ts', (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          resolve({ stdout, stderr })
        }
      })
    })
    
    console.log(result.stdout)
    if (result.stderr) console.error(result.stderr)
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Cleanup completed successfully'
      })
    }
  } catch (error) {
    console.error('Cleanup failed:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    }
  }
}
```

#### EventBridge Rule

```json
{
  "Rules": [
    {
      "Name": "nutrimate-cleanup-rule",
      "ScheduleExpression": "rate(6 hours)",
      "State": "ENABLED",
      "Targets": [
        {
          "Id": "1",
          "Arn": "arn:aws:lambda:region:account:function:nutrimate-cleanup"
        }
      ]
    }
  ]
}
```

### 5. Google Cloud Platform

#### Using Cloud Scheduler + Cloud Functions

Create `functions/cleanup-accounts/index.js`:

```javascript
const { exec } = require('child_process')

exports.cleanupAccounts = async (req, res) => {
  try {
    console.log('🧹 Starting cleanup via Cloud Functions...')
    
    // Verify the request is from Cloud Scheduler
    if (req.get('X-CloudScheduler') !== 'true') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    
    // Run the cleanup script
    const result = await new Promise((resolve, reject) => {
      exec('npx tsx scripts/cleanup-abandoned-accounts.ts', (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          resolve({ stdout, stderr })
        }
      })
    })
    
    console.log(result.stdout)
    if (result.stderr) console.error(result.stderr)
    
    res.status(200).json({
      success: true,
      message: 'Cleanup completed successfully'
    })
  } catch (error) {
    console.error('Cleanup failed:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
```

#### Cloud Scheduler Job

```bash
gcloud scheduler jobs create http nutrimate-cleanup \
  --schedule="0 */6 * * *" \
  --uri="https://region-project.cloudfunctions.net/cleanupAccounts" \
  --http-method=GET \
  --headers="X-CloudScheduler=true"
```

### 6. Self-Hosted Server

#### Using System Cron

Run the setup script:

```bash
chmod +x scripts/setup-cron-jobs.sh
./scripts/setup-cron-jobs.sh
```

#### Manual Cron Entry

```bash
# Edit crontab
crontab -e

# Add this line (runs every 6 hours)
0 */6 * * * /path/to/project/scripts/run-cleanup.sh
```

## Monitoring and Logging

### 1. Log Monitoring

```bash
# Monitor cleanup logs
tail -f logs/cleanup.log

# Check for errors
grep "ERROR\|Failed" logs/cleanup.log

# Check cleanup statistics
grep "Cleanup Statistics" logs/cleanup.log
```

### 2. Health Check Endpoint

Create `app/api/health/cleanup/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET(request: NextRequest) {
  try {
    const logPath = join(process.cwd(), 'logs', 'cleanup.log')
    const logContent = await readFile(logPath, 'utf-8')
    
    // Get last cleanup run
    const lastRun = logContent.split('\n')
      .filter(line => line.includes('Cleanup Statistics'))
      .pop()
    
    // Get error count from last run
    const errorCount = logContent.split('\n')
      .filter(line => line.includes('ERROR') || line.includes('Failed'))
      .length
    
    return NextResponse.json({
      status: 'healthy',
      lastRun,
      errorCount,
      logSize: logContent.length
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
```

## Testing

### 1. Manual Test

```bash
# Run cleanup manually
npx tsx scripts/cleanup-abandoned-accounts.ts

# Test with dry run (add --dry-run flag to script)
npx tsx scripts/cleanup-abandoned-accounts.ts --dry-run
```

### 2. Test API Endpoint

```bash
# Test profile restart API
curl -X POST http://localhost:3000/api/profile/restart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Security Considerations

1. **Environment Variables**: Never commit service role keys to version control
2. **Cron Authentication**: Use secrets to verify cron job requests
3. **Logging**: Don't log sensitive information like user emails in production
4. **Rate Limiting**: Consider rate limiting for the restart API
5. **Audit Trail**: Log all cleanup operations for compliance

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure service role key has admin permissions
2. **Environment Variables**: Verify all required env vars are set
3. **Cron Not Running**: Check cron service status and logs
4. **Database Errors**: Verify RLS policies allow admin operations

### Debug Mode

Enable debug logging by setting:

```bash
export DEBUG=nutrimate:cleanup
npx tsx scripts/cleanup-abandoned-accounts.ts
```
