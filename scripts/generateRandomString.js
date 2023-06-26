const generateRandomString = function () {
  let string = '';
  const numbersCharCodeRange = [48, 57];
  const upperCharCodeRange = [65, 90];
  const lowerCharCodeRange = [97, 122];

  for (let i = numbersCharCodeRange[0]; i <= numbersCharCodeRange[1]; i++) {
    string += String.fromCharCode(i);    
  };
  for (let i = upperCharCodeRange[0]; i <= upperCharCodeRange[1]; i++) {
    string += String.fromCharCode(i);    
  };
  for (let i = lowerCharCodeRange[0]; i <= lowerCharCodeRange[1]; i++) {
    string += String.fromCharCode(i);    
  };

  let rndmStr = '';
  for (let i = 0; i < 6; i++) {
    rndmIndex = Math.floor(Math.random() * string.length);
    rndmStr += string[rndmIndex];
  }
  
  return rndmStr;
}

module.exports = { generateRandomString };