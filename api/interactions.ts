import { verifyKey, InteractionType, InteractionResponseType } from 'discord-interactions';
import type { IncomingMessage, ServerResponse } from 'http';
import { handleInteraction } from '../src/handlers/interactions';
import { connectDB } from '../src/lib/mongodb';
import { publicKey } from '../src/config';

// Desactivar bodyParser para que Vercel no altere el stream de bytes original de Discord
export const config = {
  api: {
    bodyParser: false,
  },
};

function readBodyStream(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

export default async function handler(req: any, res: any) {
  // Solo se admiten peticiones POST desde Discord
  if (req.method !== 'POST') {
    if (res.setHeader) {
      res.setHeader('Allow', 'POST');
      return res.status(405).send('Method Not Allowed');
    }
    return new Response('Method Not Allowed', { status: 405 });
  }

  let rawBody: string;
  let signature: string;
  let timestamp: string;

  if (typeof req.text === 'function') {
    // Si se invoca en un runtime Web Standard (Edge o Fetch API)
    signature = req.headers.get('x-signature-ed25519') || '';
    timestamp = req.headers.get('x-signature-timestamp') || '';
    rawBody = await req.text();
  } else {
    // Runtime estándar Node.js de Vercel
    signature = (req.headers['x-signature-ed25519'] as string) || '';
    timestamp = (req.headers['x-signature-timestamp'] as string) || '';
    rawBody = await readBodyStream(req);
  }

  const clientPublicKey = publicKey || process.env.DISCORD_PUBLIC_KEY || '';
  if (!clientPublicKey) {
    console.error('❌ DISCORD_PUBLIC_KEY no está configurada en las variables de entorno');
    if (res.status) {
      return res.status(500).send('Server configuration error: missing public key');
    }
    return new Response('Server configuration error: missing public key', { status: 500 });
  }

  // Verificar la firma criptográfica Ed25519 enviada por Discord
  const isValid = verifyKey(rawBody, signature, timestamp, clientPublicKey);
  if (!isValid) {
    if (res.status) {
      return res.status(401).send('Bad request signature');
    }
    return new Response('Bad request signature', { status: 401 });
  }

  let interaction: any;
  try {
    interaction = JSON.parse(rawBody);
  } catch (err) {
    if (res.status) {
      return res.status(400).send('Invalid JSON');
    }
    return new Response('Invalid JSON', { status: 400 });
  }

  // Discord PING - handshake requerido por Discord Developer Portal
  if (interaction.type === InteractionType.PING) {
    const pongResponse = { type: InteractionResponseType.PONG };
    if (res.status) {
      return res.status(200).json(pongResponse);
    }
    return new Response(JSON.stringify(pongResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Conectar a MongoDB de forma eficiente para Serverless
  await connectDB();

  // Procesar la interacción
  const response = await handleInteraction(interaction);

  if (res.status) {
    return res.status(200).json(response);
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

