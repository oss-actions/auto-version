import { PowerShell, Bash, Cash } from "jamesons-actions-toolkit";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { type as os } from "node:os";
import { join } from "node:path";

const repos: string[] = [];

const _cash = os() === "Windows_NT" ? PowerShell : Bash;
const shell = (path: string) => {
	const cash = new Cash(_cash);
	cash.ignoreExitCode = true;
	cash.spawnOptions.cwd = path;
	return cash;
};

export async function createRepository(): Promise<string> {
	const path = join(process.cwd(), randomUUID());
	mkdirSync(path, { recursive: true });
	const $ = shell(path);
	const result = await $`git init`;
	if (result.code > 0) {
		repos.push(path);
		console.error(result.stdall);
		throw new Error("Could not initialize repository");
	}
	repos.push(path);
	return path;
}

export async function emptyCommit(path: string, message = "initial commit") {
	const $ = shell(path);
	const result = await $`git commit --allow-empty -m "${message.replace(
		/("|\$|\\)/g,
		(s) => "\\" + s,
	)}"`;
	if (result.code > 0) {
		repos.push(path);
		console.error(result.stdall);
		throw new Error("Could not create empty commit");
	}
}

export async function createTags(path: string, ...tags: string[]) {
	const $ = shell(path);
	for (const tag of tags) {
		const result = await $`git tag "${tag.replace(
			/("|\$|\\)/g,
			(s) => "\\" + s,
		)}"`;
		if (result.code > 0) {
			repos.push(path);
			console.error(result.stdall);
			throw new Error("Could not create tag " + tag);
		}
	}
}

export function cleanup() {
	repos.forEach((path) => rmSync(path, { recursive: true, force: true }));
}

afterEach(() => cleanup());

it("creates repository", async () => {
	const path = await createRepository();
	expect(existsSync(path)).toBeTruthy();
});
