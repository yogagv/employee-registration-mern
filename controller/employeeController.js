import Employee from '../models/EmployeeSchema.js'
import Admin from '../models/AdminSchema.js'
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

//get all employees

// export const getAllEmployees = async (req, res, next) => {

//     const employeeCount = await Employee.countDocuments();


//     try {

//         const employees = await Employee.find().select('-password')

//         res.status(200).send({success:true, message:'All employees retrieved successfully',  employeeCount, data: employees});

//     } catch(error) {

//         res.status(404).send({success:false, message:'No employees found!'});
//     }
// }


export const getAllEmployees = async (req, res, next) => {

    try {

        const {
        
            search = '',
            sortBy = 'createdAt',
            order = 'desc',
            page = 1,
            limit = 10
            
        } = req.query;

        //Filter

        const isValidId = mongoose.Types.ObjectId.isValid(search);

        const filter = search ? {
            $or: [

                { empname: { $regex: `^${search}`, $options: 'i' } },  //`^${search}` - this search single value also like y for yoga.
                { email: { $regex: `^${search}`, $options: 'i' } },    // $options - this is for case sensitive.
                ...(isValidId ? [{ _id: search }] : []),
              ],

        } : {}

        //sort

        const sortFields = ['empname', 'email', '_id', 'createdAt'];
        const sortVal = sortFields.includes(sortBy) ? sortBy : 'createdAt';

        //pagination

        const skipPage = (page - 1) * limit ;

        //count documents

        const employeeCount = await Employee.countDocuments(filter);

        
        //Fetch Employees

        const employees = await Employee.find(filter).select('-password')
                                               .sort({[sortVal]: order === 'desc' ? 1 : -1})
                                               .skip(skipPage)
                                               .limit(parseInt(limit));

        // Check if page exists
         if (skipPage >= employeeCount && employeeCount > 0) {
        
             return res.status(404).send({success: false,message: `Page ${page} does not exist. Total pages: ${Math.ceil(employeeCount / limit)}`,});
         }


         //if no data found
              if(employeeCount === 0) {

                return res.status(404).send({success:false, message:'No employees found!'});
              
            }                                 

        res.status(200).send({success:true, message:'All employees retrieved successfully',  employeeCount, 
                              currentPage : parseInt(page), totalPages : Math.ceil(employeeCount/limit), data: employees});

    } catch(error) {

        
        res.status(500).send({success:false, message:'Internal Server Error!'});
    }
}


//get employee by id

export const getSingleEmployee = async (req, res, next) => {

    const empId = req.params.id

    try {

        const employee = await Employee.findById(empId).select('-password');

        if(!employee) {

            return res.status(404).send({success:false, message:'Employee not found!'});
        }

            const {password, ...rest} = employee._doc;

            return res.status(200).send({success:true, message:'Employee found successfully', data: {...rest}});

    } catch(error) {

            return res.status(500).send({success:false, message:'Internal server error!'})

    }

}


//emp update

export const employeeUpdate = async (req, res, next) => {

    const empId = req.params.id

    const adminId = req.adminId;
    
    const admin = await Admin.findById(adminId); 

    try {

        const { empname, email, password, mobno, designation, gender, empImage } = req.body;

        let updatedData = { empname, email, mobno, designation, gender, empImage };

        // If password is present in the request, hash it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updatedData.password = hashedPassword;
        }
    
        updatedData.updateBy = {id: adminId, name: admin.adminname, role: admin.role}

    //for password hashing we don't directly call req.body.

    // const employeeUpdate = await Employee.findByIdAndUpdate(empId, {$set : req.body}, {new:true});

    const employeeUpdate = await Employee.findByIdAndUpdate(empId, {$set : updatedData}, {new:true}).select('-password');

    res.status(200).send({success:true, message:'Employee Details Updated Successfully!', data: employeeUpdate, updatedBy: updatedData.updateBy});

    }catch (error) {

    res.status(404).send({success:true, message:'unable to update the employee!'});

    }
}


//employee delete

export const employeeDelete = async (req, res, next) => {

    const empId = req.params.id

    const adminId = req.adminId;
    
    const admin = await Admin.findById(adminId);

    try{

        //employee delete
        const employee = await Employee.findById(empId)

        if(!employee) {

            return res.status(404).send({success:false, message:'Employee not Found'})
        }

            employee.deletedBy = {id: adminId, name: admin.adminname, role: admin.role}
            await employee.save()

            await Employee.findByIdAndDelete(empId)


            return res.status(200).send({success:true, message:'Employee deleted successfully!', deletedBy: employee.deletedBy});

    } catch(error) {

    }

}


//employee filter

//employee sort based on name,email, id, create date
