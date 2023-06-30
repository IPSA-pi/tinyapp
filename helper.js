const generateRandomString = () => {
  let string = '';
  const numbersCharCodeRange = [48, 57];
  const upperCharCodeRange = [65, 90];
  const lowerCharCodeRange = [97, 122];

  for (let i = numbersCharCodeRange[0]; i <= numbersCharCodeRange[1]; i += 1) {
    string += String.fromCharCode(i);
  }
  for (let i = upperCharCodeRange[0]; i <= upperCharCodeRange[1]; i += 1) {
    string += String.fromCharCode(i);
  }
  for (let i = lowerCharCodeRange[0]; i <= lowerCharCodeRange[1]; i += 1) {
    string += String.fromCharCode(i);
  }

  let rndmStr = '';
  for (let i = 0; i < 6; i += 1) {
    const rndmIndex = Math.floor(Math.random() * string.length);
    rndmStr += string[rndmIndex];
  }

  return rndmStr;
};

const getUserByEmail = (email, users) => {
  // eslint suggests Object.{keys, values, entries}
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

module.exports = { getUserByEmail, generateRandomString };
