import { parseSearchQuery } from "./location";
type MyType = {
  hoo: string;
  bar: string;
};
describe("parseSearchQuery", () => {
  it("should work", () => {
    const result = parseSearchQuery<MyType>("?hoo=hoge&bar=moge");
    expect(result.hoo).toBe("hoge");
    expect(result.bar).toBe("moge");
  });
});
