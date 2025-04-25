server {
    listen 80;
    listen [::]:80;
    
    server_name shop.epsiquad.ru;
    
    # Перенаправление HTTP на HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name shop.epsiquad.ru;
    
    # SSL-сертификаты
    ssl_certificate /root/cert/shop.epsiquad.ru/fullchain.pem
    ssl_certificate_key /root/cert/shop.epsiquad.ru/privkey.pem
    
    # Настройки SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # HSTS (по желанию)
    add_header Strict-Transport-Security "max-age=63072000; includeSubdomains; preload" always;
    
    # Оптимизация
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
        application/javascript
        application/json
        application/x-javascript
        application/xml
        application/xml+rss
        image/svg+xml
        text/css
        text/javascript
        text/plain
        text/xml;
    
    # Настройка root директории для статических файлов
    root /home/dovi/epsiquad-site/.next;
    
    # Кэширование статических файлов
    location /_next/static/ {
        alias /home/dovi/epsiquad-site/.next/static/;
        expires 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location /static/ {
        expires 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # Прокси для Next.js сервера
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Настройки буфера для предотвращения проблем с большими запросами
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # Запрет доступа к файлам .htaccess и другим скрытым файлам
    location ~ /\.(?!well-known) {
        deny all;
    }
    
    # Сообщаем браузерам, что сайт доступен только через HTTPS
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Логи
    access_log /var/log/nginx/epsiquad.access.log;
    error_log /var/log/nginx/epsiquad.error.log;
}