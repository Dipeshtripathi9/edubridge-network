# Deploy EduBridge Network on Oracle Cloud (Always Free) + GoDaddy domain

One small server runs everything with Docker: Postgres, Redis, the NestJS API
(with WebSockets), the Next.js frontend, and Caddy (automatic HTTPS). Cost: **$0**
on Oracle's Always-Free tier.

> Elasticsearch is intentionally left out — search falls back to Postgres.

---

## 1. Create the server (Oracle Cloud)

1. Sign up at cloud.oracle.com (needs a card for identity; the tier below is free forever).
2. **Compute → Instances → Create instance**:
   - **Image:** Ubuntu 22.04
   - **Shape:** `VM.Standard.A1.Flex` (Ampere/ARM) → **2 OCPU, 12 GB RAM** (well within Always-Free: up to 4 OCPU / 24 GB).
   - Add your **SSH public key**.
   - Create. Note the **public IP**.
3. **Open ports** — Networking → your instance's **subnet → Security List → Add Ingress Rules**:
   - Source `0.0.0.0/0`, TCP, dest port **80**
   - Source `0.0.0.0/0`, TCP, dest port **443**
4. SSH in: `ssh ubuntu@<PUBLIC_IP>`
5. **Open the OS firewall too** (Oracle Ubuntu images block everything by default):
   ```bash
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
   sudo netfilter-persistent save
   ```

## 2. Install Docker
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER && newgrp docker
```

## 3. Get the code + configure
```bash
git clone https://github.com/Dipeshtripathi9/edubridge-network.git
cd edubridge-network
cp infra/.env.prod.example infra/.env.prod
nano infra/.env.prod         # fill in every REPLACE_... value
```
Generate the two JWT secrets with `openssl rand -hex 48` (each must be long, unique, and different). Set `DOMAIN`, the `NEXT_PUBLIC_*` URLs, `GOOGLE_CLIENT_ID`, and a strong `POSTGRES_PASSWORD` (use the same password inside `DATABASE_URL`).

## 4. Point your GoDaddy domain at the server
GoDaddy → your domain → **DNS → Manage Zones**, add three A records to your server's public IP:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `<PUBLIC_IP>` | 600 |
| A | `www` | `<PUBLIC_IP>` | 600 |
| A | `api` | `<PUBLIC_IP>` | 600 |

Wait a few minutes for DNS to propagate (`dig +short yourdomain.com` should return your IP).

Also add `https://yourdomain.com` to **Authorized JavaScript origins** in your Google OAuth client (console.cloud.google.com) or Google sign-in will fail.

## 5. Launch
```bash
docker compose -f infra/docker-compose.prod.yml --env-file infra/.env.prod up -d --build
```
First build takes a few minutes on ARM. The backend auto-runs DB migrations on start. Caddy fetches HTTPS certificates automatically once DNS resolves.

Check it:
```bash
docker compose -f infra/docker-compose.prod.yml ps
docker compose -f infra/docker-compose.prod.yml logs -f caddy   # watch cert issuance
```
Then open **https://yourdomain.com** 🎉

## 6. (Optional) Seed base data
```bash
docker compose -f infra/docker-compose.prod.yml exec backend npm run db:seed -w @edubridge/backend
```

## 7. Daily backups
```bash
chmod +x infra/backup.sh
( crontab -l 2>/dev/null; echo "0 2 * * * cd $HOME/edubridge-network && POSTGRES_USER=edubridge POSTGRES_DB=edubridge infra/backup.sh >> \$HOME/backup.log 2>&1" ) | crontab -
```

---

## Updating later
```bash
cd ~/edubridge-network && git pull
docker compose -f infra/docker-compose.prod.yml --env-file infra/.env.prod up -d --build
```

## Common issues
- **HTTPS not issuing:** DNS must resolve to the server and ports 80/443 must be open (both the Oracle Security List *and* the OS `iptables` step). Check `logs -f caddy`.
- **Backend restarts / “Refusing to start”:** a JWT secret or `DATABASE_URL` is missing/placeholder in `.env.prod`.
- **Google sign-in fails on the live site:** add the live origin to the Google OAuth client’s authorized origins, and confirm `NEXT_PUBLIC_GOOGLE_CLIENT_ID` was set at build time.
- **Changed a `NEXT_PUBLIC_*` value:** rebuild the web image (`up -d --build`) — those are baked in at build time.
