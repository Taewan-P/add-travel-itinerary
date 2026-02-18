import { describe, expect, it } from "vitest";

import {
  isoToLocalDateTimeInputValue,
  localDateTimeInputValueToIso,
} from "@/lib/date-time";

describe("date-time helpers", () => {
  it("converts datetime-local input to ISO datetime with timezone offset", () => {
    const localValue = "2027-04-11T16:00";

    const isoValue = localDateTimeInputValueToIso(localValue);

    expect(isoValue).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2})$/
    );
    expect(isoToLocalDateTimeInputValue(isoValue)).toBe(localValue);
  });

  it("returns empty string for invalid values", () => {
    expect(localDateTimeInputValueToIso("invalid")).toBe("");
    expect(isoToLocalDateTimeInputValue("invalid")).toBe("");
  });
});
