let x = [{ key1: "ss", key2: "gg" }, { key1: "ss", key2: "uu" }];
let a = x.find((item) => item.key2 == "gg");
let c = x.indexOf(a);
console.log(c)
x.splice(x.indexOf(a), 1);
console.log(x)