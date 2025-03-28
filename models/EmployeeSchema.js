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
    mobno: {
        type: Number,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Thirdgender'],
        required: true
    },
    imageUrl: {
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
    admin: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true
        },
        name: {
            type: String,
            required: true
        }
    }
})

export default mongoose.model('Employee', EmployeeSchema)