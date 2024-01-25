"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jamesons_actions_toolkit_1 = require("jamesons-actions-toolkit");
const node_os_1 = require("node:os");
const semver_1 = require("semver");
const iter_1 = require("../../util/iter");
const $ = new jamesons_actions_toolkit_1.Cash((0, node_os_1.type)() === "Windows_NT" ? jamesons_actions_toolkit_1.PowerShell : jamesons_actions_toolkit_1.Bash);
$.ignoreExitCode = true;
const versionSemver = /^v[0-9]+\.[0-9]+\.[0-9]+/;
function parseVersion(tag) {
    if (!versionSemver.test(tag))
        return;
    return new semver_1.SemVer(tag.substring(1), {
        includePrerelease: false,
        loose: false,
    });
}
async function getHighestVersionInRepository(gitUrl, pattern) {
    // prettier-ignore
    const result = $ `git ls-remote --quiet --tags ${gitUrl}${pattern ? ` "${pattern}"` : ""}`;
    let v = undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const line of (0, iter_1.iterateReadable)(result.stdout)) {
        const reference = line.substring(0, 40);
        if (line.endsWith("^{}"))
            continue;
        const version = parseVersion(line.substring(51, line.length));
        if (!version)
            continue;
        if (v === undefined)
            v = { reference, version };
        else if (version.compare(v.version) === 1)
            v = { reference, version };
    }
    const awaitedResult = await result;
    if (awaitedResult.code > 0) {
        console.error(awaitedResult.stdall);
        throw new Error("Could not get tags of repository");
    }
    return v;
}
exports.default = getHighestVersionInRepository;
