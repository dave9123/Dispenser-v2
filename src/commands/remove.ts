import { ApplicationCommandTypes, Bot, Interaction } from "@discordeno/bot";

import { linksDb } from "$db";

import Responder from "../util/responder.ts";

const data = {
	name: "remove",
	description: "Removes a link",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandTypes.Message,
			name: "category",
			description: "The proxy site to categorize the link",
			required: true,
		},
		{
			type: ApplicationCommandTypes.Message,
			name: "link",
			description: "The link to remove",
			required: false,
		},
	],
	dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction) {
	const responder = new Responder(bot, interaction.id, interaction.token);
	await responder.deferredResponse();

	const guildId = String(interaction.guildId);

	const cat = interaction.data?.options?.[0]?.value;
	const link = interaction.data?.options?.[1]?.value;

	if (!link) {
		if (await linksDb.deleteMany({
			guildId: guildId,
			cat: cat,
		}).deletedCount === 0) {
			return await responder.update(`No links found in ${cat}`);
		} else {
			return await responder.update(`Removed the category ${cat}`);
		}
	} else {
		if (await linksDb.deleteMany({
			guildId: guildId,
			link: link,
			cat: cat,
		}).deletedCount === 0) {
			return await responder.update(`No links found in ${cat} with the link ${link}`);
		} else {
			return await responder.update(`Removed ${link} from ${cat}`);
		}
	}
}

const adminOnly = true;
export { adminOnly, data, handle };
