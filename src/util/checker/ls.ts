const blockedCats = [
	"local-allow",
	"local-block",
	"ads",
	"adult",
	"drugs",
	"gambling",
	"security.hacking",
	"violence.hate",
	"porn",
	"porn.de",
	"porn.es",
	"porn.fr",
	"porn.it",
	"porn.jp",
	"porn.nl",
	"security.proxy",
	"suspicious",
	"violence",
	"security.warez",
	"ads.popup-ads",
	"alcohol",
	"ads.banner-ads",
	"ads.html-ads",
	"ads.javascript-ads",
	"spam",
	"security.spyware",
	"security.virus",
	"security.phishing",
	"weapons",
	"education.sex",
	"porn.illicit",
	"adult.art",
	"adult.bodyart",
	"adult.games",
	"adult.lifestyles",
	"porn.pl",
	"porn.ru",
	"porn.pt",
	"parked",
	"suspicious.script",
	"security.potentially_unwanted_applications",
	"security.malware",
	"violence.extremisim"
];

function lightspeedCategorize(num: number): string | number {
	Deno.readFile("src/util/checker/ls.json").then((data) => {
		const catJson = JSON.parse(new TextDecoder().decode(data));
		for (let i = 0; i < catJson.length; i++) {
			if (catJson[i]["CategoryNumber"] === num) {
				return catJson[i]["CategoryName"];
			}
		}
	});
	return num; // No category
}

export default async function (link: string): Promise<boolean> {
	console.info(`Checking ${link} on Lightspeed`);
	const url: string = new URL(link).hostname || link;

	const response = await fetch("https://production-archive-proxy-api.lightspeedsystems.com/archiveproxy",
        {
            "method":"POST",
            "headers": {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'en-US,en;q=0.9',
                'authority': 'production-archive-proxy-api.lightspeedsystems.com',
                'content-type': 'application/json',
                'origin': 'https://archive.lightspeedsystems.com',
                'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'x-api-key': 'onEkoztnFpTi3VG7XQEq6skQWN3aFm3h'
            },
            "body": `{"query":"\\nquery getDeviceCategorization($itemA: CustomHostLookupInput!, $itemB: CustomHostLookupInput!){\\n  a: custom_HostLookup(item: $itemA) { cat}\\n  b: custom_HostLookup(item: $itemB) { cat   \\n  }\\n}","variables":{"itemA":{"hostname":"${url}"}, "itemB":{"hostname":"${url}"}}}`
        }
    );

	if (!response.ok) {
		console.error(`Failed to scan ${url} on Lightspeed`);
		return false;
	}

	const body = await response.json();
	const categories = [body.data.a.cat, body.data.b.cat];

	const categorized = categories.map((cat) => lightspeedCategorize(cat));
	console.log(`[Lightspeed] Categories for ${url}: ${categorized}`);
	const isUnblocked = blockedCats.every((cat) => !categorized.includes(cat));
	return isUnblocked;
}
