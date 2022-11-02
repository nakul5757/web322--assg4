/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Nakul Mankoo     Student ID: 159486216     Date: 01/11/2022
*
*  Online (Heroku) Link: https://pacific-shelf-34423.herokuapp.com/
*
********************************************************************************/ 

var express = require('express');
var app = express();
var path = require('path');
var blog_service = require('./blog-service.js');
var HTTP_PORT = process.env.PORT || 8080;
var multer = require("multer");
var cloudinary = require('cloudinary').v2
var streamifier = require('streamifier')
var exphbs = require('express-handlebars');
var stripJs = require('strip-js')

function onHTTPStart() {
  console.log('Express http server listening on: ' + HTTP_PORT);
}

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');


app.use(express.static('public'));

app.get("/", (req, res) => {
  res.redirect("/blog");
});

app.get("/about", function (req, res) {
  res.render('about', {
      layout: 'main'
  })
});

app.get("/posts/add", function (req, res) {
  res.render('addPost', {
      layout: 'main'
  })
});

cloudinary.config({
  cloud_name: 'dnyludypg',
  api_key: '678493681447226',
  api_secret: 'aE8NkMKP6wKdQTrOZrNG-5CjVss',
  secure: true
});

const upload = multer();

app.post('/posts/add', upload.single("featureImage"), function (req, res, next) {
  if(req.file)
{
let streamUpload = (req) => {
  return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
          if (result) {
              resolve(result);
          } else {
              reject(error);
          }
          }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

async function upload(req) {
  let result = await streamUpload(req);
  console.log(result);
  return result;
}

upload(req).then((uploaded)=>{
  req.body.featureImage = uploaded.url;
});


}
else
{
processPost("");
}
function processPost(imageUrl){
req.body.featureImage = imageUrl;
};
blog_service.addPost(req.body).then(() => {
res.redirect("/posts");
})
});   


app.get('/blog', async (req, res) => {

  let viewData = {};

  try{
      let posts = [];

      if(req.query.category){
          posts = await blog_service.getPublishedPostsByCategory(req.query.category);
      }else{
          posts = await blog_service.getPublishedPosts();
      }

      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      let post = posts[0]; 

      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      let categories = await blog_service.getCategories();

      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  res.render("blog", {data: viewData})

});


app.get("/posts", function (req, res) {
  if (req.query.category) {
    blog_service.getPostsByCategory(req.query.category).then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "no results" });
        }
      })
      .catch((error) => {
        res.render("posts", { message: error });
      });
  } else if (req.query.minDate) {
    blog_service.getPostsByMinDate(req.query.minDate).then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "no results" });
        }
      })
      .catch((error) => {
        res.render("posts", { message: data});
      });
  } else {
    blog_service.getAllPosts().then((data) => {
        if (data.length > 0) {
          res.render("posts", { posts: data });
        } else {
          res.render("posts", { message: "no results" });
        }
      })
      .catch((error) => {
        res.render("posts", { message: error });
      });
  }
});


  app.get("/post/:value", (req, res) => {
    blog_service.getPostsById(req.params.value).then((data) => {
    res.json(data);
    })
    .catch((err) => {
    res.json(err);
    })
    });
    
    app.get("/categories", (req, res) => {
      blog_service.getCategories().then((data) => {
        res.render("categories", { categories: data });
        res.render("categories", { message: "no results" })
      })
    })


    app.use(function(req, res) {
      res.status(404).end('404 PAGE NOT FOUND');
    });



    app.use(function(req,res,next){
      let route = req.path.substring(1);
      app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
      app.locals.viewingCategory = req.query.category;
      next();
  });

  app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
      navLink: function (url, options) {
        return '<li' +
          ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
          '><a href="' + url + '">' + options.fn(this) + '</a></li>';
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function (context) {
        return stripJs(context);
      }
    }
  }))

  app.get('/blog/:id', async (req, res) => {

    let viewData = {};

    try{

        let posts = [];

        if(req.query.category){
            posts = await blog_service.getPublishedPostsByCategory(req.query.category);
        }else{
            posts = await blog_service.getPublishedPosts();
        }

        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        viewData.post = await blog_service.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        let categories = await blog_service.getCategories();

        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    res.render("blog", {data: viewData})
});

blog_service.initialize()
  .then(function () { app.listen( HTTP_PORT, onHTTPStart); })
  .catch(function (err) { console.log(err);});