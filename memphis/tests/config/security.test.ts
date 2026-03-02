import { describe, it, expect } from "vitest";
import { buildSecurityConfig } from "../../src/config/loader.js";

describe("Security config validation", () => {
  it("throws when default workspace is not defined", () => {
    expect(() => buildSecurityConfig({ workspaces: [{ id: "foo" }] as any, defaultWorkspace: "bar" })).toThrow(/Default workspace "bar" is not defined/);
  });

  it("throws when workspace IDs are duplicated", () => {
    expect(() => buildSecurityConfig({ workspaces: [{ id: "dup" }, { id: "dup" }] as any, defaultWorkspace: "dup" })).toThrow(/Duplicate workspace id: dup/);
  });
});
