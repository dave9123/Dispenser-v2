import { Member, User } from "@discordeno/bot";

import { rolesDb } from "$db";
import config from "$config";

export default async (member: Member, guildId: string, user: User): Promise<boolean> => {
	if (member.permissions?.has("ADMINISTRATOR")) {
		return true;
	}
	
	if (config.adminUsers.includes(user.id)) {
		return true;
	}

	const { admin } = (await rolesDb.findOne({
		guildId: guildId,
	})) || {};

	if (!admin) return false;
	
	return member.roles.includes(BigInt(admin));
};