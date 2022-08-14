import { SlashCommandBuilder } from 'discord.js';
import { firedb } from '../firebasee.js';

// Creates an Object in JSON with the data required by Discord's API to create a SlashCommand
const create = () => {
	const command = new SlashCommandBuilder()
		.setName('tip')
		.setDescription('Tip crypto to other user!')
		.addUserOption((option) =>
			option.setName('user').setDescription('Who should receive your tip?').setRequired(true)
		).addStringOption((option) =>
			option.setName('amount').setDescription('How much would u like to tip?').setRequired(true)
		).addStringOption((option) =>
			option.setName('currency').setDescription('What currency would u like to tip?').setRequired(true)
		);

	return command.toJSON();
};

const invoke = async (interaction) => {
	const user = interaction.options.getUser('user');
	const amount = interaction.options.getString('amount');
	const currency = interaction.options.getString('currency');
	const collectionx = firedb.collection('balances');
	let doc = await collectionx.doc(`${interaction.user.id}`).get();
	let docx = await collectionx.doc(`${user.id}`).get();
	if(amount <= 0) {
		interaction.reply({
			content: `U cannot tip 0 ${currency}`,
			ephemeral: false,
		});
		return;
	}
	if(!doc.exists) {
		await collectionx.doc(`${interaction.user.id}`).set({
			"stellar": "0",
			"mango": "0"
		});
		interaction.reply({
			content: "Successfully created account, try to tip again!",
			ephemeral: true,
		});
		return;
	}
	if(!docx.exists) {
		await collectionx.doc(`${user.id}`).set({
			"stellar": "0",
			"mango": "0"
		});
		interaction.reply({
			content: `Successfully created account of ${user}, try to tip again!`,
			ephemeral: true,
		})
		return;
	}
	if(currency == "mango") {
		let hcm = docx.data().mango;
		let ycm = doc.data().mango;
		let hcs = docx.data().stellar;
		let ycs = doc.data().stellar;
		if(parseFloat(ycm) >= parseFloat(amount)) {
			await collectionx.doc(`${interaction.user.id}`).set({
				"mango": `${parseFloat(ycm)-parseFloat(amount)}`,
				"stellar": `${ycs}`,
			});
			await collectionx.doc(`${user.id}`).set({
				"mango": `${parseFloat(hcm)+parseFloat(amount)}`,
				"stellar": `${hcs}`,
			});
			interaction.reply({
				content: `Tipped ${amount} ${currency} to ${user}!`,
				ephemeral: false,
			})
		} else {
			interaction.reply({
				content: `You have not enough ${currency} to tip!`,
				ephemeral: false,
			})
		}
	} else if(currency == "stellar") {
		let hcm = docx.data().mango;
		let ycm = doc.data().mango;
		let hcs = docx.data().stellar;
		let ycs = doc.data().stellar;
		if(parseFloat(ycs) >= parseFloat(amount)) {
			await collectionx.doc(`${interaction.user.id}`).set({
				"mango": `${ycm}`,
				"stellar": `${parseFloat(ycs)-parseFloat(amount)}`,
			});
			await collectionx.doc(`${user.id}`).set({
				"mango": `${hcm}`,
				"stellar": `${parseFloat(hcs)+parseFloat(amount)}`,
			});
			interaction.reply({
				content: `Tipped ${amount} ${currency} to ${user}!`,
				ephemeral: false,
			})
		} else {
			interaction.reply({
				content: "This coin isnt listed!",
				ephemeral: true,
			})
		}
	} else {
		interaction.reply({
			content: `You have not enough ${currency} to tip!`,
			ephemeral: false,
		})
	}
};

export { create, invoke };
