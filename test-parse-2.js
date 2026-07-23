import { parseNum } from './src/utils/numberUtils.ts';
console.log(parseNum("67883,02"));
console.log(parseNum("67.883,02"));
console.log(parseNum("5,276"));
console.log(parseNum("5.276"));
console.log(parseNum(67883.02));
