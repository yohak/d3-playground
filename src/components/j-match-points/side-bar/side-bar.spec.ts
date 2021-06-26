import { __TEST__, ALL_CHECK } from "./side-bar";
import { Visibility } from "../atoms";

const {
  findFocusTeam,
  toggleVisibility,
  toggleAllVisibility,
  sumGetStatus,
} = __TEST__;

describe("using visibilities", () => {
  let visibilities: Visibility[];
  beforeEach(() => {
    visibilities = [
      { team: "a", visible: true },
      { team: "b", visible: true },
      { team: "c", visible: true },
    ];
  });
  describe("toggleVisibility", () => {
    it("should work", () => {
      const result1: Visibility[] = toggleVisibility(visibilities, "b");
      expect(result1[1].visible).toBe(false);
      //
      const result2: Visibility[] = toggleVisibility(result1, "b");
      expect(result2[1].visible).toBe(true);
    });
  });
  describe("toggleAllVisibility", () => {
    it("should work", () => {
      const result1: Visibility[] = toggleAllVisibility(
        visibilities,
        ALL_CHECK.ON
      );
      expect(result1.map((r) => r.visible)).toEqual([false, false, false]);
      //
      const result2: Visibility[] = toggleAllVisibility(
        result1,
        ALL_CHECK.NONE
      );
      expect(result2.map((r) => r.visible)).toEqual([true, true, true]);
    });
  });
});
