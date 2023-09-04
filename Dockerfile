FROM node:20-bookworm

COPY . /data
WORKDIR /data

RUN npm i

CMD npm run build && npm run preview -- --host
