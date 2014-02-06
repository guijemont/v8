// Copyright 2013 the V8 project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// Flags: --harmony-iteration --harmony-generators --harmony-scoping --harmony-generator-comprehensions

// Test generator comprehension syntax.


function* g() { yield 1; yield 2;}
function* h() { yield 1; yield 2; yield 3;}

// we don't want to use array comprehension in this test
var array_of_gen = function(gen) {
    var l = [];
    var val;
    for (val of gen)
        l.push(val);
    return l;
};

(function (){
    var gen = (for (x of g()) x);
    assertEquals(gen.next(), { 'value': 1, 'done': false});
    assertEquals(gen.next(), { 'value': 2, 'done': false});
    assertEquals(gen.next(), { 'value': undefined, 'done': true});
})();

(function (){
    var gen = (for (x of g()) x);
    assertEquals(array_of_gen(gen), [1,2])
})();


// Check the scope of the variable used in the forbinding of a generator
// comprehension
(function (){
    var x = 12;
    var gen = (for (x of g()) 2*x);

    assertEquals(12, x);
    assertEquals(gen.next(), { 'value': 2, 'done': false});
    assertEquals(12, x);
    assertEquals(gen.next(), { 'value': 4, 'done': false});
    assertEquals(12, x);
    assertEquals(gen.next(), { 'value': undefined, 'done': true});
    assertEquals(12, x);

})();


(function (){
    var gen = (for (x of g()) for (y of h()) x * y);
    assertEquals([1,2,3,2,4,6], array_of_gen(gen));
})();

function* i() { yield 42; }

// let's do 3 for-ofs!
(function (){
    var meta_gen = (for (x of g()) for (y of h()) for (z of i()) x * y + z)
    assertEquals(array_of_gen(meta_gen), [43,44,45,44,46,48]);
})();

// generator comprehension defined from another comprehension (through
// variable)
(function (){
    var gen = (for (x of g()) x+1);
    var meta_gen = (for (x of gen) for (y of h()) x*y)
    assertEquals(array_of_gen(meta_gen), [2,4,6,3,6,9]);
})();

// generator comprehension defined from another comprehension (directly)
(function (){
    var meta_gen = (for (x of (for (x of g()) x+1)) for (y of h()) x*y)
    assertEquals(array_of_gen(meta_gen), [2,4,6,3,6,9]);
})();

// simple if test
(function (){
    var gen = (for (x of h()) if (x % 2 !== 0) x);
    assertEquals([1,3], array_of_gen(gen));
})();

// Check that "this" has the same value inside the generator as outside of it
var global = this;
var goofy_context = { 'goofy_context': true };
(function (){
    assertEquals(this, goofy_context);
    var gen = (for (x of i()) this);
    assertEquals({ 'value': goofy_context, 'done': false}, gen.next());
    assertEquals({ 'value': undefined, 'done': true}, gen.next());
}).call(goofy_context);

// Check that "arguments" has the same value inside the generator as outside of it
(function (){
    assertEquals(28, arguments[0])
    var gen = (for (x of i()) arguments[0]);
    assertEquals({ 'value': 28, 'done': false}, gen.next());
    assertEquals({ 'value': undefined, 'done': true}, gen.next());
})(28);
