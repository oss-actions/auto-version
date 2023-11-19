import {
	boolean,
	getInput,
	notice,
	setOutput,
	string,
	annotation,
} from "jamesons-actions-toolkit";
import getHighestVersionInRepository from "./getHighestVersionInRepository";
import { ReleaseType } from "semver";

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

	const currentHighestTag = await getHighestVersionInRepository(
		`https://github-actions:${token}@github.com/${repository}.git`,
	);

	if (increment === "major" && refuseMajorIncrement) {
		// todo: show error about blocking breaking changes
		return;
	}

	if (!currentHighestTag) {
		const version = increment === "major" ? "1.0.0" : "0.1.0";
		setOutput("version", version);
		setOutput("tag", "v" + version);
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