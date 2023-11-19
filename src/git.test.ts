import { PowerShell, Bash, Cash } from "jamesons-actions-toolkit";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { type as os } from "node:os";
import { join } from "node:path";

const repos: string[] = [];

const _cash = os() === "Windows_NT" ? PowerShell : Bash;
const shell = (path: string) => {
	const cash = new Cash(_cash);
	cash.spawnOptions.cwd = path;
	return cash;
};

export async function createRepository(): Promise<string> {
	const path = join(process.cwd(), randomUUID());
	mkdirSync(path, { recursive: true });
	const $ = shell(path);
	await $`git init`;
	repos.push(path);
	return path;
}

export async function emptyCommit(path: string, message = "initial commit") {
	const $ = shell(path);
	await $`git commit --allow-empty -m "${message.replace(
		/("|\$|\\)/g,
		(s) => "\\" + s,
	)}"`;
}

export async function createTags(path: string, ...tags: string[]) {
	const $ = shell(path);
	for (const tag of tags) {
		await $`git tag "${tag.replace(/("|\$|\\)/g, (s) => "\\" + s)}"`;
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
