const line = /[\r\n]+/g;

export async function* iterateReadable(
	readable?: ReadableStream<string> | null,
): AsyncIterableIterator<string> {
	const reader = readable?.getReader();
	if (reader == null) throw new Error("Could not get reader");
	while (true) {
		const result = await reader.read();
		if (result === null || result.done) break;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		for (const l of result.value?.trim().split(line) || []) {
			yield l;
		}
	}
}
