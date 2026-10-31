# ⚡ ucbot - Vercel Serverless Edition (Discord HTTP Interactions)

Versión serverless de **ucbot** diseñada exclusivamente para ejecutarse en **Vercel** mediante **Discord HTTP Interactions** y **Slash Commands**.

> 🚀 **Sin WebSockets · 0 Gateway Intents · Sin procesos en segundo plano**  
> El bot responde a eventos en milisegundos mediante funciones Serverless en Vercel, verificando criptográficamente cada petición con Ed25519 (`DISCORD_PUBLIC_KEY`).

---

## 📋 Características

- **100% Interacciones HTTP:** No requiere mantener un proceso Node.js encendido ni conexión Gateway continua.
- **Validación Criptográfica:** Firma de peticiones verificada con `discord-interactions` y `ed25519`.
- **Slash Commands Nativos:** Integración con Discord REST API v10 y Builders.
- **Base de Datos Serverless:** Conexión a MongoDB con reutilización de socket en caliente (*warm container caching*).
- **Despliegue Instantáneo en Vercel:** Compatible de forma nativa con Vercel Serverless Functions.

---

## 🛠️ Comandos Disponibles (`/`)

| Comando | Categoría | Descripción | Permisos |
| :--- | :--- | :--- | :--- |
| `/ping` | Info | Consulta el estado y tiempo de respuesta en Vercel | Ninguno |
| `/help [comando]` | Info | Muestra la guía de comandos disponibles o detalles de uno | Ninguno |
| `/ban <usuario> [razon]` | Moderación | Banea a un miembro del servidor mediante Discord REST | `Ban Members` |
| `/kick <usuario> [razon]` | Moderación | Expulsa a un miembro del servidor mediante Discord REST | `Kick Members` |
| `/mute <usuario> <tiempo> [razon]` | Moderación | Aplica aislamiento temporal (Timeout) (ej: `10m`, `1h`, `1d`) | `Moderate Members` |
| `/unmute <usuario> [razon]` | Moderación | Retira el aislamiento temporal a un miembro | `Moderate Members` |
| `/warn <usuario> [razon]` | Moderación | Registra una advertencia a un miembro en MongoDB | `Moderate Members` |
| `/unwarn <usuario> <id_warn>` | Moderación | Remueve un aviso específico de un miembro por su índice | `Moderate Members` |
| `/warnings [usuario]` | Moderación | Consulta el historial de advertencias de un usuario | Ninguno |
| `/leaderboard-warns` | Moderación | Top 10 de usuarios con mayor cantidad de advertencias | Ninguno |
| `/leaderboard-warners` | Moderación | Top 10 de moderadores con más advertencias emitidas | Ninguno |

---

## 🚀 Despliegue en Vercel

### 1. Variables de Entorno en Vercel
En la configuración de tu proyecto en el panel de Vercel (**Settings** -> **Environment Variables**), agrega:

```env
DISCORD_TOKEN=tu_token_de_bot
DISCORD_APPLICATION_ID=tu_application_id_o_client_id
DISCORD_PUBLIC_KEY=tu_public_key_de_discord_developer_portal
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/ucbot
BOT_COLOR=#ffc600
```

> [!IMPORTANT]
> La variable `DISCORD_PUBLIC_KEY` la encuentras en el [Discord Developer Portal](https://discord.com/developers/applications) en la pestaña **General Information** -> **PUBLIC KEY**. Es indispensable para la validación de peticiones.

### 2. Configurar la URL en Discord Developer Portal
1. Entra a tu aplicación en [Discord Developer Portal](https://discord.com/developers/applications).
2. En la pestaña **General Information**, busca el campo **"Interactions Endpoint URL"**.
3. Pega la URL de tu despliegue en Vercel:
   ```text
   https://tu-proyecto.vercel.app/api/interactions
   ```
4. Haz clic en **Save Changes**. Discord enviará un ping automático (`type: 1`). El bot responderá con `PONG` y la URL quedará guardada exitosamente.

---

## 📡 Registro de Slash Commands

Para registrar o actualizar los Slash Commands en Discord:

```bash
# Registrar comandos de forma global
bun run deploy-commands
# o con npm:
npm run deploy-commands
```

> [!TIP]
> Si deseas registrar comandos de forma instantánea en un servidor de prueba sin esperar la propagación de Discord, añade `DISCORD_DEV_GUILD_ID=tu_guild_id` a tu archivo `.env`.

---

## 💻 Desarrollo Local

Puedes probar el bot localmente exponiendo el puerto 3000 con herramientas como `cloudflared` o `ngrok`:

```bash
# 1. Iniciar servidor de desarrollo local
bun run dev

# 2. En otra terminal, exponer el puerto a internet
cloudflared tunnel --url http://localhost:3000
```
Luego copia la URL generada (`https://.../api/interactions`) y colócala en el campo **Interactions Endpoint URL** de Discord.

---

## 📁 Estructura del Proyecto

```text
├── api/
│   └── interactions.ts       # Serverless Function principal de Vercel (Endpoint)
├── scripts/
│   └── deploy-commands.ts    # Script CLI para registrar Slash Commands en Discord
├── src/
│   ├── commands/             # Comandos modulares por categoría
│   │   ├── Info/
│   │   └── Moderacion/
│   ├── config/               # Carga y validación de variables de entorno
│   ├── handlers/             # Despachador de interacciones y permisos
│   ├── lib/                  # Conexión Mongoose singleton y Discord REST
│   ├── models/               # Modelos Mongoose (warns)
│   ├── types/                # Definiciones de TypeScript
│   ├── dev-server.ts         # Servidor HTTP local para testing
│   └── index.ts              # Entrypoint de desarrollo local
├── vercel.json               # Configuración de rutas y rewrites de Vercel
├── .env.example              # Plantilla de variables de entorno
└── package.json              # Scripts y dependencias
```
