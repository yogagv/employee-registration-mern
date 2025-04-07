import Admin from '../models/AdminSchema.js'
import Employee from '../models/EmployeeSchema.js'
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

//Generate secret key
// const secretKey = crypto.randomBytes(32).toString('hex');
// console.log(secretKey);

//Generate Token for Employee

const generateEmpToken = (employee) => {

    return jwt.sign({id:employee._id, role:employee.role}, process.env.JWT_SECRET_KEY, {expiresIn: '2d'});
}

//employeeRegistration

export const employeeRegister = async (req, res, next) => {

    const {empname, email, password, mobno, designation, gender, empImage} = req.body;


    const nameRegex = /^[a-zA-Z]{3,}(?:\s[a-zA-Z]{1,})?$/;
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9]{3,}[@]{1}[a-zA-Z]{3,}\.[a-zA-Z]{2,}$/;
    const passwordRegex =  /^(?=.*[A-Za-z0-9])(?=.*[@#$%^&*!])[A-Za-z0-9@#$%^&*!]{8,}$/;
    const mobnoRegex = /^[8,9,6][0-9]{9}$/;
    const empImageRegex = /\.(png|jpg|jpeg)$/i;

    const allowedDesignations = ['HR', 'Manager', 'Team Lead', 'Sr. Developer', 'Developer', 'SDE I', 'SDE II', 'Accountant'];
    const allowedGenders = ['Male', 'Female', 'Thirdgender'];

    if(!empname || !nameRegex.test(empname)) {

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

    if(!designation || !allowedDesignations.includes(designation)) {

        return res.status(400).json({success:false, message:'Select a Valid Designation.'});
    }

    if(!gender || !allowedGenders.includes(gender)) {

        return res.status(400).json({success:false, message:'Select a Valid Gender.'})
    }

    if(!empImage || !empImageRegex.test(empImage)) {

        return res.status(400).json({success:false, message:'Invalid image URL!'})
    }


    try {

        const id = req.params.id;

        const admin = await Admin.findById(id);
        
        //instead of checking this condition, we can already mentioned in the restrict middleware that only admin can access this route
        
        // if(!mongoose.Types.ObjectId.isValid(id)) {

        //     return res.status(404).json({success:false, message:'Admin not found!'});
        // }

        let employee = await Employee.findOne({email: email});

        if(employee) {

            res.status(400).json({success:false, message:'Employee already exist!'});
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        employee = new Employee({

            empname,
            email,
            password: passwordHash,
            mobno,
            designation,
            gender,
            empImage,
            createdBy : {
                id: id,
                name: admin.adminname,
                role: admin.role
            },
            updatedBy: {
                id: null,
                name: null,
                role: null
            },
            deletedBy: {
                id: null,
                name: null,
                role: null
            }
        })  

        await employee.save();

        return res.status(200).json({success:true, message:'Employee registered successfully!'});

    } catch (error) {

        return res.status(500).json({success:false, message:'Failed to register employee!'});
    }
}


//employeelogin

export const employeeLogin = async(req, res, next) => {

    const {email} = req.body;

    try {

        let employee = await Employee.findOne({email:email});

        if(!employee) {

            return res.status(404).json({success:false, message:'Employee not found!'});
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, employee.password) //req.body.password is the password entered by the user, employee.password is the password stored in the database(hashed password)

        if(!isPasswordMatch) {

            return res.status(400).json({success:false, message:'Incorrect Password!'});
        }

        //token generation

        const token = generateEmpToken(employee);

        const {password, role, ...rest} = employee._doc

            return res.status(200).json({success:true, message:'Employee logged in successfully!', token, data: {...rest}, role});
        

    }catch (error) {

        return res.status(500).json({success:false, message:'Login Failed!'})
    }

}