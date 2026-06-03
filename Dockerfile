
# ===== PRODUCTION BUILD STAGE =====
FROM node:18 AS build-stage

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ===== PRODUCTION SERVE STAGE =====
FROM nginx:stable-alpine AS production

# Salin file konfigurasi nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin hasil build ke direktori nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]