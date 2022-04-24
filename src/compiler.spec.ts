import { compile } from "./compiler";

it("compiles a simple statement", () => {
    expect(compile([{ type: "end" }])).toStrictEqual(["end"]);
});
it("compiles multiple statements", () => {
    expect(compile([{ type: "end" }, { type: "end" }])).toStrictEqual([
        "end",
        "end",
    ]);
});
it("errors on unexpected nesting", () => {
    expect(() =>
        compile([{ type: "end", children: [{ type: "end" }] }])
    ).toThrow();
});
it("compiles simple assignment", () => {
    expect(
        compile([
            { type: "assignment", lvalue: "a", operator: "=", rvalue: "1" },
        ])
    ).toStrictEqual(["set a 1"]);
});
