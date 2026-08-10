function dots(str) {
  if (str.length === 0) return [];
  if (str.length === 1) return [str];

  const res = [];

  let subparts = dots(str.slice(1));

  for (let i = 0; i < subparts.length; i++) {
    res.push(str[0] + subparts[i]);
    res.push(str[0] + "." + subparts[i]);
  }

  return res;
}

console.log(dots("abcd"));

module.exports = { dots };
