import {
	ApplicationCommandOptionTypes,
	ApplicationCommandTypes,
	Bot,
	Interaction
} from "@discordeno/bot";

import { rolesDb } from "$db";

import Responder from "../util/responder.ts";

const data = {
	name: "admin",
	description: "Give admin status to a role",
	type: ApplicationCommandTypes.ChatInput,
	options: [
		{
			type: ApplicationCommandOptionTypes.Role,
			name: "role",
			description: "The role that gets the status",
			required: true,
		},
	],
	dmPermission: false,
};

async function handle(bot: Bot, interaction: Interaction): Promise<void> {
	const responder = new Responder(bot, interaction.id, interaction.token);
	await responder.deferredResponse();

	const guildId = String(interaction.guildId);

	const roleId = interaction.data?.options?.[0]?.value;

	rolesDb.updateMany(
		{
			guildId: guildId,
		},
		{
			$set: {
				admin: String(roleId),
			},
		},
		{
			upsert: true,
		},
	);

	await responder.update(`Gave admin status to ${roleId}`);
}

const adminOnly = true;
export { adminOnly, data, handle };
