const dummy = (blogs) => {
    return 1;
}

const totalLikes = (blogs) => {
    let likes = 0;

    for ( let i = 0; i < blogs.length; i++)
    {
        likes = likes + blogs[i].likes;
    }
    return likes;
}

favoriteBlog = (blogs) => {
    let favoriteBlog = {
        title: '',
        author: '',
        likes: 0
    }

    for( let i = 0; i < blogs.length; i++)
    {
        if(blogs[i].likes > favoriteBlog.likes)
        {
            favoriteBlog.title=blogs[i].title
            favoriteBlog.author=blogs[i].author
            favoriteBlog.likes=blogs[i].likes
        }
    }
    return favoriteBlog
}

mostBlogs = (blogs) => {
    let blogCount = {};

    blogs.forEach(function (blog) {
    const author = blog.author
    blogCount[author] = (blogCount[author] || 0) +1
    }) 

    let mostBlogsAuthor = ""
    let mostBlogsCount = 0

    for(const author in blogCount) {
        if(blogCount[author] > mostBlogsCount) {
            mostBlogsAuthor = author
            mostBlogsCount = blogCount[author]
        }
    }

    const result = {
        author: mostBlogsAuthor,
        blogs: mostBlogsCount
    }
    return result

}

mostLikes = (blogs) => {
  let likeCount = {};

  blogs.forEach(function (blog) {
      const author = blog.author
      const likes = blog.likes
      likeCount[author] = (likeCount[author] || 0) + likes
  })

  let mostLikesAuthor = ""
  let mostLikesCount = 0

  for (const author in likeCount) {
      if(likeCount[author] > mostLikesCount) {
          mostLikesAuthor = author
          mostLikesCount = likeCount[author]
      }
  }

  const result = {
      author: mostLikesAuthor,
      likes: mostLikesCount
  }
  return result;
      
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}
