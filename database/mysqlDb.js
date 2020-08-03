const blueBird          =   require('bluebird');
const mysql             =   require('mysql');


const connection=mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password: '786Hh@786',
    database : 'e-commerce'
})

connection.connect((err)=>{
   if(err) throw err;
   
   console.log(`MYSQL Database connected with port 3303...`);

})

global.db=blueBird.promisifyAll(connection);
module.exports=db;
