# 🚀 Render Deployment Guide

Deploy your Flight Search Engine to Render with this step-by-step guide.

## ✅ Why Render?

- ✅ **Free Tier Available** - Great for testing and small projects
- ✅ **Auto-deploys from GitHub** - Push to deploy
- ✅ **Built-in SSL** - HTTPS out of the box
- ✅ **No serverless complexity** - Traditional Node.js server
- ✅ **Easy environment variables** - Simple configuration

---

## 📋 Prerequisites

Before deploying, ensure you have:
- [x] GitHub account with your code pushed
- [x] Render account (sign up at [render.com](https://render.com))
- [x] MongoDB Atlas database URL
- [x] Amadeus API credentials

---

## 🚀 Step-by-Step Deployment

### Step 1: Sign Up / Log In to Render

1. Go to [render.com](https://render.com)
2. Sign up or log in with your GitHub account
3. Authorize Render to access your repositories

### Step 2: Create New Web Service

1. Click **"New +"** button in top right
2. Select **"Web Service"**
3. Connect your GitHub repository: `sameerali001/flightitude`
4. Click **"Connect"**

### Step 3: Configure the Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `flight-search-engine` (or your preferred name) |
| **Region** | Choose closest to you (e.g., Oregon, Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | Leave blank |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | `Free` (or paid plan for better performance) |

### Step 4: Add Environment Variables

Click **"Advanced"** to expand environment variables section, then add:

#### Required Variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `HOST` | `0.0.0.0` |
| `DATABASE_URL` | `mongodb+srv://sammaali12:Sameer123@cluster0.s3oneko.mongodb.net/?appName=Cluster0` |
| `AMADEUS_CLIENT_ID` | `jJG55GPYYKx0s6ctBD7uBrlbimu8M2Vs` |
| `AMADEUS_CLIENT_SECRET` | `oxza3aWmFmvtQA6Y` |

#### Optional (Email Notifications):

| Key | Value |
|-----|-------|
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | `samm.aali12@gmail.com` |
| `EMAIL_PASS` | `levn xgql lgzs qqmo` |
| `EMAIL_BOOKINGS_TO` | `samm.aali12@gmail.com` |
| `EMAIL_OWNER` | `samm.aali12@gmail.com` |

### Step 5: Deploy

1. Click **"Create Web Service"** button at the bottom
2. Render will start building your app
3. Wait for the build to complete (2-5 minutes)
4. Your app will be live at: `https://flight-search-engine.onrender.com`

---

## 🔄 Auto-Deploy on Git Push

Once configured, Render automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "your changes"
git push origin main
```

Render will detect the push and redeploy automatically! 🎉

---

## 📊 Monitor Your Deployment

### View Logs
1. Go to your service dashboard
2. Click **"Logs"** tab
3. See real-time server logs

### Check Health
- Render automatically pings your `/` endpoint
- Service status shown in dashboard

---

## 🐛 Troubleshooting

### Build Failed?
- Check **Logs** tab for error messages
- Verify all environment variables are set
- Ensure `package.json` scripts are correct

### App Not Loading?
- Check if `PORT` is set to `10000`
- Verify `NODE_ENV=production`
- Check MongoDB connection string is correct

### Amadeus API Not Working?
- Verify `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET`
- Check API credentials are for test environment
- Review API logs in Render dashboard

---

## 💰 Free Tier Limitations

Render's free tier includes:
- ✅ 750 hours/month of runtime
- ✅ Automatic SSL
- ✅ Custom domains
- ⚠️ App sleeps after 15 minutes of inactivity (cold starts)
- ⚠️ 512 MB RAM limit

For production, consider upgrading to a paid plan ($7/month starter).

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** to GitHub
2. **Use Render's environment variables** for secrets
3. **Rotate API keys** periodically
4. **Enable MongoDB IP whitelist** (allow all: `0.0.0.0/0` for Render)

---

## 📱 Custom Domain (Optional)

1. Go to your web service settings
2. Scroll to **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Follow DNS configuration instructions

---

## ✅ Deployment Checklist

- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Build & start commands configured
- [ ] All environment variables added
- [ ] First deployment successful
- [ ] App accessible at Render URL
- [ ] Flight search working
- [ ] Booking system functional
- [ ] Email notifications working (if configured)

---

## 🎉 You're Live!

Your app is now deployed on Render! Share your URL:
`https://your-app-name.onrender.com`

### Next Steps:
- Test all features thoroughly
- Set up custom domain (optional)
- Monitor logs for any issues
- Consider upgrading plan for better performance

---

## 🆚 Render vs Vercel Comparison

| Feature | Render | Vercel |
|---------|--------|--------|
| **Free Tier** | ✅ 750 hrs/month | ✅ Generous limits |
| **Node.js Support** | ✅ Native | ✅ Serverless |
| **Cold Starts** | ~30s (free tier) | Minimal |
| **Setup** | Simple | Very simple |
| **Best For** | Traditional apps | Serverless/Edge |

Both are excellent choices! Render is great for full-stack Node.js apps like yours.
