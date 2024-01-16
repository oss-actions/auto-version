import { annotation, notice, setOutput } from "jamesons-actions-toolkit";

function today(now = new Date()): string {
	return [
		now.getFullYear().toString(),
		(now.getMonth() + 1).toString().padStart(2, "0"),
		now.getDate().toString().padStart(2, "0"),
	].join("-");
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
function getVersion() {
	return [
		process.env.GITHUB_RUN_ID,
		process.env.GITHUB_RUN_NUMBER,
		today(),
		process.env.GITHUB_SHA!.substring(0, 7),
	]
		.filter((i) => !!i)
		.join(".");
}

export default function action(version = getVersion()) {
	setOutput("version", version);
	notice(`New version is ${version}`, annotation({ title: "Versioning" }));
}
