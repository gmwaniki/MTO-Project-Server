let myobj = {
  name: "",
  age: 0,
  secondname: "",
};

// let notwithvalue = Object.entries(myobj).map((item) => {
//   if (item[1] == "") {
//     console.log("yes");
//     return item;
//   } else {
//     console.log("no");
//   }
// });
// console.log(notwithvalue);
// if (notwithvalue.every((value) => value === undefined)) {
//   console.log("great");
// } else {
//   console.log("problem");
// }

let theempty = {};

for (const key in myobj) {
  if (myobj[key] === "") {
    theempty = { ...theempty, [key]: myobj[key] };
  } else {
    console.log("pass");
  }
}
console.log(Object.keys(theempty).toString());
