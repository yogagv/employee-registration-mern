import Admin from '../models/AdminSchema.js'
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';



//Generate secret key
// const secretKey = crypto.randomBytes(32).toString('hex');
// console.log(secretKey);


//Generate Token for Admin
const generateToken = (admin) => {

    return jwt.sign({id:admin._id, role:admin.role}, process.env.JWT_SECRET_KEY, {expiresIn: '2d'});
}



//Register Admin
export const registerAdmin = async (req,res,next) => {

    const {adminname, email, password, mobno} = req.body;

    //regex validation (server-side)

    const nameRegex = /^[a-zA-Z]{3,}(?:\s[a-zA-Z]{1,})?$/;
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9]{3,}[@]{1}[a-zA-Z]{3,}\.[a-zA-Z]{2,}$/;
    const passwordRegex =  /^(?=.*[A-Za-z0-9])(?=.*[@#$%^&*!])[A-Za-z0-9@#$%^&*!]{8,}$/;
    const mobnoRegex = /^[8,9,6][0-9]{9}$/

    if(!adminname || !nameRegex.test(adminname)) {

        return res.status(400).json({success:false, message:'Admin name must be at least 3 character and only alphabets are allowed.'});
    }

    if(!email || !emailRegex.test(email)) {

        return res.status(400).json({success:false, message:'Invalid email address.'}); 
    }

    if(!password || !passwordRegex.test(password)) {

        return res.status(400).json({success:false, message:'Passowrd must be 8 character at least one letter, one number and one special character must be included.'});
    }

    if(!mobno || !mobnoRegex.test(mobno)) {

        return res.status(400).json({success:false, message:'Invalid Mobile no.'});
    }

    try {

        let admin = await Admin.findOne({email : email})

        if(admin) {

            return res.status(400).json({success:false, message:'Admin already exist'})
        }

        //password hashing

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        admin = new Admin({

            adminname,
            email,
            password: passwordHash,
            mobno

        });

        await admin.save();

        return res.status(200).json({success:true, message:'Admin Registered Successfully'});

    } catch(error) {

        return res.status(500).json({success:false, message:'Internal Server Error!'});

    }

}

//Login Admin

export const loginAdmin = async (req, res, next) => {

    const { email } = req.body;
    
    try{

        let admin = await Admin.findOne({email: email})
        
        if(!admin){

            return res.status(404).json({success:false, message:'Admin not found!'}); 
        }

        //password matching
        const isPasswordmatch = await bcrypt.compare(req.body.password, admin.password);   //req.body.password is the password entered by the user, admin.password is the password stored in the database(hashed password)

        if(!isPasswordmatch) {

            return res.status(400).json({success:false, message:'Invalid Password!'});

        }

        const token = generateToken(admin);

        //login

        const {password, role, ...rest} = admin._doc;
        res.status(200).json({success:true, message:'Admin Logged in Successfully', token, data:{...rest}, role});

    }catch(error) {

        return res.status(500).json({success:false, message:'Login Failed!'});
    }

}



