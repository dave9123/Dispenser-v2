import ls from "./checker/ls.ts";
import paloalto from "./checker/paloalto.ts";
import fortiguard from "./checker/fortiguard.ts";
import linewize from "./checker/linewize.ts";

import { linksDb } from "$db";

const noLinksMessage = (filter: string): string =>
    `There are no links unblocked for ${filter}`;

export default async (
    guildId: string,
    ownedLinks: Array<string>,
    filters: Array<string>,
    cat: string,
    premium: boolean
): Promise<string | Error> => {
    // Fetch links based on premium status
    const query = {
        guildId,
        cat,
        ...(premium
            ? {}
            : {
                    $or: [
                        { isPremium: false },
                        { isPremium: "false" },
                        { isPremium: { $exists: false } },
                    ],
              }),
    };

    const links = await linksDb.find(query).toArray();
    if (links.length === 0) return "There are no links!";

    // Filter out owned links
    const filteredLinks = links
        .map((entry) => entry.link)
        .filter((link) => !ownedLinks.includes(link));

    if (filteredLinks.length === 0) {
        return new Error("We ran out of links to give you!");
    }

    // Helper function to check links against a filter
    const checkLinks = async (
        links: Array<string>,
        filterFn: (link: string) => Promise<boolean>,
        filterName: string
    ): Promise<Array<string>> => {
        const validLinks = [];
        for (const link of links) {
            try {
                if (await filterFn(link)) {
                    validLinks.push(link);
                }
            } catch (e) {
                console.error(`An error occurred while checking on ${filterName}:`, e);
            }
        }
        if (validLinks.length === 0) throw new Error(noLinksMessage(filterName));
        return validLinks;
    };

    // Apply filters sequentially
    let unblockedList = filteredLinks;
    try {
        if (filters.includes("ls")) {
            unblockedList = await checkLinks(unblockedList, ls, "Lightspeed");
        }
        if (filters.includes("paloalto")) {
            unblockedList = await checkLinks(unblockedList, paloalto, "Palo Alto Networks");
        }
        if (filters.includes("fortiguard")) {
            unblockedList = await checkLinks(unblockedList, fortiguard, "FortiGuard");
        }
        if (filters.includes("linewize")) {
            unblockedList = await checkLinks(unblockedList, linewize, "Linewize");
        }
    } catch (error: Error) {
        console.error(error);
        return error.message;
    }

    // Return a random link from the unblocked list
    return unblockedList[Math.floor(Math.random() * unblockedList.length)];
};