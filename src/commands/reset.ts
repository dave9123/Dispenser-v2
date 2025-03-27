import {
	ApplicationCommandOptionTypes,
	ApplicationCommandTypes,
	Bot,
	Interaction,
} from "discordeno";

import { usersDb } from "$db";

import Responder from "../util/responder.ts";

const data = {
	name: "reset",
	description: "Resets a user's proxy limit",
	type: ApplicationCommandTypes.ChatInput,
	options: [
        {
            type: ApplicationCommandOptionTypes.Boolean,
            name: "global",
            description: "Resets the server's limit",
            required: true,
        },
		{
			type: ApplicationCommandOptionTypes.User,
			name: "user",
			description: "The user to reset",
			required: false,
		},
		{
			type: ApplicationCommandTypes.Message,
			name: "category",
			description: "The category to get the links from",
			required: false,
		},
	],
	dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction) {
	const responder = new Responder(bot, interaction.id, interaction.token);

    const global = interaction.data?.options?.find(option => option.name === "global")?.value as boolean;
	const user = interaction.data?.options?.find(option => option.name === "user")?.value;
    const cat = interaction.data?.options?.find(option => option.name === "category")?.value as string | undefined;

	const filter: {
		guildId: string;
		userId?: string;
		cat?: string;
	} = {
		guildId: String(interaction.guildId)
	};

    if (!global && !user) return await responder.respond("Please set a user to reset!");
	if (cat) filter.cat = cat;
    if (!global && user) filter.userId = String(user);
    if (global && user) return await responder.respond("Please set either a user or the server to reset!");
	await usersDb.updateMany(
		filter,
		{
			$set: {
				links: [],
				times: 0,
			},
		},
		{
			upsert: true,
		},
	);
    if (!global && user) return await responder.respond(`Reset ${user}'s proxy limit!`);
    if (global && !user) return await responder.respond(`Reset the server's proxy limit!`);
}

const adminOnly = true;
export { adminOnly, data, handle };