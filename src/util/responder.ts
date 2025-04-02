import {
	Bot,
	Embed,
	InteractionResponseTypes,
	MessageFlags,
} from "https://deno.land/x/discordeno@13.0.0-rc18/mod.ts";

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
	async deferResponse(msg: string = "", empheral: boolean = true) {
		return await this.bot.helpers.sendInteractionResponse(
			this.id,
			this.token,
			{
				type: msg === ""
					? InteractionResponseTypes.DeferredChannelMessageWithSource
					: InteractionResponseTypes.DeferredUpdateMessage,
				data: {
					content: msg === ""
						? undefined
						: msg,
					flags: empheral
						? MessageFlags.Empheral
						: undefined,
				},
			},
		);
	}
	async editOriginalResponse(content: string | { embeds: Embed[] }) {
		const originalMessage = await this.bot.helpers.getOriginalInteractionResponse(this.token);
		return await this.bot.helpers.editMessage(
			originalMessage.channelId,
			originalMessage.id,
			typeof content === "string"
				? { content }
				: { embeds: content.embeds },
		);
	}
	async respond(msg: string, empheral: boolean = true) {
		return await this.bot.helpers.sendInteractionResponse(
			this.id,
			this.token,
			{
				type: InteractionResponseTypes.ChannelMessageWithSource,
				data: {
					content: msg,
					flags: empheral ? MessageFlags.Empheral : undefined,
				},
			},
		);
	}
	async respondEmbed(embed: Embed, empheral: boolean = true) {
		return await this.bot.helpers.sendInteractionResponse(
			this.id,
			this.token,
			{
				type: InteractionResponseTypes.ChannelMessageWithSource,
				data: {
					embeds: [embed],
					flags: empheral ? MessageFlags.Empheral : undefined,
				},
			},
		);
	}
}