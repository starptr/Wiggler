const fs = require("fs");
require("dotenv").config();
const { App } = require("@slack/bolt");

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Listens to incoming messages that contain "hello"
app.message("hello", async ({ message, say }) => {
	// say() sends a message to the channel where the event was triggered
	await say(`Hey there <@${message.user}>!`);
});

app.message("test", async ({ message, say }) => {
	try {
		const result = await app.client.users.setPhoto({
			token: process.env.SLACK_OAUTH_TOKEN,
			image: fs.readFileSync("testpfp.png"),
		});

		await say("done");
	} catch (err) {
		console.error(err);
	}
});

(async () => {
	// Start your app
	await app.start(process.env.PORT || 3000);

	console.log("⚡️ Bolt app is running!");
})();
