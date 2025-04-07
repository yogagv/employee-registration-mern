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

                { empname: { $regex: `${search}`, $options: 'i' } },  //`^${search}` - this search single value also like y for yoga.
                { email: { $regex: `${search}`, $options: 'i' } },    // $options - this is for case sensitive.
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

                return res.status(404).send({success:false, message:'No employee found!'});
              
            }                                 

        res.status(200).send({success:true, message:'Employees retrieved successfully',  employeeCount, 
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

    const employee = await Employee.findById(empId);


    //Regex Validation

    const nameRegex = /^[a-zA-Z]{3,}(?:\s[a-zA-Z]{1,})?$/;
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9]{3,}[@]{1}[a-zA-Z]{3,}\.[a-zA-Z]{2,}$/;
    const passwordRegex =  /^(?=.*[A-Za-z0-9])(?=.*[@#$%^&*!])[A-Za-z0-9@#$%^&*!]{8,}$/;
    const mobnoRegex = /^[8,9,6][0-9]{9}$/;
    const empImageRegex = /\.(png|jpg|jpeg)$/i;

    const allowedDesignations = ['HR', 'Manager', 'Team Lead', 'Sr. Developer', 'Developer', 'SDE I', 'SDE II', 'Accountant'];
    const allowedGenders = ['Male', 'Female', 'Thirdgender'];

    try {

        const { empname, email, password, mobno, designation, gender, empImage } = req.body;

        let updatedData = { empname,  mobno, designation, gender, empImage };

        const changedFields = [];


        if (email && email !== employee.email) {

            return res.status(400).json({ success: false, message: "Email cannot be updated." });
        }

        if (empname && empname !== employee.empname) {

            if(!nameRegex.test(empname)) {

                return res.status(400).json({success:false, message:'Admin name must be at least 3 character and only alphabets are allowed.'});
            }
            
            updatedData.empname = empname;
            changedFields.push("empname");
        }
        

        if(mobno && mobno !== employee.mobno){
    
        if(!mobno || !mobnoRegex.test(mobno)) {
    
            return res.status(400).json({success:false, message:'Invalid Mobile no.'});
        }

        updatedData.mobno = mobno;
        changedFields.push("mobno");

         }

         if(designation && designation !== employee.designation){
            
            updatedData.designation = designation;
            changedFields.push("designation");

    }
    
        if(gender && gender !== employee.gender) {
    
            updatedData.gender = gender;
            changedFields.push("gender");
        }

        if(empImage && empImage !== employee.empImage){
    
        if(!empImageRegex.test(empImage)) {
    
            return res.status(400).json({success:false, message:'Invalid image URL!'})
        }

        updatedData.empImage = empImage;
        changedFields.push("empImage");

    }
        for (const key in updatedData) {
        if (updatedData[key] && updatedData[key] !== employee[key]) {
        changedFields.push(key);
        }
    }

        // If password is present in the request, hash it
        if (password) {

                if(!passwordRegex.test(password)) {
        
                    return res.status(400).json({success:false, message:'Passowrd must be 8 character at least one letter, one number and one special character must be included.'});
                }
        
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updatedData.password = hashedPassword;
            changedFields.push("password");
        }

        if (changedFields.length === 0) {
            return res.status(400).json({ success: false, message: "No valid fields provided to update." });
        }
    
        updatedData.updatedBy = {id: adminId, name: admin.adminname, role: admin.role}

        updatedData.updatedFields = [...new Set(changedFields)];

    //for password hashing we don't directly call req.body.

    // const employeeUpdate = await Employee.findByIdAndUpdate(empId, {$set : req.body}, {new:true});

    const employeeUpdate = await Employee.findByIdAndUpdate(empId, {$set : updatedData}, {new:true}).select('-password');

    res.status(200).send({success:true, message:'Employee Details Updated Successfully!', data: employeeUpdate, updatedBy: updatedData.updatedBy, updatedFields: updatedData.updatedFields});

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
