# ICS PROJECT

## Tools needed

---

Authentication ->JWT and sessions\
Server -> Express\
Middleware-> express-json, ...\
modules-> npm web 3,africastalking,daraja api, stripe,infura\
database-> postgresql\
Security ->Helmet js,cors,bcrypt\
ORM ->Maybe sequelize\
Api Hosting on Heroku maybe later to AWS if a need arises\
Version_Control-Git on github\
Frontend -> Maybe React but most likely html,css and vanilla js\

#### Database design

---

Database name -> project*database\
\_Tables*

- Users - id,email,password,role,mobile_number,national_id,name
- Accounts - account_id,id(FK),accountindex,role??
- Transactions - id(FK),transaction_id,type(Deposit,withdrawal),current_balance,status
- Organisations - id(FK),org_id,name,purpose,
- Organisations_recipients - recipient_id, name,mobile_number,id_number,org_id(FK),id(FK),current_amount,Renewable,renewal_time,renewal_amount
- Merchants - merchant_id,id(FK),name,purpose,mobile_number,id_number
- Organisation_merchants -

#### Tasks

---

- [x] connection with smartcontract
- [x] performing of basic smart contract functions
- [x] creation of accounts
- [x] performing advanced smart contract functions like transfer,approve and transferFrom
- [x] storage of accounts in the database
- [x] Stripe Webhook to transfer tokens
- [x] Database Transactions
