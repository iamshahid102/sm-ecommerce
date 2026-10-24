import { classifyDatabaseProbe } from "../src/utils/database-readiness.js";

describe("database readiness classification", () => {
  it("is reachable when every probe query succeeds", () => {
    expect(
      classifyDatabaseProbe([
        { error: null },
        { error: null },
        { error: null },
        { error: null },
      ]),
    ).toBe("reachable");
  });

  it("reports a missing schema when PostgREST cannot find a table", () => {
    expect(
      classifyDatabaseProbe([
        { error: null },
        { error: { code: "PGRST205" } },
        { error: null },
      ]),
    ).toBe("schema_missing");
  });

  it("reports the schema as missing when a missing table is mixed with another error", () => {
    expect(
      classifyDatabaseProbe([
        { error: { code: "PGRST205" } },
        { error: { code: "08006" } },
      ]),
    ).toBe("schema_missing");
  });

  it("is unreachable for network and permission failures", () => {
    expect(
      classifyDatabaseProbe([
        { error: { code: "08006" } },
        { error: { code: "42501" } },
      ]),
    ).toBe("unreachable");
  });
});
