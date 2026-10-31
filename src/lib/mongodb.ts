import mongoose from 'mongoose';
import { mongodb } from '../config';

let cachedConnection: typeof mongoose | null = null;

export async function connectDB(): Promise<typeof mongoose | null> {
  if (!mongodb) {
    return null;
  }

  // Si ya estamos conectados, reutilizar la conexión en caliente (Serverless warm container)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    cachedConnection = await mongoose.connect(mongodb, {
      bufferCommands: false,
    });
    return cachedConnection;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB en Vercel:', error);
    return null;
  }
}

export default connectDB;

