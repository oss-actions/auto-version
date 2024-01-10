"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jamesons_actions_toolkit_1 = require("jamesons-actions-toolkit");
const getHighestVersionInRepository_1 = __importDefault(require("./getHighestVersionInRepository"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version: actionVersion } = require("../package.json");
async function action() {
    const token = (0, jamesons_actions_toolkit_1.getInput)("token", { type: jamesons_actions_toolkit_1.string });
    const refuseMajorIncrement = (0, jamesons_actions_toolkit_1.getInput)("refuse_major_increment", {
        type: jamesons_actions_toolkit_1.boolean,
    });
    let increment = (0, jamesons_actions_toolkit_1.getInput)("increment", { type: jamesons_actions_toolkit_1.string });
    switch (increment) {
        case "major":
        case "minor":
        case "patch":
            break;
        default:
            throw new Error(`Invalid version increment '${increment}'`);
    }
    const hard = (0, jamesons_actions_toolkit_1.getInput)("hard", { type: jamesons_actions_toolkit_1.boolean });
    const repository = process.env.GITHUB_REPOSITORY;
    if (!repository)
        throw new Error("Missing $GITHUB_REPOSITORY");
    (0, jamesons_actions_toolkit_1.notice)(`Using semver action v${actionVersion}`, (0, jamesons_actions_toolkit_1.annotation)({ title: "Versioning" }));
    const currentHighestTag = await (0, getHighestVersionInRepository_1.default)(`https://github-actions:${token}@github.com/${repository}.git`);
    if (increment === "major" && refuseMajorIncrement) {
        (0, jamesons_actions_toolkit_1.error)("Major, or breaking changes has been blocked", (0, jamesons_actions_toolkit_1.annotation)({ title: "versioning" }));
        process.exit(1);
    }
    if (!currentHighestTag) {
        const version = increment === "major" ? "1.0.0" : "0.1.0";
        (0, jamesons_actions_toolkit_1.setOutput)("version", version);
        (0, jamesons_actions_toolkit_1.setOutput)("tag", "v" + version);
        (0, jamesons_actions_toolkit_1.setOutput)("branch", "none");
        (0, jamesons_actions_toolkit_1.setOutput)("branch_sha", "none");
        (0, jamesons_actions_toolkit_1.notice)(`New version is '${version}', increment was '${increment}'`, (0, jamesons_actions_toolkit_1.annotation)({ title: "Versioning" }));
        return;
    }
    if (currentHighestTag.version.major === 0 && increment === "major" && !hard) {
        increment = "minor";
        (0, jamesons_actions_toolkit_1.notice)("Version increment is set to 'minor', because breaking changes is allowed in development (v0)", (0, jamesons_actions_toolkit_1.annotation)({ title: "Versioning" }));
    }
    if (currentHighestTag.version.major !== 0 && increment === "major") {
        (0, jamesons_actions_toolkit_1.setOutput)("branch", "release/v" + currentHighestTag.version.major);
        (0, jamesons_actions_toolkit_1.setOutput)("branch_sha", currentHighestTag.reference);
    }
    else {
        (0, jamesons_actions_toolkit_1.setOutput)("branch", "none");
        (0, jamesons_actions_toolkit_1.setOutput)("branch_sha", "none");
    }
    const newVersion = currentHighestTag.version.inc(increment);
    const version = newVersion.format();
    (0, jamesons_actions_toolkit_1.setOutput)("version", version);
    (0, jamesons_actions_toolkit_1.setOutput)("tag", "v" + version);
}
exports.default = action;
