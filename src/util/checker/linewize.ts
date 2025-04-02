export default async function (link: string): Promise<boolean> {
	console.info(`Checking ${link} on Linewize`);
	const response = await fetch("https://mvgateway.syd-1.linewize.net/get/verdict?deviceid=PHYS-SMIC-US-0000-3190&cev=3.3.0&identity=null&requested_website=https://astroid.gg/", {
        "credentials": "omit",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en,en-US;q=0.5",
            "Prefer": "safe",
            "Sec-GPC": "1",
            "Alt-Used": "mvgateway.syd-1.linewize.net",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "cross-site",
            "Priority": "u=0, i",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        },
        "method": "GET",
        "mode": "cors"
    });

	if (!response.ok) {
		console.error(`[Linewize] Failed to scan ${link}`);
		return false;
	}

    const body = await response.json();
    const isUnblocked = body.redirect_uri === undefined;
    console.info(`[Linewize] ${link} is under ${body["signature"]["category"]} ${body["signature"]["subCategory"]} and may ${isUnblocked ? "not " : ""}be blocked`);
    return isUnblocked;
}