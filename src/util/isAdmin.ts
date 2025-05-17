import { Member } from "@discordeno/bot";

import { rolesDb } from "$db";
import config from "$config";

export default async (member: Member, guildId: string, userid: number): Promise<boolean> => {
	if (member.permissions?.has("ADMINISTRATOR")) {
		return true;
	}
	
	if (config.adminUsers?.includes(userid)) {
		console.log(`User ${userid} is in the adminUsers list, granting access.`);
		return true;
	}

	const { admin } = (await rolesDb.findOne({
		guildId: guildId,
	})) || {};

	if (!admin) return false;
	
	return member.roles.includes(BigInt(admin));
};