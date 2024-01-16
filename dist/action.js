"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.action = void 0;
const jamesons_actions_toolkit_1 = require("jamesons-actions-toolkit");
const semver_1 = __importDefault(require("./strategies/semver"));
const dated_1 = __importDefault(require("./strategies/dated"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version: actionVersion } = require("../package.json");
const types = {
    semver: semver_1.default,
    dated: dated_1.default,
};
async function action() {
    (0, jamesons_actions_toolkit_1.notice)(`Using auto-version action v${actionVersion}`, (0, jamesons_actions_toolkit_1.annotation)({ title: "Versioning" }));
    const type = (0, jamesons_actions_toolkit_1.getInput)("type", { type: jamesons_actions_toolkit_1.string })
        .trim()
        .toLowerCase();
    if (!(type in types))
        throw new Error(`Invalid type: ${type}`);
    console.log("Using type: %s", type);
    await types[type]();
}
exports.action = action;
