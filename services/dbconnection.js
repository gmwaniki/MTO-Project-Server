const { Pool } = require("pg");
require("dotenv").config();
module.exports.pool = new Pool({
	user: `${process.env.user}`,
	host: `${process.env.host}`,
	database: `${process.env.database}`,
	password: `${process.env.password}`,
	port: process.env.port,
	ssl: {
		rejectUnauthorized: false,
		//  process.env.NODE_ENV == "production" ? true : false,
	},
});
