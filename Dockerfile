# Imagem do LIVE. Versões espelham docs/STACK.md §7.
FROM dunglas/frankenphp:php8.5 AS base
RUN install-php-extensions bcmath gd intl pcntl pdo_mysql zip opcache
WORKDIR /app

# Build: precisa de PHP + Node juntos (o plugin Wayfinder roda artisan no build do Vite).
FROM base AS build
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY --from=node:26-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:26-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN composer dump-autoload --optimize --no-dev \
    && php artisan package:discover \
    && npm run build \
    && rm -rf node_modules

FROM base
ENV SERVER_NAME=:80
COPY --from=build /app /app
COPY docker/Caddyfile /etc/frankenphp/Caddyfile
RUN chown -R www-data:www-data storage bootstrap/cache
EXPOSE 80
# config/rotas/views em cache com o env real do container; migrations NÃO rodam aqui.
CMD ["sh", "-c", "php artisan optimize && exec frankenphp run --config /etc/frankenphp/Caddyfile"]
