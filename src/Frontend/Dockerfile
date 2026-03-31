FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Optional at build time for sitemap/robots generation
ARG VITE_PUBLIC_SITE_URL
ENV VITE_PUBLIC_SITE_URL=${VITE_PUBLIC_SITE_URL}

# Optional at build time for Google Identity Services
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}

RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

