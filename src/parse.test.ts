import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseRoutes } from "./parse.ts";
import { ModuleKind, ScriptTarget } from "typescript";

const snapshotsDir = path.join(import.meta.dirname, "snapshots");
describe("parse", () => {
    it("test basic", async () => {
        const results = parseRoutes([path.join(snapshotsDir, "basic/input.ts")], {
            target: ScriptTarget.ESNext,
            module: ModuleKind.NodeNext
        });
        await expect(JSON.stringify(results, null, 2)).toMatchFileSnapshot(
            path.join(snapshotsDir, "basic/output.json")
        );
    });
    it("test @example", async () => {
        const results = parseRoutes([path.join(snapshotsDir, "@example/input.ts")], {
            target: ScriptTarget.ESNext,
            module: ModuleKind.NodeNext
        });
        await expect(JSON.stringify(results, null, 2)).toMatchFileSnapshot(
            path.join(snapshotsDir, "@example/output.json")
        );
    });
});
