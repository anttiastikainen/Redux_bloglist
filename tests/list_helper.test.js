const listHelper = require('../utils/list_helper')
const helper = require('./test_helper')

test('dummy returns one', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    expect(result).toBe(1)
})

describe('total likes', () => {
    const emptyList = []
    const listWithOneBlog = [
        {
            _id: '5a422aa71b54a676234d17f8',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url:
            'http://www.u.arizona.edu/~rubison/copyright_violations/Go_To_Considered_Harmful.html',
            likes: 5,
            __v:0
        }
    ]

    test('of empty list is zero', () => {
        const emptyResult = listHelper.totalLikes(emptyList)
        expect(emptyResult).toBe(0)
    })

    test('when list has only one blog equals the likes of that', () => {
        const result = listHelper.totalLikes(listWithOneBlog)
        expect(result).toBe(5)
    })

    test('of a bigger list is calculated right', () => {
        const bigResult = listHelper.totalLikes(helper.testBlogs)
        expect(bigResult).toBe(36)
    })
})

test('Favoriteblog returns blog with the most likes', () => {
const blogs = helper.testBlogs 
const result = listHelper.favoriteBlog(blogs)
expect(result).toEqual( 
    {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        likes: 12
    })


})

test('mostBlogs returns author and blog count of the author with most blogs', () => {
const blogs = helper.testBlogs 
const mostBlogsAuthor = listHelper.mostBlogs(blogs)
expect(mostBlogsAuthor).toEqual(
    {
        author: "Robert C. Martin",
        blogs: 3
    })
})

test('mostLikes returns author and like count with, whose blogs have most likes', () => {
const blogs = helper.testBlogs 
const mostLikesAuthor = listHelper.mostLikes(blogs)
expect(mostLikesAuthor).toEqual(
    {
        author: "Edsger W. Dijkstra",
        likes: 17
    })
})



