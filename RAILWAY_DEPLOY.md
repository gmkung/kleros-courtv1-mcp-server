# 🚀 Deploy to Railway

Railway is perfect for hosting MCP servers with long-running processes and stdio communication.

## Quick Deploy (5 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "Deploy from GitHub repo"
4. Select this repository
5. Railway will automatically:
   - Detect Node.js project
   - Run `yarn build`
   - Start with `yarn start`

### 3. Your MCP Server is Live! 🎉

Railway will provide:
- **Domain**: `your-app-name.up.railway.app`
- **Logs**: Real-time server logs
- **Metrics**: CPU, memory, network usage
- **Auto-deploys**: Every git push deploys automatically

## Configuration

The `railway.json` file configures:
- **Build**: Runs TypeScript compilation
- **Start**: Launches the MCP server
- **Restart**: Auto-restart on failures

## Free Tier Limits

✅ **500 hours/month** (enough for 24/7 if you're under the limit)  
✅ **1GB RAM, 1 vCPU**  
✅ **100GB bandwidth**  
✅ **Auto-sleep after 1 hour of inactivity** (keeps within limits)

## Using Your Deployed MCP Server

Once deployed, you can use your MCP server with:

### 1. Claude Desktop
Add to your MCP config:
```json
{
  "mcpServers": {
    "kleros-court": {
      "command": "node",
      "args": ["-e", "
        const { spawn } = require('child_process');
        const proc = spawn('curl', ['-N', 'https://your-app.up.railway.app/mcp'], {
          stdio: ['pipe', 'inherit', 'inherit']
        });
        process.stdin.pipe(proc.stdin);
      "]
    }
  }
}
```

### 2. Direct Connection
```bash
# Test the server
curl https://your-app.up.railway.app/health
```

## Environment Variables (Optional)

If you need any environment variables:
1. Go to your Railway project dashboard
2. Click "Variables" tab
3. Add your variables

## Logs & Monitoring

- **View logs**: Railway dashboard → your service → "Logs" tab
- **Monitor usage**: Dashboard shows CPU, memory, network metrics
- **Set alerts**: Get notified if service goes down

## Custom Domain (Optional)

1. In Railway dashboard → "Settings" → "Domains"
2. Add your custom domain
3. Configure DNS as shown

## Troubleshooting

**Build fails?**
- Check the build logs in Railway dashboard
- Ensure all dependencies are in package.json

**Server not responding?**
- Check logs for errors
- Verify the start command works locally

**Out of hours?**
- Upgrade to Railway Pro ($5/month)
- Or optimize for auto-sleep (server stops when not used)

Railway is perfect for MCP servers - deploy once and forget! 🚂 