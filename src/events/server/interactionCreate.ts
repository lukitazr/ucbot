import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { ExtendedClient } from '../../types';
import config from '../../config';

const { prefix } = config;

export default {
  name: 'interactionCreate',
  run: async (client: ExtendedClient, interaction: ChatInputCommandInteraction): Promise<void> => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      // como adopta los demas parametros del comando, se tiene que poner como 'falso' a todos los demas valores que no usamos.
      const { permisos_bot: permissionsBot, permisos: userPerms } = command;
      const botMember = interaction.guild!.members.me;

      if (permissionsBot && botMember && !botMember.permissions.has(permissionsBot as any)) {
        const missing = permissionsBot.map(p => `\`${p}\``).join(', ');
        return interaction.reply({
          content: '❌ **No tengo suficientes permisos para ejecutar este comando!**\n' +
            `Necesito: ${missing}`,
          ephemeral: true,
        }) as any;
      }

      const member = interaction.member as GuildMember;
      if (userPerms && !member.permissions.has(userPerms as any)) {
        const missing = userPerms.map(p => `\`${p}\``).join(', ');
        return interaction.reply({
          content: '❌ **No tienes suficientes permisos para ejecutar este comando!**\n' +
            `Necesitas: ${missing}`,
          ephemeral: true,
        }) as any;
      }

      await command.run(client, null, [], prefix, interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ **¡Hubo un error al ejecutar este comando!** ❌',
        ephemeral: true,
      });
    }
  },
};
