const express = require('express');
const morgan=require('morgan');
const bodyParser=require('body-parser');
const cors=require('cors');

const mainRoutes=require('./routes/main-routes');

const app=express();

//morgan logger as development
app.use(morgan('dev'));

//cors middleware
app.use(cors());


//middleware
// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//routes
app.use("/", mainRoutes);

const PORT=process.env.PORT || 3001;

app.listen( PORT,()=>{
    console.log(`Server is up and running on port ${PORT}`);
})