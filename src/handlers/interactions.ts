import {
  InteractionType,
  InteractionResponseType,
} from 'discord-interactions';
import { commandsMap } from '../commands';
import { SlashContext, SlashContextOptions } from '../types';
import rest from '../lib/rest';
import { color } from '../config';
import { Routes } from 'discord.js';

function hasPermission(memberPermissions: string | undefined, requiredBit: bigint): boolean {
  if (!memberPermissions) return false;
  try {
    const perms = BigInt(memberPermissions);
    const adminBit = BigInt(8); // Administrator
    if ((perms & adminBit) === adminBit) return true;
    return (perms & requiredBit) === requiredBit;
  } catch {
    return false;
  }
}

export function createSlashContext(
  interaction: any,
  receivedAt: number
): SlashContext {
  const resolved = interaction.data?.resolved || {};
  const rawOptions = interaction.data?.options || [];

  let activeOptions = rawOptions;
  let subcommand: string | undefined;
  let subcommandGroup: string | undefined;

  const firstOption = rawOptions[0];
  if (firstOption && firstOption.type === 2) {
    // SUB_COMMAND_GROUP
    subcommandGroup = firstOption.name;
    const sub = firstOption.options?.[0];
    if (sub && sub.type === 1) {
      subcommand = sub.name;
      activeOptions = sub.options || [];
    }
  } else if (firstOption && firstOption.type === 1) {
    // SUB_COMMAND
    subcommand = firstOption.name;
    activeOptions = firstOption.options || [];
  }

  const optionsMap = new Map<string, any>();
  for (const opt of activeOptions) {
    optionsMap.set(opt.name, opt.value);
  }

  const user = interaction.user || interaction.member?.user;

  const formatPayload = (data: any) => {
    if (typeof data === 'string') {
      return { content: data };
    }
    const payload: any = {};
    if (data.content !== undefined) payload.content = data.content;
    if (data.embeds) {
      payload.embeds = data.embeds.map((e: any) =>
        e && typeof e.toJSON === 'function' ? e.toJSON() : e
      );
    }
    if (data.components) {
      payload.components = data.components.map((c: any) =>
        c && typeof c.toJSON === 'function' ? c.toJSON() : c
      );
    }
    if (data.ephemeral) {
      payload.flags = 64;
    }
    return payload;
  };

  const options: SlashContextOptions = {
    getSubcommand: () => subcommand,
    getSubcommandGroup: () => subcommandGroup,
    getString: (name: string) => optionsMap.get(name) as string | undefined,
    getInteger: (name: string) => optionsMap.get(name) as number | undefined,
    getNumber: (name: string) => optionsMap.get(name) as number | undefined,
    getBoolean: (name: string) => optionsMap.get(name) as boolean | undefined,
    getUser: (name: string) => {
      const id = optionsMap.get(name);
      if (!id) return undefined;
      return resolved.users?.[id] || { id };
    },
    getMember: (name: string) => {
      const id = optionsMap.get(name);
      if (!id) return undefined;
      return resolved.members?.[id];
    },
    getRole: (name: string) => {
      const id = optionsMap.get(name);
      if (!id) return undefined;
      return resolved.roles?.[id] || { id };
    },
    getChannel: (name: string) => {
      const id = optionsMap.get(name);
      if (!id) return undefined;
      return resolved.channels?.[id] || { id };
    },
    getRaw: (name: string) => {
      return activeOptions.find((o: any) => o.name === name);
    },
  };

  const ctx: SlashContext = {
    interaction,
    guildId: interaction.guild_id,
    channelId: interaction.channel_id,
    user,
    member: interaction.member,
    receivedAt,
    color,
    rest,
    options,
    reply: (data: any) => ({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: formatPayload(data),
    }),
    deferReply: (ephemeral?: boolean) => ({
      type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      data: ephemeral ? { flags: 64 } : undefined,
    }),
    editReply: async (data: any) => {
      const appId =
        process.env.DISCORD_APPLICATION_ID ||
        process.env.CLIENT_ID ||
        interaction.application_id;
      return rest.patch(
        Routes.webhookMessage(appId, interaction.token, '@original'),
        { body: formatPayload(data) }
      );
    },
  };

  return ctx;
}

export async function handleInteraction(interaction: any): Promise<any> {
  const receivedAt = Date.now();

  // PING (Validación de Discord Developer Portal)
  if (interaction.type === InteractionType.PING) {
    return { type: InteractionResponseType.PONG };
  }

  // SLASH COMMANDS (APPLICATION_COMMAND)
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const commandName = interaction.data?.name?.toLowerCase();
    const command = commandsMap.get(commandName);

    if (!command) {
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `❌ Comando \`/${commandName}\` no implementado o no disponible en esta versión.`,
          flags: 64,
        },
      };
    }

    // Verificar permisos si el comando los requiere
    if (command.permissions && command.permissions.length > 0) {
      const memberPermissions = interaction.member?.permissions;
      for (const perm of command.permissions) {
        if (!hasPermission(memberPermissions, perm)) {
          return {
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '❌ **No tienes suficientes permisos para ejecutar este comando.**',
              flags: 64,
            },
          };
        }
      }
    }

    try {
      const ctx = createSlashContext(interaction, receivedAt);
      const result = await command.run(ctx);

      if (result && typeof result === 'object' && 'type' in result) {
        return result;
      }

      // Por defecto respuesta de confirmación si no devolvió nada
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '✅ Comando procesado con éxito.',
          flags: 64,
        },
      };
    } catch (error: any) {
      console.error(`Error ejecutando comando /${commandName}:`, error);
      return {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `❌ **Error al procesar el comando:** \`${error?.message || error}\``,
          flags: 64,
        },
      };
    }
  }

  // Por si llega otro tipo de interacción
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: '⚠️ Tipo de interacción no soportada.',
      flags: 64,
    },
  };
}

export default handleInteraction;
