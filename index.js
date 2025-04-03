import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoute from './routes/auth.js';
import adminRoute from './routes/admin.js';
import empAuthRoute from './routes/empAuth.js';
import employeeRoute from './routes/employee.js';

//configure dotenv
dotenv.config();

//start the express server
const app = express();

//port configuration
const port = process.env.PORT || 5001;

//connect mongoDB

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connection established");
  } catch (error) {
    console.log("DB Connection error", error);
  }
};

//middleware

//middleware for parsing incoming HTTP requests and responses data in json format. This middleware allows your app to accept JSON data from POST, PUT, and PATCH requests.
app.use(express.json());  

app.use(cookieParser());  //cookie parser middleware for handling cookies and session management(Used in authentication to track logged-in users.)

//cors takes three paraments : origin, success status,  credentials.
app.use(cors({

  // instead of using this,
  // origin: 'http://localhost:5174/'  
  // methods: 'GET, POST, PUT, DELETE, HEAD'
  // credentials: true
  // we can use this
  origin: function(origin, callback){
      return callback(null, true)
  },
  optionsSuccessStatus: 200,
  credentials: true         //for login and logout option we've given credentials true.
}));     



//routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/empAuth", empAuthRoute);
app.use("/api/v1/employee", employeeRoute);

//server configuration
connectDB()
.then(() => {
app.listen(port, ()=>{
    console.log(`Port is running on ${port}`);
})
})
.catch((error)=> {    
    console.log(error)
});
