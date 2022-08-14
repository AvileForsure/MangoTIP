import { SlashCommandBuilder } from 'discord.js';
import {} from 'dotenv/config';
import { firedb } from '../firebasee.js';
import {Asset, Keypair, Networks, Server, TransactionBuilder, Operation, Memo} from 'stellar-sdk';
import fetch from 'node-fetch';


const create = () => {
	const command = new SlashCommandBuilder()
		.setName('deposit')
		.setDescription('Deposit crypto!')
		.addStringOption((option) =>
			option.setName('txid').setDescription('Deposit TXID')
		)

	return command.toJSON();
};

// Called by the interactionCreate event listener when the corresponding command is invoked
const invoke = async (interaction) => {
	const txid = interaction.options.getString('txid');
	const uid = interaction.user.id;

	if(txid === null) {
		interaction.reply({
			content: `Please deposit here only listed coins!!! Depositing any other coin than listed will result in permanent loss of the assets!!!\nAddress: **GAVAXFKW23U5ETRNQIOIFKXY36ESSCFAZZHPFZPPODUXPZJGNGWTPYK7**\nMemo: **${uid}**`,
			ephemeral: true,
		})
	} else {
		const response = await fetch(`https://horizon.stellar.org/transactions/${txid}`);
		const data = await response.text();
		const obj = JSON.parse(data);
		const responsee = await fetch(`https://horizon.stellar.org/transactions/${txid}/operations`);
		const dataa = await responsee.text();
		const objj = JSON.parse(dataa);
		if(objj._embedded.records[0].to == "GAVAXFKW23U5ETRNQIOIFKXY36ESSCFAZZHPFZPPODUXPZJGNGWTPYK7") {
			interaction.reply({
				content: "Transaction didnt get deposited to right address!",
				ephemeral: true,
			});
			return;
		}
		if(obj.memo == uid) {
			const collectionx = firedb.collection('timeouts');
			let doc = await collectionx.doc(`${txid}`).get();
			const collectiony = firedb.collection('balances');
			let docx = await collectiony.doc(`${uid}`).get();
			let hcm = docx.data().mango;
			let hcs = docx.data().stellar;
			if (!docx.exists) {
				await collectiony.doc(`${uid}`).set({
					"stellar": "0",
					"mango": "0"
				});
				interaction.reply({
					content: "Successfully created account, try deposit command again!",
					ephemeral: true,
				});
				return;
			} else {
				if (!doc.exists) {
					await collectionx.doc(`${txid}`).set({
						"used": true,
					});
				} else {
					interaction.reply({
						content: `You've already deposited this transaction!`,
						ephemeral: true,
					})
				}
				if(objj._embedded.records[0].asset_code == "Manangos") {
					let finma = parseFloat(hcm)+parseFloat(objj._embedded.records[0].amount)
					await collectiony.doc(`${uid}`).set({
						"mango": `${finma}`,
						"stellar": hcs,
					});
					interaction.reply({
						content: `Successfully deposited ${objj._embedded.records[0].amount} mango!`,
						ephemeral: true,
					})
				} else if(objj._embedded.records[0].asset_type == "native") {
					let finst = parseFloat(hcs)+parseFloat(objj._embedded.records[0].amount)
					await collectiony.doc(`${uid}`).set({
						"mango": hcm,
						"stellar": `${finst}`,
					});
					interaction.reply({
						content: `Successfully deposited ${objj._embedded.records[0].amount} stellar!`,
						ephemeral: true,
					})
				} else {
					interaction.reply({
						content: `This coin isnt listed yet!`,
						ephemeral: true,
					})
				}
			}
		} else {
			interaction.reply({
				content: `This deposit isnt yours!`,
				ephemeral: true,
			})
		}
		}
};

export { create, invoke };
