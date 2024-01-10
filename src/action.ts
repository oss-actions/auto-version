import { getInput, string } from "jamesons-actions-toolkit";
import semver from "./strategies/semver";

const types = {
	semver,
};

export async function action() {
	const type = getInput("type", { type: string })
		.trim()
		.toLowerCase() as keyof typeof types;

	if (!(type in types)) throw new Error(`Invalid type: ${type}`);

	console.log("Using type: %s", type);

	await types[type]();
}
