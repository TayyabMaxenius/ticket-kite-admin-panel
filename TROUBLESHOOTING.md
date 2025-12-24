# Troubleshooting ERR_NAME_NOT_RESOLVED Error

This error means the browser can't resolve the Supabase URL. Here's how to fix it:

## Step 1: Check Your Environment Variables

Create a `.env.local` file in the root of your project (if it doesn't exist):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**How to get these values:**
1. Go to your Supabase project dashboard
2. Click on **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 2: Verify Your Supabase Project Status

1. Go to https://supabase.com/dashboard
2. Check if your project is:
   - ✅ **Active** (should be green/running)
   - ❌ **Paused** (needs to be resumed)
   - ❌ **Deleted** (you'll need to create a new project)

If paused, click **"Resume project"** to restart it.

## Step 3: Restart Your Dev Server

After updating `.env.local`, restart your Next.js dev server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
# or
yarn dev
```

**Important:** Next.js only reads `.env.local` on startup, so you MUST restart the server.

## Step 4: Verify Network Connection

The error can also be caused by:
- **Network issues**: Check your internet connection
- **Firewall/VPN**: Try disabling VPN or firewall temporarily
- **DNS issues**: Try accessing `https://your-project-ref.supabase.co` directly in browser

## Step 5: Check Browser Console

Open browser DevTools (F12) → Console tab and look for:
- The Supabase URL being logged (should show your correct URL)
- Any additional error messages

## Step 6: Test Direct Connection

Try accessing your Supabase project URL directly in a browser:
```
https://creykrbdacoycrqzdjen.supabase.co
```

If this doesn't load, the project might be paused or the URL is incorrect.

## Common Issues

### Issue: Environment variables not loading
**Solution:** Make sure `.env.local` is in the project root (same level as `package.json`)

### Issue: Still getting error after restart
**Solution:** 
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Try in incognito/private window

### Issue: Project URL resolves but shows error
**Solution:** Check your Supabase project settings and ensure:
- Project is active
- API keys are correct
- Row Level Security (RLS) policies allow your operations

## Quick Fix Checklist

- [ ] `.env.local` file exists in project root
- [ ] Environment variables are correctly named (NEXT_PUBLIC_ prefix)
- [ ] Supabase project is active (not paused)
- [ ] Dev server was restarted after adding env vars
- [ ] Browser cache cleared
- [ ] Network connection is working

## Still Not Working?

If the issue persists:
1. Check Supabase dashboard → Project Settings → API for correct URLs
2. Try creating a new `.env.local` file from scratch
3. Verify the project ref in the URL matches your Supabase dashboard

