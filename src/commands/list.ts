import { ApplicationCommandTypes, InteractionResponseTypes, Bot, Interaction } from "@discordeno/bot";
import { MessageFlags } from "@discordeno/types";

import { limitsDb, linksDb, rolesDb } from "$db";

import Responder from "../util/responder.ts";

const data = {
	name: "list",
	description: "Lists all the links in the guild",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandTypes.Message,
			name: "category",
			description: "The category to get the links from",
			required: false,
		},
	],
	dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);
	await responder.deferredResponse();

	const cursor = await linksDb.find({ guildId: String(interaction.guildId) });

	const links = await cursor.toArray();

	if (links.length === 0) {
		await responder.respond("There are no links to query");
		return;
	}

	const getList: () => Promise<string> = async (): Promise<string> => {
		const { admin, premium } = (await rolesDb.findOne({
			guildId: String(interaction.guildId),
		})) || {};

		const list: string[] = await Promise.all(
			links.map(async (link) => {
				let line = "";

				const { limit, premiumLimit } = (await limitsDb.findOne({
					guildId: String(interaction.guildId),
					cat: link.cat,
				})) || {};

				if (limit && premiumLimit) {
					line +=
						`*${link.cat}* **Limit**: ${limit} **Premium Limit**: ${premiumLimit} **Link**: ${link.link}`;
				} else if (limit) {
					line +=
						`*${link.cat}* **Limit**: ${limit} Link: ${link.link}`;
				} else line += `*${link.cat}* Link: ${link.link}`;

				return line;
			}),
		);

		return (
			"**Role Ids**\n" +
			"Admin: " +
			(admin ? admin : "Not set") +
			"\n" +
			"Premium: " +
			(premium ? premium : "Not set") +
			"\n" +
			"\n" +
			list.join("\n")
		);
	};

	let list: string = await getList();
	if (list.length >= 2000) {
		const file = new Blob([list], { type: "text/plain" });
		const fileName = `message.txt`;
		/*await bot.rest.editOriginalInteractionResponse(
			interaction.token,
			{
				content: "List is too long, sending as a file",
				files: [
					{
						name: fileName,
						blob: file,
					},
				],
				flags: MessageFlags.Ephemeral,
			},
		);*/
		await responder.updateMsgWithFile(
			"List is too long, sending as a file.\n-# This feature is still in beta and we are open to any suggestions, please send us suggestions at [dave@dave9123.onmicrosoft.com](mailto:dave@dave9123.onmicrosoft.com)",
			fileName,
			file,
		);
		return;
	} else {
		await responder.update(list);
		return;
	}
}

const adminOnly = true;
export { adminOnly, data, handle };
