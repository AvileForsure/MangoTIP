import {} from 'dotenv/config';
import fs from 'fs';
import { Client, GatewayIntentBits } from 'discord.js';
import {Asset, Keypair, Networks, Server, TransactionBuilder, Operation, Memo} from 'stellar-sdk';
import fetch from 'node-fetch';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });
const events = fs
	.readdirSync('./events')
	.filter((file) => file.endsWith('.js'));

for (let event of events) {
	const eventFile = await import(`#events/${event}`);
	if (eventFile.once)
		client.once(eventFile.name, (...args) => {
			eventFile.invoke(...args);
		});
	else
		client.on(eventFile.name, (...args) => {
			eventFile.invoke(...args);
		});
}

client.login(process.env.BOT_TOKEN);
