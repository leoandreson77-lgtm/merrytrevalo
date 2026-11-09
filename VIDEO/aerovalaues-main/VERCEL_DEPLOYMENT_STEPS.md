# 🚀 Deploy to Vercel - Step by Step Guide

## ✅ Prerequisites Checklist

Before deploying, ensure you have:
- [x] MongoDB Atlas account and cluster set up
- [x] Amadeus API credentials (Client ID & Secret)
- [x] Gmail account with App Password (for email notifications)
- [x] Code pushed to GitHub repository

---

## 📋 Step 1: Configure Environment Variables in Vercel

### Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Click on your project: **flightitude**
3. Go to **Settings** → **Environment Variables**

### Add These Variables (Copy exactly as shown):

#### ✅ REQUIRED Variables:

| Name | Value |
|------|-------|
| `AMADEUS_CLIENT_ID` | `jJG55GPYYKx0s6ctBD7uBrlbimu8M2Vs` |
| `AMADEUS_CLIENT_SECRET` | `oxza3aWmFmvtQA6Y` |
| `DATABASE_URL` | `mongodb+srv://sammaali12:Sameer123@cluster0.s3oneko.mongodb.net/flight_search?retryWrites=true&w=majority` |
| `NODE_ENV` | `production` |

#### 📧 EMAIL Variables (for booking notifications):

| Name | Value |
|------|-------|
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | `samm.aali12@gmail.com` |
| `EMAIL_PASS` | `levn xgql lgzs qqmo` |
| `EMAIL_BOOKINGS_TO` | `samm.aali12@gmail.com` |
| `EMAIL_OWNER` | `samm.aali12@gmail.com` |

**Important:** 
- Apply these to **Production**, **Preview**, and **Development** environments
- Click "Save" after adding each variable

---

## 📋 Step 2: Redeploy Your Application

After adding environment variables:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **three dots (⋯)** menu
4. Select **"Redeploy"**
5. Check **"Use existing Build Cache"** if available
6. Click **"Redeploy"**

**Wait 2-3 minutes** for deployment to complete.

---

## ✅ Step 3: Verify Deployment

### Test Frontend
1. Visit: **https://flightitude.com/**
2. You should see the flight search homepage
3. Favicon should appear in browser tab

### Test API Endpoints
1. Open browser console (F12)
2. Try searching: `DEL` → `BOM` with tomorrow's date
3. Check Network tab for API calls to `/api/flights/search`
4. Should return flight results (not errors)

### Test Booking Flow
1. Select a flight from search results
2. Click "Book Now"
3. Fill passenger details (name, passport, email OR phone)
4. Submit booking
5. Check for success message
6. Verify email received at `samm.aali12@gmail.com`

---

## 🔍 Troubleshooting

### ❌ Frontend Shows 404
**Solution:** 
- Verify `outputDirectory` in `vercel.json` is set to `dist/public`
- Check that build command ran successfully in deployment logs

### ❌ API Returns Errors
**Solution:**
- Go to Vercel → Deployments → Latest → "Functions" tab
- Click on `/api` function to see logs
- Verify all environment variables are set correctly
- Check that `DATABASE_URL` includes database name: `/flight_search`

### ❌ "Cannot connect to database"
**Solution:**
- Go to MongoDB Atlas → Network Access
- Add IP: `0.0.0.0/0` (allows all IPs - needed for Vercel)
- Wait 2-3 minutes for changes to propagate
- Redeploy on Vercel

### ❌ "Amadeus API error"
**Solution:**
- Verify `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET` are set
- Check credentials at [developers.amadeus.com](https://developers.amadeus.com)
- Ensure you're using **Test environment** credentials
- API quota: Free tier = 2000 calls/month

### ❌ Emails Not Sending
**Solution:**
- Verify Gmail App Password is correct (not regular password)
- App Password format: `xxxx xxxx xxxx xxxx` (with spaces)
- Check spam folder
- Verify 2FA is enabled on Gmail account
- Generate new App Password at: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

---

## 📊 Check Deployment Logs

1. Go to Vercel → Deployments → Latest deployment
2. Click **"View Function Logs"** 
3. Click on `/api` function
4. Check for errors in real-time logs

Common log messages:
- ✅ `POST /api/bookings 200 in 1234ms` - Success
- ❌ `MongoServerError: bad auth` - Database credentials wrong
- ❌ `Amadeus API error` - API credentials wrong

---

## 🎯 Expected Behavior After Successful Deployment

✅ Homepage loads at https://flightitude.com  
✅ Airport autocomplete works (try typing "Delhi")  
✅ Date picker shows future dates  
✅ Flight search returns real results from Amadeus API  
✅ Booking page shows full flight details (route, amenities, luggage)  
✅ Location names display with codes (e.g., "Delhi (DEL)")  
✅ Booking form accepts email OR phone (not both required)  
✅ Owner receives "New Flight Query" email  
✅ Customer receives "We Will Contact You Back" email  

---

## 📱 Next Steps After Deployment

### Custom Domain (Optional)
1. Go to Settings → Domains
2. Add your domain (e.g., `flightsearch.com`)
3. Update DNS records as shown
4. Wait for SSL certificate (automatic)

### Production Amadeus API
1. Upgrade at [developers.amadeus.com](https://developers.amadeus.com)
2. Get Production credentials
3. Update `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET` in Vercel
4. Redeploy

### Analytics (Optional)
1. Go to Settings → Analytics
2. Enable Web Analytics
3. View traffic, performance metrics

---

## 🆘 Still Having Issues?

1. **Check Build Logs:**
   - Vercel → Deployments → Latest → View Build Logs
   - Look for `npm run build` errors

2. **Check Function Logs:**
   - Vercel → Deployments → Latest → Functions → `/api`
   - See real-time API errors

3. **Test Locally First:**
   ```bash
   npm run build
   npm start
   ```
   Visit http://localhost:5000

4. **Compare Environment Variables:**
   - Make sure `.env` (local) matches Vercel environment variables
   - Check for typos in variable names

---

## ✅ Deployment Successful!

Your Flight Search Engine is now live at:
**🌐 https://flightitude.com**

**Features:**
- ✈️ Real-time flight search with Amadeus API
- 🏙️ Airport names with IATA codes
- 🎒 Amenities and luggage display
- 📧 Dual email notifications (owner + customer)
- 📱 Email OR phone required (flexible)
- 🎨 Responsive design with Tailwind CSS
- ⚡ Serverless deployment on Vercel

**Need help?** Check the [DEPLOYMENT.md](./DEPLOYMENT.md) file for detailed documentation.
