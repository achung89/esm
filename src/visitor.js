// Based on `PathVisitor` of ast-types.
// Copyright Ben Newman. Released under MIT license:
// https://github.com/benjamn/ast-types

import isObject from "./util/is-object.js"
import keys from "./util/keys.js"
import shared from "./shared.js"

function init() {
  const childNamesMap = new Map

  const childrenToVisit = {
    __proto__: null,
    alternate: true,
    argument: true,
    arguments: true,
    block: true,
    body: true,
    callee: true,
    cases: true,
    consequent: true,
    declaration: true,
    declarations: true,
    discriminant: true,
    elements: true,
    expression: true,
    expressions: true,
    handler: true,
    init: true,
    left: true,
    object: true,
    properties: true,
    right: true,
    test: true,
    value: true
  }

  class Visitor {
    visit(path) {
      this.reset(...arguments)

      const possibleIndexes = this.possibleIndexes || []

      this.possibleEnd = possibleIndexes.length
      this.possibleIndexes = possibleIndexes
      this.possibleStart = 0

      this.visitWithoutReset(path)
    }

    visitWithoutReset(path) {
      const value = path.getValue()

      if (! isObject(value)) {
        return
      }

      if (Array.isArray(value)) {
        path.each(this, "visitWithoutReset")
        return
      }

      const methodName = "visit" + value.type

      if (typeof this[methodName] === "function") {
        // The method must call `this.visitChildren(path)` to continue traversing.
        this[methodName](path)
      } else {
        this.visitChildren(path)
      }
    }

    visitChildren(path) {
      const node = path.getValue()
      const { end, start } = node
      const { possibleIndexes } = this

      const oldLeft = this.possibleStart
      const oldRight = this.possibleEnd

      let left = oldLeft
      let right = oldRight

      if (typeof start === "number" &&
          typeof end === "number") {
        // Find first index not less than `node.start`.
        while (left < right &&
            possibleIndexes[left] < start) {
          left += 1
        }

        // Find first index not greater than `node.end`.
        while (left < right &&
            possibleIndexes[right - 1] > end) {
          right -= 1
        }
      }

      if (left < right) {
        this.possibleStart = left
        this.possibleEnd = right

        const names = getChildNames(node)

        for (const name of names) {
          path.call(this, "visitWithoutReset", name)
        }

        this.possibleStart = oldLeft
        this.possibleEnd = oldRight
      }
    }
  }

  function getChildNames(value) {
    let childNames = childNamesMap.get(value)

    if (childNames) {
      return childNames
    }

    const names = keys(value)
    childNames = []

    for (const name of names) {
      if (Reflect.has(childrenToVisit, name) &&
          isObject(value[name])) {
        childNames.push(name)
      }
    }

    childNamesMap.set(value, childNames)
    return childNames
  }

  Reflect.setPrototypeOf(Visitor.prototype, null)

  return Visitor
}

export default shared.inited
  ? shared.module.Visitor
  : shared.module.Visitor = init()
