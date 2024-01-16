"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jamesons_actions_toolkit_1 = require("jamesons-actions-toolkit");
function today(now = new Date()) {
    return [
        now.getFullYear().toString(),
        (now.getMonth() + 1).toString().padStart(2, "0"),
        now.getDate().toString().padStart(2, "0"),
    ].join("-");
}
/* eslint-disable @typescript-eslint/no-non-null-assertion */
function getVersion() {
    return [
        process.env.GITHUB_RUN_NUMBER,
        process.env.GITHUB_RUN_ATTEMPT,
        today(),
        process.env.GITHUB_SHA.substring(0, 7),
    ]
        .filter((i) => !!i)
        .join(".");
}
function action(version = getVersion()) {
    (0, jamesons_actions_toolkit_1.setOutput)("version", version);
    (0, jamesons_actions_toolkit_1.notice)(`New version is ${version}`, (0, jamesons_actions_toolkit_1.annotation)({ title: "Versioning" }));
}
exports.default = action;
