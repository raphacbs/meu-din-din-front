# Etapa 1: Build da aplicação Next.js
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Recebe a variável do GitHub Actions
ARG NEXT_PUBLIC_API_URL
# Disponibiliza a variável para o processo de build do Node
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Executa o build (lembre-se de ter output: 'export' no next.config.js)
RUN npm run build

# Etapa 2: Servidor Web Nginx (Super leve para Produção)
FROM nginx:alpine
# Remove a página padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*
# Copia os arquivos estáticos gerados na pasta 'out'
COPY --from=builder /app/out /usr/share/nginx/html
# Configuração do Nginx para lidar com o roteamento do React/Next.js
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]