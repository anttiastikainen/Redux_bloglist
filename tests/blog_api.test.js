const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
    await User.deleteMany({})

    const passwordhash = await bcrypt.hash('sekret',10)
    const user = new User({ username: 'root', passwordhash })

    await user.save()
})



describe('when there is initially some blogs saved', () => {

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('All blog posts are returned', async() => {
        const response = await api.get('/api/blogs')

        expect(response.body).toHaveLength(helper.initialBlogs.length+1)
    })

    test('First blog post is written by Teppo Testaaja', async () => {
        const response = await api.get('/api/blogs/')

        expect(response.body[0].author).toBe('Teppo Testaaja')
    })

    test('blog posts id:s are defined', async() => {
        const response = await api
            .get('/api/blogs')
            .expect(200)

        const ids = response.body.map(r => r.id)

        for(let i = 0; i<ids.length;i++)
        {
            expect(ids[i]).toBeDefined()
        }
    })
})
describe('addition of a new blog', () => {       
    test('Posting blogs works', async() => {
        const blogsAtStart = await helper.blogsInDb()
        const token = await helper.createUserAndToken();
        const newBlog = {
            title: 'Test blog',
            author: 'Teppo Testaaja',
            url: 'www.test.fi',
            likes: 2
        }
        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization',`Bearer ${token}`)
            .expect(201)
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(blogsAtStart.length +1)
        expect(blogsAtEnd[blogsAtEnd.length - 1].title).toBe('Test blog')

    })

    test('If like count is not given, it is set to 0', async() => {
        const token = await helper.createUserAndToken()
        const newBlog2 = {
            title: 'Test blog with no likes',
            author: 'Teppo Testaaja',
            url: 'www.test.fi',
        }
        await api
            .post('/api/blogs')
            .send(newBlog2)
            .set('Authorization',`Bearer ${token}`)
            .expect(201)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0)
        expect(blogsAtEnd[blogsAtEnd.length - 1].title).toBe('Test blog with no likes')
    })

    test('If title is not given, 400 response is returned', async() => {
        const newBlog3 = {
            author: 'Teppo Testaaja',
            url: 'www.test.fi',
            likes: 30
        }
        const blogsAtStart = await helper.blogsInDb()

        const token = await helper.createUserAndToken()

        await api 
            .post('/api/blogs')
            .send(newBlog3)
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    })

    test('If url is not given, 400 response is returned', async() => {
        const newBlog4 = {
            title: 'No url blog',
            author: 'Teppo Testaaja',
            likes: 30
        }
        const blogsAtStart = await helper.blogsInDb()
        const token = await helper.createUserAndToken()

        await api 
            .post('/api/blogs')
            .send(newBlog4)
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    })

test('If token is not given, 401 response is returned', async() => {
        const newBlog4 = {
            title: 'No url blog',
            author: 'Teppo Testaaja',
            url: 'www.testi.fi',
            likes: 30
        }
        const blogsAtStart = await helper.blogsInDb()

        await api 
            .post('/api/blogs')
            .send(newBlog4)
            .expect(401)
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
    })

})

describe('deleting a blog', () => {
    test('successful with status code 204 if id is valid', async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initialBlogs)

        const token = await helper.createUserAndToken()

        const newBlog = {
            title: 'Test blog',
            author: 'Teppo Testaaja',
            url: 'www.test.fi',
            likes: 2
        }
        const createBlogResponse =  await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization',`Bearer ${token}`)
            .expect(201)
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length +1)
        expect(blogsAtEnd[blogsAtEnd.length - 1].title).toBe('Test blog')

        const blogToDelete = createBlogResponse.body

        const anotherUser = {
            username: '1anotheruser',
            name: 'another user',
            password: 'anotherpassword'
        }

        await api.post('/api/users').send(anotherUser).expect(201)
        const anotherToken = jwt.sign(anotherUser, process.env.SECRET)

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization',`Bearer ${anotherToken}`)
            .expect(401)

        const blogsIds = blogsAtEnd.map((blog) => blog.id)
        expect(blogsIds).toContain(blogToDelete.id)

    })

    test('fails with status code 400 if id is not valid', async () => {

        const token = await helper.createUserAndToken()

        const nonExistingId = `beae8875577e6dd2c2az`
        await api
            .delete(`/api/blogs/${nonExistingId}`)
            .set('Authorization',`Bearer ${token}`)
            .expect(400)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length+1)
    })
})

describe('modifying a blog', () => {

    test('succeeds with statuscode 200 if id is valid', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToModify = blogsAtStart[0]

        const updatedBlog = {
            likes: 20
        }

        const response = await api 
            .put(`/api/blogs/${blogToModify.id}`)
            .send(updatedBlog)
            .expect(200)

        expect(response.body.likes).toEqual(updatedBlog.likes)
    })

    test('fails with statuscode 400 if id is not valid', async () => {
        const nonExistingId = `beae8875577e6dd2c2az`
        const updatedBlog = {
            likes: 20
        }

        await api 
            .put(`/api/blogs/${nonExistingId}`)
            .send(updatedBlog)
            .expect(400)
    })

})

describe('when there is initially one user at db', () => {
    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'anttiasti',
            name: 'Antti Astikainen',
            password: 'salasana',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length +1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken',
        async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'root',
                name: 'Superuser',
                password: 'salasana',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain('expected `username` to be unique')

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)
        })

    test('creating fails with proper statuscode and message if username is too short',
        async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'ro',
                name: 'Superuser',
                password: 'salasana',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain(`User validation failed: username: Path \`username\` (\`ro\`) is shorter than the minimum allowed length (3).`)

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)
        })

    test('creating fails with proper statuscode and message if password is too short',
        async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'root',
                name: 'Superuser',
                password: 'sa',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain('password not given, or it is too short (less than 3 characters)')

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)
        })

    test('creating fails with proper statuscode and message if password is not defined ',
        async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'root',
                name: 'Superuser',
                password: '',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            expect(result.body.error).toContain('password not given, or it is too short (less than 3 characters)')

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)
        })

})


afterAll(async () => {
    await mongoose.connection.close()
})


