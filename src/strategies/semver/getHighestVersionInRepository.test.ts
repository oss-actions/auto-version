import { randomUUID } from "node:crypto";
import getHighestVersionInRepository from "./getHighestVersionInRepository";
import { cleanup, createRepository, createTags, emptyCommit } from "./git.test";
import { join } from "node:path";

afterAll(() => cleanup());

it("gets tags in repo with no tags", async () => {
	expect(
		await getHighestVersionInRepository(await createRepository()),
	).toBeUndefined();
});

it("gets tags in repo with one tag", async () => {
	const repo = await createRepository();
	await createTags(repo);
	await emptyCommit(repo);
	await createTags(repo, "v0.1.0");
	const result = await getHighestVersionInRepository(repo);
	expect(result).toHaveProperty("version");
	expect(result?.version.format()).toStrictEqual("0.1.0");
});

it("gets tags in repo with no valid versions", async () => {
	const repo = await createRepository();
	await createTags(repo);
	await emptyCommit(repo);
	await createTags(repo, "foo");
	const result = await getHighestVersionInRepository(repo);
	expect(result).toBeUndefined();
});

it("gets tags in repo with one invalid tag, and one valid semver version", async () => {
	const repo = await createRepository();
	await createTags(repo);
	await emptyCommit(repo);
	await createTags(repo, "foo");
	await createTags(repo, "v0.1.0");
	const result = await getHighestVersionInRepository(repo);
	expect(result).toHaveProperty("version");
	expect(result?.version.format()).toStrictEqual("0.1.0");
});

it("throws on invalid repository", async () => {
	await expect(
		getHighestVersionInRepository(join(process.cwd(), randomUUID())),
	).rejects.toThrow();
});

it("filters on pattern", async () => {
	const repo = await createRepository();
	await createTags(repo);
	await emptyCommit(repo);
	await createTags(
		repo,
		"foo",
		"v0.1.0",
		"v1.0.0",
		"v2.0.0",
		"v2.1.0",
		"v2.2.0",
		"v2.2.1",
		"v2.2.3",
		"v2.2.2",
	);
	const result = await getHighestVersionInRepository(repo, "v2.*.*");
	expect(result).toHaveProperty("version");
	expect(result?.version.format()).toStrictEqual("2.2.3");
});
