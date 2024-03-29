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

export default async function action() {
	const token = getInput("token", { type: string });
	const refuseMajorIncrement = getInput("refuse_major_increment", {
		type: boolean,
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
		error(
			"Major, or breaking changes has been blocked",
			annotation({ title: "versioning" }),
		);
		process.exit(1);
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

	if (currentHighestTag.version.major !== 0 && increment === "major") {
		setOutput("branch", "release/v" + currentHighestTag.version.major);
		setOutput("branch_sha", currentHighestTag.reference);
	} else {
		setOutput("branch", "none");
		setOutput("branch_sha", "none");
	}

	const newVersion = currentHighestTag.version.inc(increment);

	const version = newVersion.format();
	setOutput("version", version);
	setOutput("tag", "v" + version);
}
