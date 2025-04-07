import mongoose from 'mongoose'

const EmployeeSchema = new mongoose.Schema({

    empname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type:String,
        required:true
    },
    mobno: {
        type: Number,
        required: true
    },
    designation: {
        type: String,
        enum: ['HR', 'Manager', 'Team Lead', 'Sr. Developer', 'Developer', 'SDE I', 'SDE II', 'Accountant'],
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Thirdgender'],
        required: true
    },
    empImage: {
        type: String,
        required:true
    },
    role: {
        type: String,
        enum: ['employee'],
        default: 'employee'
    },
    createdAt : {
        type: Date,
        default: Date.now
    },

    isActive: { 
        type: Boolean, 
        default: true 
    },

    createdBy: {

        type: new mongoose.Schema({

        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        role: {

            type: String,
            required: true
        }
    },

    { _id: false }
), 
        
        required: true
    },

    updatedBy: {
        type: new mongoose.Schema({
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        name: {type: String},
        role: {type: String}
    }, {_id: false})},

    updatedFields: {
        type: [String],
        default: []
      },

    deletedBy: {
        type: new mongoose.Schema({
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        name: {type: String},
        role: {type: String}
    }, {_id: false})}
})

export default mongoose.model('Employee', EmployeeSchema)