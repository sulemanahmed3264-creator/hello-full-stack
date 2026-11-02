import greet, { add, multiply } from "./math.js";
import { student } from "./student.js";
console.log(greet("Ali"));
console.log(add(2, 3));
console.log(multiply(4, 5));

const s1 = new student("Ali", 80);
const s2 = new student("Ahmed", 40);

console.log(s1.show());
console.log(s1.isPassed());
console.log(s2.isPassed());
