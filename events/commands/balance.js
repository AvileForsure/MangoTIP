import { SlashCommandBuilder } from 'discord.js';
import {} from 'dotenv/config';
import { firedb } from '../firebasee.js';


const create = () => {
	const command = new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Check your balance!');

	return command.toJSON();
};

// Called by the interactionCreate event listener when the corresponding command is invoked
const invoke = async (interaction) => {
	let uid = interaction.user.id;
	const collectionx = firedb.collection('balances');
	let doc = await collectionx.doc(`${uid}`).get();

	if (!doc.exists) {
		await collectionx.doc(`${uid}`).set({
			"stellar": "0",
			"mango": "0"
		});
		interaction.reply({
			content: 'You have no crypto',
			ephemeral: true,
		})
	} else {
		if(doc.data().mango == "0") {
			if(doc.data().stellar == "0") {
				interaction.reply({
					content: `You have no crypto`,
					ephemeral: true,
				})
			}
		} else {
			interaction.reply({
				content: `**Your balances:**\n**Mango**: ${doc.data().mango}\n**Stellar**: ${doc.data().stellar}`,
				ephemeral: true,
			})
		}
	}
};

export { create, invoke };
