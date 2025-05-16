import {
	ApplicationCommandTypes,
	Bot,
	Interaction,
} from "@discordeno/bot";

import { catsDb, linksDb } from "$db";

import Responder from "../util/responder.ts";

const data = {
	name: "rename",
	description: "Renames a category",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandTypes.Message,
			name: "category1",
			description: "The category to replace",
			required: true,
		},
		{
			type: ApplicationCommandTypes.Message,
			name: "category2",
			description: "The category to replace with",
			required: true,
		},
	],
	dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction) {
	const responder = new Responder(bot, interaction.id, interaction.token);
	await responder.deferredResponse();

	const cat1 = interaction.data?.options?.[0]?.value as string;
	const cat2 = interaction.data?.options?.[1]?.value as string;

	const guildId = String(interaction.guildId);

	await catsDb.updateMany(
		{
			guildId: guildId,
			cat: cat1,
		},
		{
			$set: {
				cat: cat2,
			},
		},
		{
			upsert: true,
		},
	);

	await linksDb.updateMany(
		{
			guildId: guildId,
			cat: cat1,
		},
		{
			$set: {
				cat: cat2,
			},
		},
		{
			upsert: true,
		},
	);

	return responder.update(`Renamed ${cat1} to ${cat2}`);
}

const adminOnly = true;
export { adminOnly, data, handle };
