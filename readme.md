# Miru developer❤️
#### Pagekage updating..

This is project crawl data from muti site, blogtruyen, nettruyenco,..etc.. 
## Features╰(*°▽°*)╯

- Get information basic as name, author, decription, thumbnail,..
- Use cherrio and parser equals htmlparser5 so fast
- Clone list chapters and append image for every a chapters
- Export data to json, PDF

## Model [Blogtruyen](https://blogtruyen.vn/) 💕

```js
{
  type: 'blogtruyen',
  name: String,
  thumbnail: String,
  info: {
    nameOther: [ String ],
    author: [ String ],
    source: [ String ],
    teamTranslate: [ String ],
    genres: [ String ],
    origin: { postBy: String, status: String }
  },
  desc: String,
  create_date: String,
  chapters: [
        {
          name: String,
          link: String,
          create: {
              date: String,
              hour: String,
          },
          images: [String]
        },
    ]
}
```
## Model [Nettruyen](http://www.nettruyenco.com/) 💕

```js
{
  type: String,
  name: String,
  desc: String,
  thumbnail: String,
  nameAuthor: [ String ],
  status: String,
  genres: [ String ],
  chapters: [
        {
          name: String,
          link: String,
          updated_date: String,
          images: [String]
        },
    ]
}
```

## Surport site 👻

| Name | Link WebSite |
| ------ | ------ |
| Nettruyen | [http://www.nettruyenco.com/]() |
| Blogtruyen | [https://blogtruyen.vn/]() |

## Development

Only me! if you want contact me at [Miru](https://www.facebook.com/profile.php?id=100055852021653)
