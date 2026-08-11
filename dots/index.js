function dots(str) {
  let resArr = [str[0]];

  for (let i = 1; i < str.length; i++) {
    const dotsArr = resArr.map((item) => item + ".");

    resArr = [...resArr, ...dotsArr].map((item) => item + str.charAt(i));
  }

  return resArr;
}

function recDots(str, offset = 1, arr = [str[0]]) {
  if (arr.length === Math.pow(2, str.length - 1)) {
    return arr;
  }

  const dotsArr = arr.map((item) => item + ".");

  arr = [...arr, ...dotsArr].map((item) => item + str.charAt(offset));

  return recDots(str, ++offset, arr);
}

function testDots(str, recursive = false) {
  const possibleCombinations = Math.pow(2, str.length - 1);

  const dotsResult = recursive ? recDots(str) : dots(str);

  const uniqueResult = new Set(dotsResult);

  console.log("dotsResult", dotsResult);
  console.log("uniqueResult", uniqueResult);

  const result =
    uniqueResult.size === possibleCombinations
      ? "Test passed. Received result length equals expected"
      : "Test failed: Different length of received and expected results";

  return result;
}

console.log(testDots("abc", true));
