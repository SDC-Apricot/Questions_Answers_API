test('adds 1 + 2 to equal 3', () => {
  function sum(a, b) {
    return a + b;
  };
  var expected = sum(1,2);
  expect(expected).toBe(3);
});