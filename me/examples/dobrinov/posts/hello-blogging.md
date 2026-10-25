---
title:  "Hello, blogging!"
date: 2022-12-03
---

After postponning this feature for quite a while I am happy to announce that I was finally able to incoroporate blogging capability into [www.jsonme.com](https://www.jsonme.com).

It works similar to [Jekyll](https://www.jekyllrb.com) but saves you some maintenance since all you need to care about is [markdown](https://en.wikipedia.org/wiki/Markdown) (Github flavoured).

# How does it work?
If you have not guessed yet, you are reading a blog post served by this new functionallity. Its source is a [hello-blogging.md](https://github.com/dobrinov/me/blob/main/posts/hello-blogging.md) file located in a [posts](https://github.com/dobrinov/me/tree/main/posts) directory in a [me](https://www.github.com/dobrinov/me) repository in [my Github profile](https://www.github.com/dobrinov/me). Thanks to this the contents of the markdown file can be viewed as a web page located at [https://www.jsonme.com/github/dobrinov/posts/hello-blogging](https://www.jsonme.com/github/dobrinov/posts/hello-blogging).

# How can you create one yourself?

## Creating a jsonme "profile"
In order to start blogging on jsonme.com, you will need to create a "profile" - specify what is your name and how you look like. The blog will look nicer if this information is available.

1. Create a **public** Github repository called **me**.
2. Create a folder on your local machine and call it **me**.
3. Run `git init` inside of it.
4. Create a **me.json** file in it with the following content:
```json
{
  "name": "John Doe",
  "image": "https://example.com/profile-picture.jpg" //  Hint: You can use the URL of your Github avatar for profile picture.
}
```

5. `git commit -am "Create a jsonme profile"`
6. `git remote add origin git@github.com:{yourgithubhandle}/me.git`
7. `git push -u origin main`

## Publishing your first blog post
1. Create a **posts** directory next to **me.json** file that you just created.
2. In the posts directory create a file called **hello-blogging.md** with the following content:
```markdown
---
title:  "Hello, blogging!"
date: 2022-12-03
---
I have just started a [jsonme](https://www.jsonme.com) blog.
```

3. `git commit -am "Create my first jsonme blog post"`
4. `git push`

 **Congratulations!**
 You have just published your blog post. Navigate to [https://www.jsonme.com/github/**{yourgithubhandle}**/posts/hello-blogging](https://www.jsonme.com/github/yourgithubhandle/posts/hello-blogging) to see it.
