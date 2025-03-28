import mongoose from 'mongoose'

const AdminSchema = new mongoose.Schema({

    adminname: {
        type: String,
        required: true
    },
    email: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    mobno: {
        type:Number,
        required:true
    },
    role: {
        type:String,
        enum: ['admin'],
        default:'admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('Admin', AdminSchema)