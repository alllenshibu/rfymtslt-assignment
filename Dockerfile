FROM node:18-alpine AS builder

WORKDIR /app

RUN npm install

RUN npm run build  

FROM node:18-alpine

COPY --from=builder /app/dist .

ENV PORT=80

CMD ["app.js"]
