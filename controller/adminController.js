import mongoose from 'mongoose';
import Admin from '../models/AdminSchema.js';

export const getAllAdmins = async (req, res) => {

    const adminCount = await Admin.countDocuments();

    try{

        const admins = await Admin.find().select('-password');               //select method removes the password from the response

        res.status(200).send({success: true, message:'Admins fetched successfully', adminCount, data: admins});

    }catch (error) {

        return res.status(404).send({success: false, message: 'Admin not Found!'})

    }
}

//singleAdmin

export const getSingleAdmin = async (req, res, next) => {

    const adminId = req.params.id;
 
    try{

        //find admin by id

        const admin = await Admin.findById(adminId)

        if(!admin){

            return res.status(404).send({success:false, message:"Admin not found!"})
        }

        //  res.status(200).send({success:true, message:'Admin fetched successfully', data: admin}); //instead of directly gettingv the admin data, we can go with destructuring for better response and security.

        const {password, ...rest} = admin._doc;

        return res.status(200).send({succes:true, message:"Admin fetched successfully", data: {...rest}});

    }catch(error){

        return res.status(500).send({success: false, message:"Internal Server Error!"})
    }
}


//updateAdmin

export const updateAdmin = async (req, res, next) => {

    const id = req.params.id;
    
    try{

        //we don't need this since we checked this in restrict middleware!

        // if(!mongoose.Types.ObjectId.isValid(id)){

        //     return res.status(404).send({success:false, message:'Admin not found!'})

        // }

        const adminProfileUpdate = await Admin.findByIdAndUpdate(id, {$set: req.body}, {new:true});

            return res.status(200).send({success:true, message:'Admin profile updated successfully', data: adminProfileUpdate});

    }catch(error){

        return res.status(500).send({success:false, message:'Faild to update admin profile!'})

    }
}

//deleteAdmin

export const deleteAdmin = async (req, res, next) => {

    const id = req.params.id;

    try{


        //we don't need this since we checked this in restrict middleware!

        // if(!mongoose.Types.ObjectId.isValid(id)){

        //     return res.status(404).send({success:false, message:'Admin not found'})
        // }

            //deleteadmin
            const admin = await Admin.findByIdAndDelete(id);

            if(!admin){

                return res.status(404).send({success:false, message:'Admin not found'})
            }

                return res.status(200).send({success:true, message:'Admin deleted successfully'})

    } catch(error) {

            return res.status(500).send({success:false, message:'Failed to delete admin'})

    }

}