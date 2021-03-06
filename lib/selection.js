import TextOperation from './text-operation'

// Range has `anchor` and `head` properties, which are zero-based indices into
// the document. The `anchor` is the side of the selection that stays fixed,
// `head` is the side of the selection where the cursor is. When both are
// equal, the range represents a cursor.
export class Range {
  constructor (anchor, head) {
    this.anchor = anchor
    this.head = head
  }

  equals (other) {
    return this.anchor === other.anchor && this.head === other.head
  }

  isEmpty () {
    return this.anchor === this.head
  }

  transform (other) {
    function transformIndex (index) {
      let newIndex = index
      const ops = other.ops
      for (let i = 0, l = other.ops.length; i < l; i++) {
        if (TextOperation.isRetain(ops[i])) {
          index -= ops[i]
        } else if (TextOperation.isInsert(ops[i])) {
          newIndex += ops[i].length
        } else {
          newIndex -= Math.min(index, -ops[i])
          index += ops[i]
        }
        if (index < 0) {
          break
        }
      }
      return newIndex
    }

    const newAnchor = transformIndex(this.anchor)
    if (this.anchor === this.head) {
      return new Range(newAnchor, newAnchor)
    }
    return new Range(newAnchor, transformIndex(this.head))
  }
}

Range.fromJSON = obj => new Range(obj.anchor, obj.head)

// A selection is basically an array of ranges. Every range represents a real
// selection or a cursor in the document (when the start position equals the
// end position of the range). The array must not be empty.
export default class Selection {
  constructor (ranges) {
    this.ranges = ranges || []
  }

  equals (other) {
    if (this.position !== other.position) {
      return false
    }
    if (this.ranges.length !== other.ranges.length) {
      return false
    }
    // FIXME: Sort ranges before comparing them?
    for (let i = 0; i < this.ranges.length; i++) {
      if (!this.ranges[i].equals(other.ranges[i])) {
        return false
      }
    }
    return true
  }

  somethingSelected () {
    for (let i = 0; i < this.ranges.length; i++) {
      if (!this.ranges[i].isEmpty()) {
        return true
      }
    }
    return false
  }

  // Update the selection with respect to an operation.
  transform (other) {
    for (var i = 0, newRanges = []; i < this.ranges.length; i++) {
      newRanges[i] = this.ranges[i].transform(other)
    }
    return new Selection(newRanges)
  }
}

Selection.Range = Range

// Convenience method for creating selections only containing a single cursor
// and no real selection range.
Selection.createCursor = position => new Selection([new Range(position, position)])

Selection.fromJSON = obj => {
  const objRanges = obj.ranges || obj
  for (var i = 0, ranges = []; i < objRanges.length; i++) {
    ranges[i] = Range.fromJSON(objRanges[i])
  }
  return new Selection(ranges)
}

// Return the more current selection information.
Selection.prototype.compose = other => other

