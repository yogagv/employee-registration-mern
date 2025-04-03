import Admin from "../models/AdminSchema.js";
import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const authToken = req.headers.authorization;

  if (!authToken || !authToken.startsWith("Bearer")) {
    return res.status(401).json({ success: false, message: "Access Denied!" });
  }

  try {
    /*
        [
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",  // HEADER (Index 0)
            "eyJ1c2VySWQiOiIxMjM0NTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2OTAyMDAwMDB9",  // PAYLOAD (Index 1)
            "sK5vP1gXz6bXvPVVZ9y6E6uX_8L1o2Fy6Yd3_QGnDrg"   // SIGNATURE (Index 2) ]

            PAYLOAD ->
            {
                "userId": "123456",
                "role": "admin",
                
            }
         
        */
    //select only the first part of the token
    const token = authToken.split(" ")[1]; //in token we have 3 parts, id - [0th index], role - [1st index] and secret key - [2nd index]. here we're selecting only the role[1].

    //compare the token, so we're going to decode the token. we're comparing the PAYLOAD with the secret key.

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.adminId = decoded.id;  //'id' comes from JWT payload
    req.role = decoded.role;   //'role' comes from JWT payload
    next();
  } catch (error) {
    if(error.name === 'TokenExpiredError'){

        return res.status(401).send({success: false, message: 'Token Expired!'});
    }
    return res.status(401).send({ success: false, message: "Invalid Token" });
  }
};


//restriction

export const restrict = (role) => async(req, res, next) => {

    try {

        const adminId = req.adminId;  //req.adminId is coming from the authenticate middleware. This middleware extracts id from the JWT token and assigns it to req.adminId.
        const admin = await Admin.findById(adminId);

        if(!admin){
            return res.status(404).send({success:false, message:"Admin not found !!!"});
        }

        const adminRole = admin.role;

        if(adminRole === 'admin' && role.includes('admin')) {   //role in role.includes('admin') is coming from the restrict middleware. This middleware(export const restrict = (role) => async(req, res, next) => {) checks if the role is admin or not.
            next();
        } 
        
        else {
            return res.status(401).send({success: false, message: 'You are not authorized!'});
        }

    } catch(error) {
        
        return res.status(500).send({success: false, message: 'Internal Server Error'});
    }

}
