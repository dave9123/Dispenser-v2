import { Member } from "@discordeno/bot";
import { rolesDb } from "$db";

export default async (member: Member, guildId: string) => {
	const { premium } = (await rolesDb.findOne({
		guildId: guildId,
	})) || {};

	if (!premium) return false;

	return member.roles.includes(BigInt(premium));
};
