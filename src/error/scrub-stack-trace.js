import ESM from "../constant/esm.js"

import shared from "../shared.js"

function init() {
  const {
    PKG_FILENAMES
  } = ESM

  const columnInfoRegExp = /:1:\d+(?=\)?$)/gm
  const runtimeRegExp = /\w+\u200d\.(\w+)(\.)?/g
  const traceRegExp = /(\n +at .+)+$/

  function scrubStackTrace(stack) {
    if (typeof stack !== "string") {
      return ""
    }

    const match = traceRegExp.exec(stack)

    if (match === null) {
      return stack
    }

    const { index } = match

    let trace = stack.slice(index)

    const message = stack.slice(0, index)
    const lines = trace.split("\n")

    return message + lines
      .filter((line) => {
        for (const filename of PKG_FILENAMES) {
          if (line.indexOf(filename) !== -1) {
            return false
          }
        }

        return true
      })
      .join("\n")
      .replace(columnInfoRegExp, ":1")
      .replace(runtimeRegExp, replaceRuntime)
  }

  function replaceRuntime(match, name, dot = "") {
    if (name === "i") {
      return "import" + dot
    }

    if (name === "r") {
      return "require" + dot
    }

    return ""
  }

  return scrubStackTrace
}

export default shared.inited
  ? shared.module.errorScrubStackTrace
  : shared.module.errorScrubStackTrace = init()
