"use strict"

test("test", () => {
  const expected = {
    CJS_JEST_GLOBAL_VAR: "JEST_GLOBAL_VALUE",
    CJS_JEST_GLOBAL_PROP: "JEST_GLOBAL_VALUE",
    ESM_JEST_GLOBAL_VAR: "JEST_GLOBAL_VALUE",
    ESM_JEST_GLOBAL_PROP: "JEST_GLOBAL_VALUE"
  }

  expect(require("../")).toEqual(expected)

  require = require("../../../../../")(module)

  expect(require("../main.js")).toEqual(expected)
})
