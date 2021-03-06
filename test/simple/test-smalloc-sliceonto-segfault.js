// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var common = require('../common');
var assert = require('assert');

var spawn = require('child_process').spawn;
var alloc = process.binding('smalloc').alloc;
var sliceOnto = process.binding('smalloc').sliceOnto;


// child
if (process.argv[2] === 'child') {

  // test that many slices won't cause early ones to free prematurely
  // note: if this fails then it will cause v8 to seg fault
  var arr = [];
  for (var i = 0; i < 1e4; i++) {
    var a = alloc({}, 256);
    var b = {};
    b._data = sliceOnto(a, b, 0, 1);
    if (i % 2 === 0)
      arr.push(b);
    if (i % 10 === 0) gc();
  }
  var sum = 0;
  for (var i = 0; i < 5e3; i++) {
    sum += arr[i][0];
    arr[i][0] = sum;
  }

} else {
  // test case
  var child = spawn(process.execPath,
                ['--expose_gc', __filename, 'child']);

  child.on('exit', function(code, signal) {
    assert.equal(code, 0, signal);
    console.log('sliceOnto didn\'t segfault');
  });
}
