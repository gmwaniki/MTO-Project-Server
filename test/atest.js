const { accountbalance } = require("../services/tokenclass");

let mainfunc = async () => {
  const promise1 = new Promise((resolve, reject) => {
    resolve({
      name: "George",
    });
  });
  const promise2 = new Promise((resolve, reject) => {
    resolve({
      secondname: "Ng'ang'a",
    });
  });
  const promise3 = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        name: "Mwaniki",
      });
    }, 5000);
  });

  let myfunct = async () => {
    let myuser = await Promise.all([
      promise1,
      promise2,
      promise3,
      { balance: (await accountbalance(0)).balance },
    ]);
    // console.log(myuser);
    return myuser;
  };
  console.log(await myfunct());

  let arrayofpromises = [promise1, promise2, promise3];
  let promisses = [];
  for await (const iterator of arrayofpromises) {
    promisses.push(iterator);
  }
  console.log(promisses);
};

// mainfunc();
