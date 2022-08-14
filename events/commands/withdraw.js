import { SlashCommandBuilder } from 'discord.js';
import {} from 'dotenv/config';
import { firedb } from '../firebasee.js';
import {Asset, Keypair, Networks, Server, TransactionBuilder, Operation, Memo} from 'stellar-sdk';

const create = () => {
	const command = new SlashCommandBuilder()
		.setName('withdraw')
		.setDescription('Withdraw your crypto!')
		.addStringOption((option) =>
			option.setName('address').setDescription('Your stellar address').setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('token').setDescription("What token you'd like to withdraw?").setRequired(true)
		)
		.addStringOption((option) =>
		option.setName('amount').setDescription("How much you'd like to withdraw?").setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('memo').setDescription("Enter deposit memo?")
		);

	return command.toJSON();
};

// Called by the interactionCreate event listener when the corresponding command is invoked
const invoke = async (interaction) => {
	const address = interaction.options.getString('address');
	const token = interaction.options.getString('token');
	const amount = interaction.options.getString('amount');
	const memo = interaction.options.getString('memo');
	const uid = interaction.user.id;

	const server = new Server('https://horizon.stellar.org')
	const sourceKeypair = Keypair.fromSecret(process.env.Stellar_SHIT)
	const sourcePublicKey = sourceKeypair.publicKey();
	const account = await server.loadAccount(sourcePublicKey);
	const fee = await server.fetchBaseFee();

	const manangos = new Asset("Manangos", "GD7G6ZAUGH2CGO3LIJO5JDVGSNAHKDIQO6GXDNEWD2N2JI7EUKI4ZYJL");

	const collectionx = firedb.collection('balances');
	let doc = await collectionx.doc(`${uid}`).get();
	if(!doc.exists) {
		await collectionx.doc(`${uid}`).set({
			"stellar": "0",
			"mango": "0"
		});
		interaction.reply({
			content: "Successfully created account, try withdraw command again!",
			ephemeral: true,
		});
		return;
	} else {
		if(token == "mango") {
			interaction.reply({
				content: `Withdrawal pending. Crypto will come in a few minutes.`,
				ephemeral: true,
			})
			if(doc.data().mango >= amount) {
				let hcm = doc.data().mango;
				let hcs = doc.data().stellar;
				let manpw = parseFloat(hcm)-parseFloat(amount);
				await collectionx.doc(`${uid}`).set({
					"stellar": hcs,
					"mango": manpw
				});

				if(memo === null) {
					const transaction = new TransactionBuilder(account, { fee, networkPassphrase: Networks.PUBLIC })
				.addOperation(Operation.payment({
					destination: address,
					asset: manangos,
					amount: amount,
				}))
				.setTimeout(30)
				.build();
				transaction.sign(sourceKeypair);
				try {
					const transactionResult = await server.submitTransaction(transaction);
				  } catch (e) {
				  }
				} else {
					const transaction = new TransactionBuilder(account, { fee, networkPassphrase: Networks.PUBLIC })
				.addOperation(Operation.payment({
					destination: address,
					asset: manangos,
					amount: amount,
				}))
				.setTimeout(30)
				.addMemo(Memo.text(memo))
				.build();
				transaction.sign(sourceKeypair);
				try {
					const transactionResult = await server.submitTransaction(transaction);
				  } catch (e) {
				  }
				}
			} else {
				interaction.reply({
					content: `You have less mango than u want to withdraw!`,
					ephemeral: true,
				})
				return;
			}
		} else if(token == "stellar") {
			interaction.reply({
				content: `Withdrawal pending. Crypto will come in a few minutes.`,
				ephemeral: true,
			})
			if(doc.data().stellar >= amount) {
				let hcm = doc.data().mango;
				let hcs = doc.data().stellar;
				let stepw = parseFloat(hcs)-parseFloat(amount);
				await collectionx.doc(`${uid}`).set({
					"stellar": stepw,
					"mango": hcm
				});

				if(memo === null) {
					const transaction = new TransactionBuilder(account, { fee, networkPassphrase: Networks.PUBLIC })
				.addOperation(Operation.payment({
					destination: address,
					asset: Asset.native(),
					amount: amount,
				}))
				.setTimeout(30)
				.build();
				transaction.sign(sourceKeypair);
				try {
					const transactionResult = await server.submitTransaction(transaction);
				  } catch (e) {

				  }
				} else {
					const transaction = new TransactionBuilder(account, { fee, networkPassphrase: Networks.PUBLIC })
				.addOperation(Operation.payment({
					destination: address,
					asset: Asset.native(),
					amount: amount,
				}))
				.setTimeout(30)
				.addMemo(Memo.text(memo))
				.build();
				transaction.sign(sourceKeypair);
				try {
					const transactionResult = await server.submitTransaction(transaction);
				  } catch (e) {
					
				  }
				}
			} else {
				interaction.reply({
					content: `You have less mango than u want to withdraw!`,
					ephemeral: true,
				})
				return;
			}
		} else {
			interaction.reply({
				content: `This token isnt listed yet!`,
				ephemeral: true,
			})
			return;
		}
	}
	
};

export { create, invoke };
