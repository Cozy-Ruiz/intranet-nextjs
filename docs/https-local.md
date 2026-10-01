# Prueba local de HTTPS con Kubernetes de Docker

Los cuatro hosts de prueba son:

- `intranet-nextjs-dev.escalante.com.mx`
- `intranet-nextjs-prod.escalante.com.mx`
- `intranet-php-dev.escalante.com.mx`
- `intranet-php-prod.escalante.com.mx`

Antes de cambiar DNS, agregarlos temporalmente a `/etc/hosts` apuntando a `127.0.0.1`.

El certificado debe incluir la cadena completa y corresponder a `*.escalante.com.mx`. Crear el Secret local sin guardar el certificado en Git:

```sh
kubectl create secret tls escalante-wildcard-tls \
  --cert=/ruta/al/fullchain.crt \
  --key=/ruta/a/la/llave.key \
  --dry-run=client -o yaml | kubectl apply -f -
```

Desplegar los charts usando las imágenes ya disponibles en Docker Desktop:

```sh
helm upgrade --install intranet-nextjs-dev ./helm/intranet-nextjs -f ./helm/intranet-nextjs/values-dev.yaml
helm upgrade --install intranet-nextjs-prod ./helm/intranet-nextjs -f ./helm/intranet-nextjs/values-prod.yaml
helm upgrade --install intranet-php-dev ../intranet-php/helm/intranet-php -f ../intranet-php/helm/intranet-php/values-dev.yaml
helm upgrade --install intranet-php-prod ../intranet-php/helm/intranet-php -f ../intranet-php/helm/intranet-php/values-prod.yaml
```

Verificar HTTPS con el navegador y con `curl -I` para confirmar la redirección desde HTTP. Los cambios de `/etc/hosts` deben retirarse después de publicar los registros DNS.

## Secretos de GitHub

En los ambientes `development` y `production` de cada repositorio, crear estos secretos:

- `TLS_CRT_BASE64`: certificado con la cadena completa, codificado en Base64 sin saltos de línea.
- `TLS_KEY_BASE64`: llave privada, codificada en Base64 sin saltos de línea.

Los workflows crean o actualizan el Secret de Kubernetes `escalante-wildcard-tls`. La llave nunca se incorpora a la imagen ni a variables de la aplicación.
