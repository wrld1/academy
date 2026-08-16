function dots(str, val = str[0], index = 1, resArr = []) {
  if (str.length <= 1) return [str];
  if (index === str.length) {
    resArr.push(val);
    return;
  }

  dots(str, val + "." + str[index], index + 1, resArr);
  dots(str, val + str[index], index + 1, resArr);

  return resArr;
}

function testDots(str) {
  const possibleCombinations = Math.pow(2, str.length - 1);

  const dotsResult = dots(str);

  const uniqueResult = new Set(dotsResult);

  console.log("dotsResult", dotsResult);

  const result =
    uniqueResult.size === possibleCombinations
      ? "Test passed. Received result length equals expected"
      : "Test failed: Different length of received and expected results";

  return result;
}

console.log(testDots("a"));
