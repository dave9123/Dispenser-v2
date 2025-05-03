import { Member } from "@discordeno/bot";

import { rolesDb } from "$db";

export default async (member: Member, guildId: string): Promise<boolean> => {
	if (member.permissions?.has("ADMINISTRATOR")) {
		return true;
	}

	const { admin } = (await rolesDb.findOne({
		guildId: guildId,
	})) || {};

	if (!admin) return false;

	return member.roles.includes(BigInt(admin));
};