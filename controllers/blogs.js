const blogsRouter = require('express').Router()
const { process_params } = require('express/lib/router')
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')

blogsRouter.get('', async (request, response) => {
    const blogs = await Blog
        .find({}).populate('user', {username: 1, name:1 })

    response.json(blogs)
})
   blogsRouter.post('/', async (request, response) => {

        const body = request.body

        if(body.title === undefined || body.url === undefined)
            response.status(400).end()
        if(!request.token || !request.user){
            return response.status(401).json({ error: 'Unauthorized' })
        }
            const user = request.user

        const blog = new Blog({
            url: body.url,
            title: body.title,
            author: body.author,
            user: user._id,
            likes: body.likes!==undefined?body.likes:0
        })

        const savedBlog = await blog.save()

        user.blogs =await user.blogs.concat(savedBlog._id)
        await user.save()

        response.status(201).json(savedBlog)
    })

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
        response.json(blog)
    } else {
        response.status(404)
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)

    // can the blog be found?
    if(!blog) {
        return response.status(404).json({ error: 'Blog not found' })
    }
    // is token valid?
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if(!decodedToken.id)
    {
        return response.status(401).json({ error: 'token invalid'})
    }
    // is the logged user the creator of the blog being deleted?
    if(blog.user.toString() !== decodedToken.id) {
        return response.status(403).json({ error: 'unauthorized to delete this blog' })
    }
    // delete the blog
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const { title, author, url, likes } = request.body
    let blog = await Blog.findById(request.params.id)
    if(blog) {

        blog = Blog.findByIdAndUpdate(
            request.params.id,
            { title, author, url, likes },
            { new: true })
            .then(updatedBlog => {
                response.json(updatedBlog)
            })
    } else {
        response.status(400)
    }
})

module.exports = blogsRouter
