import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command, ExtendedClient } from '../../types';
import warnSchema from '../../models/warns';

const command: Command = {
  name: 'leaderboard-warners',
  aliases: ['warners-g', 'warners-server', 'leader-warners', 'staff'],
  desc: 'Muestra la tabla de clasificación de los usuarios que dieron más warns en el servidor',
  slashBuilder: new SlashCommandBuilder()
    .setName('leaderboard-warners')
    .setDescription('Muestra la tabla de clasificación de los usuarios que dieron más warns en el servidor'),
  async run(
    _client: ExtendedClient,
    message: Message | null,
    _args: string[],
    _prefix: string,
    _interaction: ChatInputCommandInteraction | null,
  ): Promise<void> {
    if (!message || !message.guild) return;

    // Obtener todos los documentos de warnSchema
    const allWarns = await warnSchema.find();

    // Crear un objeto para almacenar el número total de warnings para cada usuario
    const warnsByUser: { [key: string]: number } = {};

    // Iterar a través de cada documento en la colección de warnSchema
    allWarns.forEach((warn) => {
      // Iterar a través de los warnings de cada usuario
      if (warn.warnings && Array.isArray(warn.warnings)) {
        warn.warnings.forEach((warning: any) => {
          // Incrementar el número total de warnings para este usuario
          const user = warning.autor;
          if (warnsByUser[user]) {
            warnsByUser[user]++;
          } else {
            warnsByUser[user] = 1;
          }
        });
      }
    });

    // Ordenar el objeto de número total de warnings por valor, de mayor a menor
    const sortedWarnsByUser = Object.entries(warnsByUser)
      .sort((a, b) => b[1] - a[1]);

    if (sortedWarnsByUser.length === 0) {
      await message?.reply('No hay datos de warns en el servidor.');
      return;
    }

    // Crear un mensaje con la tabla de líderes
    const leaderboard = sortedWarnsByUser.map(([userId, numWarns], i) => {
      return `${i + 1}. <@${userId}> con ${numWarns} warnings`;
    }).join('\n');

    // Enviar el mensaje con la tabla de líderes al canal
    await message?.reply(`🔥 Los staff que dieron mas warns en el servidor: \n${leaderboard}`);
  },
};

export default command;
