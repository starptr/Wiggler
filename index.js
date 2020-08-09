const fs = require("fs");
const _ = require("lodash");
const axios = require("axios").default;
require("dotenv").config();
const { App } = require("@slack/bolt");

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const fancyLog = msg => {
	if (msg.message) console.error(msg);
	else console.log(msg);

	app.client.chat.postMessage({
		token: process.env.SLACK_BOT_TOKEN,
		//ID or name
		channel: process.env.SLACK_LOG_CHANNEL,
		text: null,
		attachments: [
			{
				color: msg.message ? "#ff0000" : "#dddddd",
				blocks: [
					{
						type: "section",
						text: {
							type: "plain_text",
							text: `${msg.message || msg}`,
							emoji: false,
						},
					},
				],
			},
		],
	});
};

// Listens to incoming messages that contain "hello"
app.message("!ping", async ({ message, say }) => {
	// say() sends a message to the channel where the event was triggered
	await say(`Pong!`);
});

(async () => {
	// Error log to a channel

	// Links to pfps
	let pfpsUrls = [
		"http://cloud-2to2o6psz.vercel.app/cartoony1.png",
		"http://cloud-2to2o6psz.vercel.app/cartoony2.png",
		"http://cloud-2to2o6psz.vercel.app/cartoony3.png",
		"http://cloud-2to2o6psz.vercel.app/cartoony4.png",
		"http://cloud-2to2o6psz.vercel.app/cartoony5.png",
		"http://cloud-2to2o6psz.vercel.app/cartoony6.png",
		"http://cloud-2to2o6psz.vercel.app/cartoony7.png",
		"http://cloud-2to2o6psz.vercel.app/cartoony8.png",
	];

	// Last minute of execution
	let m = new Date().getMinutes() - 1;
	// Last pfp's index
	let oldIndex = -1;

	// Repeated func
	const randomPushPfp = async () => {
		// Choose an index not equal to the last index (this algo makes it impossible to choose last pfp on first iteration)
		let i = oldIndex + 1;
		if (i >= pfpsUrls.length) {
			i = 0;
			pfpsUrls = _.shuffle(pfpsUrls);
		}
		oldIndex = i;

		try {
			// Push pfp
			const res = await axios.get(pfpsUrls[i], { responseType: "arraybuffer" });
			const result = await app.client.users.setPhoto({
				token: process.env.SLACK_OAUTH_TOKEN,
				image: Buffer.from(res.data),
			});
		} catch (err) {
			fancyLog(err);
		}
	};

	// Start your app
	await app.start(process.env.PORT || 3001);

	fancyLog("⚡️ Bolt app is running!");

	const updateJob = setInterval(async () => {
		let now = new Date();
		if (now.getMinutes() !== m) {
			m = now.getMinutes();
			await randomPushPfp();
		}
	}, 1000 * 10);
})();
