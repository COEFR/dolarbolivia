#!/bin/bash
# Deploy DólarBolivia after build
cd /root/dolar-bolivia-proyecto/happy-badger-beam
pnpm build && \
rm -rf /var/www/dolarbolivia/* && \
cp -r dist/* /var/www/dolarbolivia/ && \
chown -R www-data:www-data /var/www/dolarbolivia && \
python3 /root/.hermes/scripts/rate_history.py history 7 > /var/www/dolarbolivia/history.json && \
sed -i 's|<title>.*</title>|<title>DólarBolivia</title>|' /var/www/dolarbolivia/index.html && \
systemctl reload nginx && \
echo "✅ Deployed to https://dolarbolivia.site"
