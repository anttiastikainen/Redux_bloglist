const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

// prevent creating new user if password is not given or too short
    if(request.body.password === undefined || request.body.password.length < 3){
        response.status(400).json({error: `password not given, or it is too short (less than 3 characters)`}).end()
    }
    else
    {
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password, saltRounds)

        const user = new User ({
            username,
            name,
            passwordHash,
        })

        const savedUser = await user.save()

        response.status(201).json(savedUser)
    }

})

usersRouter.get('/', async (request, response) => {
    const user = await User
        .find({}).populate('blogs', { title: 1, url:1, author:1 })

    response.json(user)
})

module.exports = usersRouter
