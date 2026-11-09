# Vercel Deployment Guide

This guide will help you deploy your Flight Search Engine to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a cloud MongoDB database at [mongodb.com/atlas](https://www.mongodb.com/atlas)
3. **Amadeus API Credentials**: Get API keys from [developers.amadeus.com](https://developers.amadeus.com)
4. **Gmail App Password**: For sending booking emails (optional)

## Step-by-Step Deployment

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Push to GitHub

Make sure your code is pushed to GitHub (already done):
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 3. Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `sameerali001/flightitude`
3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4. Configure Environment Variables

In the Vercel dashboard, add these environment variables:

#### Required Variables:

```bash
# Amadeus API (REQUIRED)
AMADEUS_CLIENT_ID=your_amadeus_client_id_here
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret_here

# MongoDB (REQUIRED)
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/flight-search?retryWrites=true&w=majority

# Node Environment (REQUIRED)
NODE_ENV=production
```

#### Optional Variables (Email Features):

```bash
# Email Configuration (for booking notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_BOOKINGS_TO=owner@example.com
EMAIL_OWNER=owner@example.com

# Session Secret (for authentication)
SESSION_SECRET=generate-a-random-string-here
```

#### Optional Variables (Google Sheets Logging):

```bash
GOOGLE_SHEETS_CREDENTIALS={"type":"service_account","project_id":"..."}
GOOGLE_SHEET_ID=your_google_sheet_id
```

### 5. Deploy

Click **"Deploy"** and wait for the build to complete.

## Getting Your API Credentials

### Amadeus API Keys

1. Visit [developers.amadeus.com](https://developers.amadeus.com)
2. Create a free account
3. Go to "My Self-Service Workspace"
4. Create a new app
5. Copy your **API Key** (Client ID) and **API Secret** (Client Secret)
6. Start with **Test environment** credentials (free)

### MongoDB Atlas Connection String

1. Visit [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster (M0 Sandbox)
3. Create a database user (Database Access)
4. Whitelist IP addresses (Network Access) - Add `0.0.0.0/0` for Vercel
5. Click "Connect" → "Connect your application"
6. Copy the connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/`)
7. Replace `<password>` with your actual password
8. Add database name: `mongodb+srv://user:pass@cluster.mongodb.net/flight-search`

### Gmail App Password (for email features)

1. Enable 2-Factor Authentication on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Create an app password for "Mail"
4. Copy the 16-character password
5. Use this as `EMAIL_PASS` (not your regular Gmail password)

## Vercel CLI Deployment (Alternative)

If you prefer using the CLI:

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts to link to your project
```

## Post-Deployment

### Test Your Deployment

1. Visit your deployment URL: `https://your-project.vercel.app`
2. Test flight search functionality
3. Try booking a flight to test email notifications
4. Check Vercel logs if any errors occur

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Build Fails

- Check Vercel build logs for detailed error messages
- Ensure all dependencies are in `package.json`
- Verify `vercel-build` script exists

### API Not Working

- Verify environment variables are set correctly
- Check that `DATABASE_URL` includes the database name
- Test Amadeus credentials in the test environment first

### CORS Errors

- The Express backend should already handle CORS
- Check `server-js/index.js` for CORS middleware

### Email Not Sending

- Verify Gmail app password (not regular password)
- Check that `EMAIL_USER` and `EMAIL_PASS` are set
- Ensure 2FA is enabled on your Google account

### Database Connection Issues

- Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
- Verify connection string format
- Check database user permissions

## Environment Variables Reference

Copy `.env.example` to see all available configuration options:

```bash
cp .env.example .env.local
```

## Support

For issues specific to:
- **Vercel Deployment**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Amadeus API**: [developers.amadeus.com/support](https://developers.amadeus.com/support)

## Notes

- Vercel's free tier includes:
  - 100GB bandwidth/month
  - Serverless function execution
  - Automatic HTTPS
  - Preview deployments for each push

- MongoDB Atlas free tier (M0):
  - 512 MB storage
  - Shared RAM
  - Suitable for development/testing

- Amadeus Test Environment:
  - Free to use
  - Limited to test data
  - Upgrade to Production for real flight data
