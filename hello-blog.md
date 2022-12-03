---
title:  "Hello, blogging!"
date: 2022-11-26
---

After postponning this feature for quite a while I am happy to announce that I was finally able to incoroporate blogging capability into [www.jsonme.com](https://www.jsonme.com).

It works similar to [Jekyll](https://www.jekyllrb.com) but saves you some maintenance since all you need to care about is [markdown](https://en.wikipedia.org/wiki/Markdown) (Github flavoured).

# How does it work?
If you have not guessed yet, you are reading a blog post served by this new functionallity. Its source is a [hello-blogging.md](https://www.github.com/dobrinov/me/posts/hello-blogging.md) file located in a [posts](https://www.github.com/dobrinov/me/posts) directory in a [me](https://www.github.com/dobrinov/me) repository in [my Github profile](https://www.github.com/dobrinov/me). Thanks to this the contents of the markdown file can be viewed as a web page located at [https://www.jsonme.com/github/dobrinov/posts/hello-blogging](https://www.jsonme.com/github/dobrinov/posts/hello-blogging).

Yes, I am fully aware that this is an awesome attack vector, but I am fine with this because the markdown file is actually parsed on your machine and not the jsonme servers.

# How can you create one yourself?

## Creating a "jsonme" profile (skip if you already have such)
1. Create a folder on your local machine and call it `me`.
2. Run `git init` inside of it.
3. Create a `resume.json` file in it with the following content:
```json
{
  "name": "John Doe",
  "image": "https://avatars.githubusercontent.com/u/996877?v=4"
}
```

4. `git commit -am "Creating a jsonme profile"`

## Writting your first blog post
2. Create a "me" repository in your Github (works with Gitlab aswell) profile.
3. In this "me" repository create a directory called "posts" and place the markdown file with your story inside it.
4. That is it! You blog post is public. Check it out at https://www.jsonme.com/github/{yourgithubhandle}/posts/{}
