// import { simplifiedCharset, traditionalCharset } from "./tAndS.js";
// console.log(traditionalCharset.split("").length);
// console.log(simplifiedCharset.split("").length);

// const traditionalToSimplified = {};

// for (let i = 0; i < traditionalCharset.length; i++) {
//   const traditionalChar = traditionalCharset[i];
//   const simplifiedChar = simplifiedCharset[i];
//   traditionalToSimplified[traditionalChar] = simplifiedChar;
// }

import { t2sMapping } from "./t2sMapping.js";



export function toSimplified(text){
  return text.split('').map(char => t2sMapping[char] || char).join('');
}