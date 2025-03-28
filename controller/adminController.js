import Admin from '../models/AdminSchema.js';

export const getAllAdmins = async (req, res) => {

    try{

        const admins = await Admin.find().select('-password');               //select method removes the password from the response

        res.status(200).send({success: true, message:'Admins fetched successfully', data: admins});

    }catch (error) {

        return res.status(404).send({success: false, message: 'Admin not Found!'})

    }
}

//singleAdmin

export const getSingleAdmin = async (req, res, next) => {

    const adminId = req;
    console.log(adminId);
    

    try{

        //find admin by id

    }catch(error){

        res.status(404).send({success: false, message:"Admin not found!"})
    }
}