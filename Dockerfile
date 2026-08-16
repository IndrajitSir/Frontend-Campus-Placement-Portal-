# Frontend — Campus Placement UI (React + Vite), served by nginx

# ---- Build stage ----
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# API base URL is baked into the bundle at build time. It must be reachable
# from the *browser*, so it defaults to the published backend port on the host.
ARG VITE_API_URL=http://localhost:6005
ARG VITE_API_VERSION=2
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_VERSION=$VITE_API_VERSION

RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
