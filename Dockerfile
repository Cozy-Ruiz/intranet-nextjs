# -------- Build Stage --------
FROM node:26 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -------- Production Stage  --------
FROM node:26-slim

ARG ORACLE_IC_VERSION=23.26.0.0.0
ARG ORACLE_IC_BUILD=2326000

RUN apt-get update \
	&& (apt-get install -y --no-install-recommends ca-certificates curl unzip libaio1t64 \
			|| apt-get install -y --no-install-recommends ca-certificates curl unzip libaio1) \
	&& mkdir -p /opt/oracle \
	&& curl -fL "https://download.oracle.com/otn_software/linux/instantclient/${ORACLE_IC_BUILD}/instantclient-basic-linux.arm64-${ORACLE_IC_VERSION}.zip" \
			 -o /tmp/instantclient.zip \
	&& unzip -q /tmp/instantclient.zip -d /opt/oracle \
	  && oracle_lib=$(find /opt/oracle/instantclient_23_26 -maxdepth 1 -type f -name 'libclntsh.so.*' -print -quit) \
	  && test -n "$oracle_lib" \
	  && ln -sfn "$oracle_lib" /opt/oracle/instantclient_23_26/libclntsh.so \
	&& echo /opt/oracle/instantclient_23_26 > /etc/ld.so.conf.d/oracle-instantclient.conf \
	&& ldconfig \
	&& rm -f /tmp/instantclient.zip \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_23_26

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]
