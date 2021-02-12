const chaiHttp = require("chai-http");
const chai = require("chai");

const should = chai.should();

chai.use(chaiHttp);

const server = require("../index");

describe("should check if id is valid", function () {
  it("should send request to /checkid to see if id is valid ", function (done) {
    chai
      .request(server)
      .post("/api/checkid")
      .set("content-type", "application/json")
      .send({ idnumber: "1734562" })
      .end((err, res) => {
        // console.log(res.body);
        res.should.have.status(200);
        done();
      });
  });
});

describe("should check if mobilenumber is valid", function () {
  it("should send request to /checkmobileniumber with new number", function (done) {
    chai
      .request(server)
      .post("/api/checkmobilenumber")
      .set("content-type", "application/json")
      .send({ mobilenumber: "254731326612" })
      .end((err, res) => {
        // console.log(res.body);
        res.should.have.status(200);
        done();
      });
  });
  it("should send request to /checkmobileniumber with used number", function (done) {
    chai
      .request(server)
      .post("/api/checkmobilenumber")
      .set("content-type", "application/json")
      .send({ mobilenumber: "254731326610" })
      .end((err, res) => {
        // console.log(res.body);
        res.should.have.status(400);
        done();
      });
  });
});

describe("should test login module", function () {
  it("Should login and return a user object", function (done) {
    chai
      .request(server)
      .post("/api/login")
      .set("content-type", "application/json")
      .send({ email: "store@mail.com", password: "12" })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("role");
        done();
      });
  });
});

describe("should get an organisations details", function () {
  it("Should send a request for the organisations details", function (done) {
    chai
      .request(server)
      .post("/api/orgdetails")
      .set("content-type", "application/json")
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
});
