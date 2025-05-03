import {
	ApplicationCommandOptionTypes,
	ApplicationCommandTypes,
	Bot,
	Interaction,
} from "@discordeno/bot";

//import { chansDb } from "$db";

import Responder from "../util/responder.ts";

const data = {
	name: "logs",
	description: "Sets the channel for bot logs",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionTypes.Channel,
			name: "channel",
			description: "The channel to log to",
			required: true,
		},
	],
	dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction) {
	const responder = new Responder(bot, interaction.id, interaction.token);

	const chan = interaction.data?.options?.[0]?.value;

	//await responder.respond(`The channel is ${chan}`);
	return await responder.respond("This command is still work in progress.");
}

const adminOnly = true;
export { adminOnly, data, handle };
