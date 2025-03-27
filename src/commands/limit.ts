import { ApplicationCommandTypes, ApplicationCommandOptionTypes, Bot, Interaction } from "discordeno";

import { limitsDb } from "$db";

import Responder from "../util/responder.ts";

const data = {
	name: "limit",
	description: "Sets the monthly limit for a category",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionTypes.String,
			name: "category",
			description: "The category to be limited",
			required: true,
		},
		{
			type: ApplicationCommandOptionTypes.Integer,
			name: "limit",
			description: "The limit, set to -1 for unlimited",
			required: false,
		},
		{
			type: ApplicationCommandOptionTypes.Integer,
			name: "premiumlimit",
			description: "The limit for premium users, set to -1 for unlimited",
			required: false,
		},
	],
	dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);
	
	const cat = interaction.data?.options?.find(option => option.name === "category")?.value as string;
	const limit = interaction.data?.options?.find(option => option.name === "limit")?.value as number | undefined;
	const premiumLimit = interaction.data?.options?.find(option => option.name === "premiumlimit")?.value as number | undefined;

	if (!cat) {
		await responder.respond("Please provide a category!");
		return;
	} else if ((limit !== undefined && isNaN(limit)) || (premiumLimit !== undefined && isNaN(premiumLimit))) {
		await responder.respond("Please provide a valid limit!");
		return;
	} else if ((limit !== undefined && limit < -1) || (premiumLimit !== undefined && premiumLimit < -1)) {
		await responder.respond("Limit must be greater than or equal to -1!");
		return;
	}

	const updateData: { [key: string]: number } = {};
	if (limit !== undefined) {
		updateData.limit = limit;
	}
	if (premiumLimit !== undefined) {
		updateData.premiumLimit = premiumLimit;
	}

	await limitsDb.updateMany(
		{
			guildId: String(interaction.guildId),
			cat: cat,
		},
		{
			$set: updateData,
		},
		{
			upsert: true,
		},
	);

	let responseMessage = `Successfully set ${cat}`;
	if (limit !== undefined) {
		responseMessage += ` limit to ${limit}`;
	}
	if (premiumLimit !== undefined) {
		responseMessage += ` premium limit to ${premiumLimit}`;
	}
	responseMessage += "!";

	await responder.respond(responseMessage);
}

const adminOnly = true;
export { adminOnly, data, handle };