import assert from "assert"
import execa from "execa"
import path from "path"

const testPath = path.resolve(".")

function node(args) {
  return execa(process.execPath, args, {
    cwd: testPath,
    reject: false
  })
}

describe("command-line hook", function () {
  this.timeout(0)

  const esmPaths = [
    "../",
    "../index.js",
    "../esm.js"
  ]

  it("should not fail on unresolvable command-line arguments", () =>
    esmPaths
      .reduce((promise, request) =>
        promise
          .then(() =>
            node([
              "./node_modules/cli-hook-pass",
              "UNRESOLVABLE_VALUE",
              request
            ]))
          .then(({ stderr }) => assert.strictEqual(stderr, ""))
      , Promise.resolve())
  )

  it("should inspect JSON encoded command-line arguments", () =>
    esmPaths
      .reduce((promise, request) =>
        promise
          .then(() =>
            node([
              "./node_modules/cli-hook-pass",
              '{"r":"' + request + '"}'
            ]))
          .then(({ stdout }) => assert.ok(stdout.includes("cli-hook:true")))
      , Promise.resolve())
  )

  it("should not support sideloading `.mjs` files", () =>
    esmPaths
      .reduce((promise, request) =>
        promise
          .then(() =>
            node([
              "./node_modules/cli-hook-fail",
              request
            ]))
          .then(({ stderr }) => assert.ok(stderr.includes("[ERR_REQUIRE_ESM]")))
      , Promise.resolve())
  )
})
