module.exports = function(el, start, length) {
  var caretOffset, elRange, position, range, sel, selected;
  var isContentEditable = el.getAttribute('contenteditable')
  if (length == null) {
    length = 0;
  }
  if (arguments.length === 1) {
    caretOffset = 0;
    selected = 0;
    range = window.getSelection().getRangeAt(0);
    elRange = range.cloneRange();
    selected = range.toString().length;
    elRange.selectNodeContents(el);
    elRange.setEnd(range.endContainer, range.endOffset);
    position = elRange.toString().length;
    if (selected) {
      position -= selected;
    }
    return {
      start: position,
      length: selected
    };
  } else if (start === 'all') {
    if (isContentEditable) {
      range = document.createRange();
      range.selectNodeContents(el);
      sel = window.getSelection();
      sel.removeAllRanges();
      return sel.addRange(range);
    } else {
      return el.select();
    }
  } else {
    if (typeof start !== "number") {
      length = start.length;
      start = start.start;
    }
    if (isContentEditable) {
      range = document.createRange();
      range.setStart(el.firstChild, start);
      range.setEnd(el.firstChild, start + length);
      sel = window.getSelection();
      sel.removeAllRanges();
      return sel.addRange(range);
    } else {
      return el.setSelectionRange(start, start + length);
    }
  }
};