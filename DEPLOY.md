# Deployment Guide (Ubuntu VPS)

This guide will help you deploy the DNB Coaching bot to an Ubuntu VPS in under 10 minutes.

## Prerequisites

- An Ubuntu VPS (20.04 or 22.04 LTS recommended)
- SSH access
- Root or sudo privileges

## 1. Install Node.js (v20+)

Run these commands on your VPS:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install curl
sudo apt install -y curl

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

## 2. Upload Your Code

You can use `rsync`, `scp`, or `git` to get your code onto the VPS.
If using git (recommended):

```bash
# Install git
sudo apt install -y git

# Clone your repository
git clone <your-repo-url> dnbcoaching
cd dnbcoaching
```

If uploading manually, copy all files **excluding** `node_modules` and `.data`.

## 3. Install Dependencies & Build

```bash
# Install dependencies
npm install

# Build the frontend
npm run build
```

## 4. Environment Configuration

Create a `.env` file with your production keys:

```bash
nano .env
```

Paste the following (replace with your real keys):

```env
PORT=3000
NODE_ENV=production
ADMIN_PASSWORD=YourStrongPaswordHere
OPENAI_API_KEY=sk-proj-YOUR-OPENAI-KEY
OPENAI_MODEL=gpt-4o-mini
VITE_RESEND_API_KEY=re_YOUR_RESEND_KEY
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

## 5. Start the Server (Production Mode)

We'll use `pm2` to keep the app running in the background and restart it if it crashes.

```bash
# Install pm2 globally
sudo npm install -g pm2

# Start the application
pm2 start npm --name "dnbcoaching" -- start

# Save the process list so it restarts on reboot
pm2 save
pm2 startup
```

(Follow the instructions output by `pm2 startup` if any).

## 6. Access Your App

Your app should now be running on `http://<YOUR_VPS_IP>:3000`.

### (Optional) Setup Nginx with HTTPS

If you want a domain name (e.g., dnbcoaching.com) and HTTPS:

1. **Install Nginx**: `sudo apt install -y nginx`
2. **Configure Nginx**:
   `sudo nano /etc/nginx/sites-available/dnbcoaching`
   
   ```nginx
   server {
       listen 80;
       server_name dnbcoaching.com www.dnbcoaching.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
3. **Enable Site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/dnbcoaching /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```
4. **Get SSL (Certbot)**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d dnbcoaching.com -d www.dnbcoaching.com
   ```

## Notes

- **Database**: The app now uses a local SQLite database stored in `.data/dnbcoaching.db`. This file will persist on the server.
- **Backups**: You should periodically backup the `.data` directory.
