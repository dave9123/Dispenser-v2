import blocked from "./checker/ls.ts";

import { linksDb } from "$db";

const noLinksMessage = (filter: string): string =>
	`There are no links unblocked for ${filter}`;

export default async (
	guildId: string,
	ownedLinks: Array<string>,
	filters: Array<string>,
	cat: string,
	premium: boolean
) => {
	let cursor;
	if (premium) {
		cursor = await linksDb.find({
			guildId: guildId,
			cat: cat
		});
	} else if (!premium) {
		cursor = await linksDb.find({
			guildId: guildId,
			cat: cat,
			$or: [
				{ isPremium: false },
				{ isPremium: { $exists: false } }
			]
		});
	}
	const links = await cursor.toArray();
	if (links.length === 0) return "There are no links!";

	let filteredLinks: Array<string> = [];

	if (ownedLinks) {
		filteredLinks = links
			.map((entry) => entry.link)
			.filter((entry) => !ownedLinks.includes(entry));
	}

	if (filteredLinks.length === 0) {
		return new Error("We ran out of links to give you!");
	}

	let unblockedList = filteredLinks;

	if (filters.includes("ls")) {
		unblockedList = unblockedList.filter(async (link) =>
			await !blocked(link)
		);

		/*
        TODO: For debug mode only
        console.log(
            `These ${cat} links are unblocked for Lightspeed ${unblockedList.join(
                ", ",
            )}`,
        );
        */

		if (links.length === 0) return noLinksMessage("Lightspeed");
	}

	return unblockedList[Math.floor(Math.random() * unblockedList.length)];
};
