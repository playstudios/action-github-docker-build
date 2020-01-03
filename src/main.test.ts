import "jest";
import { argFromEnvArray } from "./main";

describe("argFromEnvArray", () => {
    
    test("empty build_args returns empty string array", async () => {
        expect(argFromEnvArray("--build_args", "".split(","))).toHaveLength(0)
    });

})
