# Cloudflare Setup Guide

Follow these steps to point `dnbcoaching.com` to your VPS while keeping Cloudflare's protections active.

## 1. Get Your VPS IP Address
Run this on your VPS to get your public IP (or check your hosting dashboard):
```bash
curl -4 icanhazip.com
```
*We will refer to this as `YOUR_VPS_IP`.*

## 2. Cloudflare DNS Settings
1. Log in to your Cloudflare Dashboard.
2. Select your domain (`dnbcoaching.com`).
3. Go to **DNS** > **Records**.
4. Add the following records:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| **A** | `@` (root) | `YOUR_VPS_IP` | **Proxied** (Orange Cloud) |
| **A** | `www` | `YOUR_VPS_IP` | **Proxied** (Orange Cloud) |

*Delete any conflicting A or CNAME records for `@` or `www`.*

## 3. Cloudflare SSL/TLS Settings
1. Go to **SSL/TLS** > **Overview**.
2. Set the encryption mode to **Full** (or **Full (Strict)**).
   * **Do NOT use "Flexible"** if you follow the Nginx setup in `DEPLOY.md` (which sets up proper HTTPS). "Flexible" can cause infinite redirect loops if your server forces HTTPS.

## 4. VPS Configuration (Nginx)
Cloudflare sends traffic to port 80 (HTTP) and 443 (HTTPS). Your app runs on port 3000. **You MUST use Nginx** to bridge this gap.

**Follow the "Setup Nginx with HTTPS" section in `DEPLOY.md`**.

1. Install Nginx.
2. Configure the block to listen on 80.
3. Run the Certbot command (`sudo certbot --nginx ...`).
   * Certbot will install a valid SSL certificate on your VPS. This allows Cloudflare to talk to your VPS securely (enabling "Full" SSL mode).

## Troubleshooting
- **Error 521 (Web Server is Down)**: Nginx is not running or not configured correctly to forward to port 3000.
  - Check Nginx: `sudo systemctl status nginx`
  - Check App: `pm2 list` (App must be online)
- **Error 522 (Connection Timed Out)**: Firewall blocking Cloudflare.
  - Run: `sudo ufw allow 'Nginx Full'`
- **Too Many Redirects**:
  - Check SSL Mode in Cloudflare. If set to "Flexible" but your server does HTTPS redirects, switch Cloudflare to "Full".
