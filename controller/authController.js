import Admin from '../models/AdminSchema.js'
import Employee from '../models/EmployeeSchema.js'
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

//Generate Token
const generateToken = (admin) => {

    return jwt.sign({id:admin._id, role:admin.role}, process.env.JWT_SECRET_KEY, {expiresIn: '2d'});
} 

//Generate secret key
// const secretKey = crypto.randomBytes(32).toString('hex');
// console.log(secretKey);


//Register Admin
export const registerAdmin = async (req,res,next) => {

    const {adminname, email, password, mobno} = req.body

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