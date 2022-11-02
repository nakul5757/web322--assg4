const res = require('express/lib/response');
const file = require('fs'); 

var exports = module.exports = {};
var posts = [];
var categories = [];


exports.initialize = () => {
    return new Promise ((resolve, reject) => {
        file.readFile('./data/categories.json', (err,data) => {
            if (err) {
                reject ('unable to read file');
            }
            else {
                categories = JSON.parse(data);
            }
        });

        file.readFile('./data/posts.json', (err,data)=> {
            if (err) {
                reject ('unable to read file');
            }
            else {
                posts = JSON.parse(data);
            }
        })
        resolve();
    })
};

exports.getAllPosts = () => {
    return new Promise ((resolve,reject) => {
        if (posts.length == 0) {
            reject('no results returned');
        }
        else {
            resolve(posts);
        }
    })
};


exports.getPublishedPosts = () => {
        var publishPost = [];
        var promise =  new Promise((resolve, reject) => {
                for(var i =0; i < posts.length; i++)
                {   
                    if(posts[i].published == true)
                    {
                        publishPost.push(posts[i]);
                    }
                }

    })
if(publishPost.length === 0)
    {
        reject("No results returned");
    }
        resolve(publishPost);
        return promise;
}
    

exports.getDepartments = () => {
    return new Promise((resolve,reject) => {
        if (departments.length == 0) {
            reject ('no results returned');
        }
        else {
            resolve (departments);
        }
    })
};

//Categories

exports.getCategories = () => {
    var promise = new Promise((resolve, reject) => {
        if (categories.length == 0) {
            reject("No results returned");
    } 
        else {
            resolve(categories);
        }
})
    return promise;
}


//Add Posts

exports.addPost = function (postData){

    return new Promise((resolve, reject) => {
        if (postData.published == undefined) {
          postData.published = false;
        }
        else {
          postData.published = true;
        }
        postData.id = posts.length + 1;
        var sdate= new Date();
        var day=sdate.getDate();
        var month=sdate.getMonth()+1;
        var year=sdate.getFullYear();
        postData.postDate=year + "-"+ month + "-" + day;
        posts.push(postData);
        resolve(postData);
      })
    };

exports.getPostsByCategory = function(category){
        var postByCategory=[];
        var promise = new Promise((resolve, reject) => {
            if(posts.length == 0)
            {
                reject("no results returned");
            }
            else {
                for(var i =0; i < posts.length; i++)
                {
                    if(posts[i].category == category)

                    {
                    postByCategory.push(posts[i])
                    }
                }

                resolve(postByCategory);
            }
    })
        return promise;
    }


exports.getPostsByMinDate = function(minDateStr){
        var minDatePost =[];
        var promise = new Promise((resolve, reject) => {
            if(posts.length === 0)
            {
                reject("no results returned");
} 
            else {
                for(var i =0; i < posts.length; i++)
                {
                    if(new Date(posts[i].postDate) >= new Date(minDateStr)){
                        minDatePost.push(posts[i]);
                    }
} 
}
        resolve(minDatePost);
    })
       return promise;
    }


exports.getPostsById = function(id){
    
    var postById;
    var promise = new Promise((resolve, reject) => {
        if(posts.includes(id))
        {
            for(var i =0; i < posts.length; i++)
            {
                if(posts[i].id == id){
                    postById = posts[i].id;
                }
                resolve(postById);
        }
}   

    else{
        reject("no result returned");
        }
})
        return promise;
    }