import { annotation, getInput, notice, string } from "jamesons-actions-toolkit";
import semver from "./strategies/semver";
import dated from "./strategies/dated";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version: actionVersion } = require("../package.json");

const types = {
	semver,
	dated,
};

export async function action() {
	notice(
		`Using auto-version action v${actionVersion}`,
		annotation({ title: "Versioning" }),
	);

	const type = getInput("type", { type: string })
		.trim()
		.toLowerCase() as keyof typeof types;

	if (!(type in types)) throw new Error(`Invalid type: ${type}`);

	console.log("Using type: %s", type);

	await types[type]();
}
