"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iterateReadable = void 0;
const line = /[\r\n]+/g;
async function* iterateReadable(readable) {
    var _a;
    const reader = readable === null || readable === void 0 ? void 0 : readable.getReader();
    if (reader == null)
        throw new Error("Could not get reader");
    while (true) {
        const result = await reader.read();
        if (result === null || result.done)
            break;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (const l of ((_a = result.value) === null || _a === void 0 ? void 0 : _a.trim().split(line)) || []) {
            yield l;
        }
    }
}
exports.iterateReadable = iterateReadable;
