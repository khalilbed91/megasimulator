#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/opt/megasimulator
ARCHIVE=${1:-/tmp/megasim-deploy.tgz}

rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"
tar -xzf "$ARCHIVE" -C "$APP_DIR"
cd "$APP_DIR"

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y ca-certificates curl git ufw openssl nginx

if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  # shellcheck disable=SC1091
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

if [[ ! -f /opt/megasimulator/.env ]]; then
  JWT__KEY="$(openssl rand -base64 48)"
  umask 077
  cat > /opt/megasimulator/.env <<EOF
JWT__KEY=${JWT__KEY}
JWT__ISSUER=megasimulateur
FRONTEND__URL=https://megasimulateur.org
GOOGLE__REDIRECT=https://megasimulateur.org/api/auth/google/callback
VITE_PUBLIC_SITE_URL=https://megasimulateur.org
GOOGLE__CLIENTID=874107145454-8vao5905rvg7v56h6rustrk3dbbbul62.apps.googleusercontent.com
EOF
fi

docker compose -f docker-compose.deploy.yml --env-file /opt/megasimulator/.env up -d --build

if [[ -f /opt/megasimulator/deploy/megasimulateur.nginx.conf ]]; then
  cp /opt/megasimulator/deploy/megasimulateur.nginx.conf /etc/nginx/sites-available/megasimulateur.conf
else
  cat >/etc/nginx/sites-available/megasimulateur.conf <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name megasimulateur.org www.megasimulateur.org;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
fi

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/megasimulateur.conf /etc/nginx/sites-enabled/megasimulateur.conf
nginx -t
systemctl enable nginx
systemctl restart nginx

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "Done. Set Cloudflare SSL/TLS encryption mode to Flexible (origin is HTTP :80)."
echo "See deploy/DEPLOY.md for updates, env vars, PostgreSQL SSH tunnel, and troubleshooting."
