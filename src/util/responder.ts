import {
	InteractionResponseTypes,
	MessageFlags
} from "@discordeno/types";

import {
	Bot,
	Embed
} from "@discordeno/bot";

// Rename respond to response
export default class {
	bot: Bot;
	id: bigint;
	token: string;

	constructor(bot: Bot, id: bigint, token: string) {
		this.bot = bot;
		this.id = id;
		this.token = token;
	}
	async respond(msg: string) {
		return await this.bot.rest.sendInteractionResponse(
			this.id,
			this.token,
			{
				type: InteractionResponseTypes.ChannelMessageWithSource,
				data: {
					content: msg,
					flags: MessageFlags.Ephemeral,
				},
			},
		);
	}
	async respondEmbed(embed: Array<Embed>) {
		return await this.bot.rest.sendInteractionResponse(
			this.id,
			this.token,
			{
				type: InteractionResponseTypes.ChannelMessageWithSource,
				data: {
					embeds: [embed],
					flags: MessageFlags.Ephemeral,
				},
			},
		);
	}
}