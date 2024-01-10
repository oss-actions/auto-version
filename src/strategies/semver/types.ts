import { SemVer } from "semver";

export interface Tag {
	reference: string;
	version: SemVer;
}
