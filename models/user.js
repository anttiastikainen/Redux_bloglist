const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        minlength:3
    },
    name: String,
    passwordHash: String,
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog'
        }
    ],
})

userSchema.plugin(uniqueValidator)

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        return {
            blogs: returnedObject.blogs,
            username: returnedObject.username,
            name: returnedObject.name,
            id: returnedObject._id.toString()
        }
   }
})

const User = mongoose.model('User', userSchema)

module.exports = User

