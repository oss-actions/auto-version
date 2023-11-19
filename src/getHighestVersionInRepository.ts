import type { Tag } from "./types";
import { PowerShell, Bash, Cash } from "jamesons-actions-toolkit";
import { type as os } from "node:os";
import { SemVer } from "semver";
import { iterateReadable } from "./util/iter";

const $ = new Cash(os() === "Windows_NT" ? PowerShell : Bash);
$.ignoreExitCode = true;

const versionSemver = /^v[0-9]+\.[0-9]+\.[0-9]+/;

function parseVersion(tag: string): SemVer | undefined {
	if (!versionSemver.test(tag)) return;
	return new SemVer(tag.substring(1), {
		includePrerelease: false,
		loose: false,
	});
}

export default async function getHighestVersionInRepository(
	gitUrl: string,
	pattern?: string,
): Promise<Tag | undefined> {
	// prettier-ignore
	const result = $`git ls-remote --quiet --tags ${gitUrl}${pattern ? ` "${pattern}"` : ""}`;
	let v: Tag | undefined = undefined;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	for await (const line of iterateReadable(result.stdout as any)) {
		const reference = line.substring(0, 40);
		const version = parseVersion(line.substring(51, line.length));
		if (!version) continue;
		if (v === undefined) v = { reference, version };
		else if (version.compare(v.version) === 1) v = { reference, version };
	}
	const awaitedResult = await result;
	if (awaitedResult.code > 0) {
		console.error(awaitedResult.stdall);
		throw new Error("Could not get tags of repository");
	}
	return v;
}
