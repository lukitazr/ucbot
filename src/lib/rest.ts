import { REST } from 'discord.js';
import { token } from '../config';

export const rest = new REST({ version: '10' }).setToken(token);

export default rest;

