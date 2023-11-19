import {
	boolean,
	getInput,
	notice,
	setOutput,
	string,
	annotation,
	error,
} from "jamesons-actions-toolkit";
import { ReleaseType } from "semver";
import getHighestVersionInRepository from "./getHighestVersionInRepository";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version: actionVersion } = require("../package.json");

export async function action() {
	const token = getInput("token", { type: string });
	const refuseMajorIncrement = getInput("refuse_major_increment", {
		type: string,
	});
	let increment = getInput("increment", { type: string }) as ReleaseType;
	switch (increment) {
		case "major":
		case "minor":
		case "patch":
			break;
		default:
			throw new Error(`Invalid version increment '${increment}'`);
	}

	const hard = getInput("hard", { type: boolean });
	const repository = process.env.GITHUB_REPOSITORY;

	if (!repository) throw new Error("Missing $GITHUB_REPOSITORY");

	notice(
		`Using semver action v${actionVersion}`,
		annotation({ title: "Versioning" }),
	);

	const currentHighestTag = await getHighestVersionInRepository(
		`https://github-actions:${token}@github.com/${repository}.git`,
	);

	if (increment === "major" && refuseMajorIncrement) {
		error(
			"Major, or breaking changes has been blocked",
			annotation({ title: "versioning" }),
		);
		return;
	}

	if (!currentHighestTag) {
		const version = increment === "major" ? "1.0.0" : "0.1.0";
		setOutput("version", version);
		setOutput("tag", "v" + version);
		setOutput("branch", "none");
		setOutput("branch_sha", "none");
		notice(
			`New version is '${version}', increment was '${increment}'`,
			annotation({ title: "Versioning" }),
		);
		return;
	}

	if (currentHighestTag.version.major === 0 && increment === "major" && !hard) {
		increment = "minor";
		notice(
			"Version increment is set to 'minor', because breaking changes is allowed in development (v0)",
			annotation({ title: "Versioning" }),
		);
	}

	const newVersion = currentHighestTag.version.inc(increment);

	const version = newVersion.format();
	setOutput("version", version);
	setOutput("tag", "v" + version);

	if (currentHighestTag.version.major !== 0 && increment === "major") {
		setOutput("branch", "release/v" + currentHighestTag.version.major);
		setOutput("branch_sha", currentHighestTag.reference);
	} else {
		setOutput("branch", "none");
		setOutput("branch_sha", "none");
	}
}
