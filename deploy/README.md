# Despliegue en VPS

El workflow de `.github/workflows/deploy.yml` construye la imagen en GitHub Actions, la publica en GHCR y actualiza el VPS al hacer push a `main`. El VPS no compila el proyecto.

## Preparar el VPS una vez

En el VPS, como `root`:

```bash
apt update
apt install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
mkdir -p /opt/forma
```

Crear `/opt/forma/.env` con valores reales:

```dotenv
IMAGE_NAME=ghcr.io/jonathanvolker/dynamic-web:main
DOMAIN=:80
PUBLIC_URL=http://201.32.129.6
PAYLOAD_SECRET=una-cadena-aleatoria-de-al-menos-32-caracteres
COOKIE_SECURE=false
```

Mientras el dominio está en validación, `DOMAIN=:80` permite probar por HTTP usando la IP. Cuando el dominio esté activo, cambiar ambos valores a `DOMAIN=tu-dominio.com` y `PUBLIC_URL=https://tu-dominio.com`, y cambiar `COOKIE_SECURE=true`.

El workflow autentica el VPS contra GHCR, por lo que el paquete puede permanecer privado. El token solo necesita permiso de lectura de paquetes.

## Secrets de GitHub

Crear un environment llamado `production` y agregar:

- `VPS_HOST`: `201.32.129.6`
- `VPS_USER`: `root` inicialmente
- `DEPLOY_PATH`: `/opt/forma`
- `VPS_SSH_KEY`: contenido de la clave privada que GitHub usará para conectarse
- `VPS_KNOWN_HOSTS`: salida de `ssh-keyscan -H 201.32.129.6` ejecutada desde un entorno confiable
- `GHCR_USERNAME`: usuario de GitHub que creó el token
- `GHCR_TOKEN`: token de GitHub con permiso `read:packages`

No subir `.env`, claves privadas ni tokens al repositorio.

## Primer despliegue

Después de crear los secrets, el primer push a `main` ejecutará las verificaciones, publicará `ghcr.io/jonathanvolker/dynamic-web:main`, copiará el Compose y Caddyfile, y reiniciará la aplicación.
