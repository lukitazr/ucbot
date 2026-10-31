import mongoose, { Schema, Document } from 'mongoose';

export interface ISetup extends Document {
  guildID: string;
  reaccion_roles: any[];
  sistema_tickets: {
    canal: string;
    mensaje: string;
  };
  sugerencias: string;
  torneo: {
    canal: string;
  };
  basurero?: string;
}

const setupSchema = new Schema<ISetup>({
  guildID: { type: String, required: true },
  reaccion_roles: { type: Array, default: [] } as any,
  sistema_tickets: {
    type: Object,
    default: { canal: '', mensaje: '' }
  },
  sugerencias: { type: String, default: '' },
  torneo: {
    type: Object,
    default: { canal: '' }
  },
  basurero: { type: String, default: '' },
});

const model = mongoose.model<ISetup>('Configuraciones', setupSchema);

export default model;
