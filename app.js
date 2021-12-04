const express = require("express");
const ejs = require("ejs");
const mongoose=require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const _ = require('lodash');
const tim=require('date-and-time')
const app = express();
var $ = require('jquery');
const flash= require("connect-flash")
const bcrypt = require('bcryptjs');
const auth = require('passport-local-authenticate');
const { json } = require("express");
const post="First ques";

app.set('view engine', 'ejs');

app.use(session({
   secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  
  next();
});

var count=0;
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/quoraDB",{useNewUrlParser: true});
mongoose.set("useCreateIndex", true);
// mongoose.usersDB=mongoose.createConnection("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
  name:String,
  // lname:String,
  email: String,
  password: String,
  googleId: String,
  // profile:Object
  prof:String,
  // secret: String
  postLiked: Array,
  commentLiked: Array
   
});

const  commentSchema = new mongoose.Schema({
  name : String,
  time : String,
  text : String,
  image : String,
  like : Boolean,
  likeCount : Number,
  postID : String,
  email: String
})

const postSchema={
    email:String,
    time:String,
    nmae:String,
    title:String,
    content:String,
    pof:String,
    like : Boolean,
    likeCount : Number,
    topic:String,
    commentCount: Number,
}

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const Post=mongoose.model("Post",postSchema);
const User=mongoose.model("User",userSchema);
const Comment=mongoose.model("Comment",commentSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// passport.use(new localStrategy({username:'email'},(email,password,done)=>{
//   User.findOne({email:email})
//      .then(user){
//        if(!user){
//          return done(null, false, {message: 'That email is not Registered'})
//        }
//      }
// }))

passport.use(new GoogleStrategy({
  clientID: '269340382529-4efb5oagp3t4okqf9eg558ce04o6idmn.apps.googleusercontent.com',
  clientSecret: 'j7s-5YZ3JnsRDHq38dTK05rf',
    callbackURL: "http://localhost:3000/auth/google/home",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
  

    User.findOrCreate({username:  profile.emails[0].value},{name:profile.displayName,prof:profile.photos[0].value, googleId: profile.id }, function (err, user) {
      
      return cb(err, user);
    });
  }
));

app.get("/",function(req,res){
  res.render("login", {message:"",
  email:"",
  password:""
});
})


app.get("/auth/google/home",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/home");
  });
  function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
app.get("/home",function(req,res){
  if(req.isAuthenticated()){
    var noMatches=null;
    console.log(req.user.salt);
    
    if(req.query.search){
      

      var regex = new RegExp(escapeRegex(req.query.search), 'gi');
      Post.find({$or:[{"title": regex},{"content":regex},{"topic":regex}]},function(err,psts){
        Comment.find({},function(err,com){
          if(err)
          console.log(err);
          else{
            
            
            if(psts.length < 1 )
            {
              noMatches="NO MATCH FOUND😢";
            }
            
            res.render("home",{
              comments:com,
              user:req.user,
              posts:psts,
              noMatches:noMatches
            })
          }
          
        })
      })
      
    }
    
    else{
      
      Post.find({},function(err,psts){
        Comment.find({},function(err,com){
          if(err)
          console.log(err);
         
          else
          {
            
            res.render("home",{
               comments:com,
               user:req.user,
               posts:psts,
               noMatches: noMatches
             })
             
            }
          })
      })
    }

    }
    else{
      res.redirect("/login");
  }
})
app.get('/search', (req, res) => {
  try {
      Post.find({ $or: [{ title: { '$regex': req.query.dsearch } }, { content: { '$regex': req.query.dsearch } }] }, (err, psts) => {
          if (err) {
              console.log(err);
          } else {
            res.render("search",{
              
              posts:psts
            })
          }
      })
  } catch (error) {
      console.log(error);
  }
})
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile","email"] })
);

app.post("/home",function(req,res){
  const now = new Date();

    //for post
 
  //  if(req.button.id === 1)
    const pot=new Post({
      email:req.user.username,
      pof:req.user.prof,
      nmae:req.user.name,
      time:tim.format(now, 'DD MMMM YYYY '),
      title:req.body.title,
      content:req.body.description,
      likeCount:0,
      topic:req.body.cars,
      commentCount:0
    })
    pot.save(function(err){
      if(!err){
        res.redirect("/home")
      }else
      {
        console.log("Error");
      }
    });
});

app.post("/comment/:postId", function(req,res){
  const now = new Date();
 
  const requestedPostId = req.params.postId;
Post.findOne({_id:requestedPostId},function(err,p){
  p.commentCount++;
  p.save();
 
})

  const com = new Comment({
    name : req.user.name,
    image: req.user.prof,
    time:tim.format(now, 'DD MMMM YYYY '),
     text : req.body.inputComment,
    postID : requestedPostId,
    email:req.user.username,
    likeCount:0,
    
  })
  

  com.save(function(err){
    if(!err){
      
      res.redirect("/home");
    }else
    {
      console.log("Error");
    }
})
});


  app.get("/register", function(req, res){
    res.render("register");
  });

  app.post("/delete/:docId", function(req,res){
    const requestedPostId = req.params.docId;
    console.log(requestedPostId)
    Post.findByIdAndDelete(requestedPostId,function(err,result){
      if (err){
        console.log(err)
    }
    else{
        console.log("Deleted : ", result);
        Comment.deleteMany(function(err1,result1){
          if (err1){
            console.log(err1)
        }
        else{
            console.log("Deleted : ", result1);
            
        }
    
        res.redirect("/myposts")
        })
    }

    })
  });
  app.post("/cdelete/:commentId", function(req,res){
    const requestedPostId = req.params.commentId;
    console.log(requestedPostId)
    Comment.findByIdAndDelete(requestedPostId,function(err,result){
      if (err){
        console.log(err)
    }
    else{
        console.log("Deleted : ", result);
        var c=result.postID;
        res.redirect("/home")
    }
    Post.findById({_id:c},function(err,p){
      p.commentCount--;
      p.save()
    })

    })
  });
  app.get("/topic/:topicname",function(req,res){
  //   if(req.isAuthenticated()){
  //   const requestedtopic = req.params.topicname;
  //   console.log(requestedtopic)
  //   Post.find({topic:requestedtopic},function(err,psts){
  //     Comment.find({},function(err,com){
  //       if(err)
  //       console.log(err+"j");
  //       else
  //       {
          
  //         res.render("topics",{
  //            comments1:com,
  //            user1:req.user,
  //            post1:psts,
  //          })
           
  //         }
  //       })
  //   })
  // }
  // else{
  //   res.redirect("/login")
  // }

    if(req.isAuthenticated()){
      var noMatches=null;
      
      
      if(req.query.search){
        
  
        var regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Post.find({$or:[{"title": regex},{"content":regex},{"topic":regex}]},function(err,psts){
          Comment.find({},function(err,com){
            if(err)
            console.log(err);
            else{
              
              
              if(psts.length < 1 )
              {
                noMatches="NO MATCH FOUND😢";
              }
              
              res.render("topics",{
                comments:com,
                user:req.user,
                posts:psts,
                noMatches:noMatches
              })
            }
            
          })
        })
        
      }
      
      else{
        const requestedtopic = req.params.topicname;
        Post.find({"topic": requestedtopic},function(err,psts){
          Comment.find({},function(err,com){
            if(err)
            console.log(err);
            else
            {
              
              res.render("topics",{
                 comments:com,
                 user:req.user,
                 posts:psts,
                 noMatches: noMatches,
                 topic: requestedtopic
               })
               
              }
            })
        })
      }
  
      }
      else{
        res.redirect("/login");
    }
  })
  app.post("/topicComment/:postId", function(req,res){
    const now = new Date();
    const requestedPostId = req.params.postId;
  
    const com = new Comment({
      name : req.user.name,
      image: req.user.prof,
      time:tim.format(now, 'DD MMMM YYYY '),
       text : req.body.inputComment,
      postID : requestedPostId,
      email:req.user.username,
      likeCount:0,
    })
    
      var t=req.body.ctopic;
    com.save(function(err){
      if(!err){
        res.redirect("/topic/"+t);
      }else
      {
        console.log("Error");
      }
  })
  });

  app.post("/update/:docId",function(req,res){
    const requestedPostId = req.params.docId;
    Post.findByIdAndUpdate(requestedPostId,{title:req.body.updateTitle,content:req.body.updateContent},function(err,result){
      if (err){
        console.log(err)
    }
    else{
        
        res.redirect("/myposts")
    }
    })
  })
 

  app.post("/register", function(req, res){

    User.register({name:req.body.regname,username: req.body.username },  req.body.password, function(err){
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/login");
        });
      }
    });
    // const user = new User({
    //   name:req.body.regname,
    //   username: req.body.username,

      
    // })

    

  //For search
  
 });


  app.get("/settings", function(req, res){
    var flag = false;
   
    if(req.user.googleId === undefined)
    {
      flag = true;
    }
    res.render("settings" , {flag : flag,user:req.user})
  });

  app.post("/userSettings",function(req,res){
    User.findOneAndUpdate({_id:req.user.id}, {$set:{name:req.body.cname}}, { isDeleted: true },function(err){
      console.log(req.user.id);
      if(err)
      {
        console.log(err);
      }
      else{
        console.log(req.user.username);
        Post.updateMany({email:req.user.username}, {nmae:req.body.cname}, { isDeleted: true }, function (err1, docs) {
            console.log(req.user.id);
          if (err1){
              console.log(err1)
          }
          else{
              console.log("Updated Docs : ", docs);
              Comment.updateMany({email:req.user.username}, {name:req.body.cname}, { isDeleted: true }, function (err2, docs1) {
                console.log(req.user.id);
              if (err2){
                  console.log(err2)
              }
              else{
                  console.log("Updated Docs : ", docs1);
              }
              })
            }
      });
     
      }
    })
  
    User.findById(req.user._id).then(function(sanitizedUser){
      if (sanitizedUser){
          sanitizedUser.setPassword(req.body.changePassword2, function(){
              sanitizedUser.save();
              
          });
      } else {
        console.log("Not set")
      }
  },function(err){
      console.error(err);
  })
    res.redirect("/home");
  });
  app.get("/myposts",function(req,res){
    if(req.isAuthenticated()){
      Post.find({email:req.user.username},function(err,doc){
        if(doc){
          res.render("myposts",{
            users:req.user.name,
            imge:req.user.prof,
            docs:doc
          })
        }
        })
      
      }
      else{
        res.redirect("/login");
    }
  })
   
app.post("/toggleLikePost/:postID", function(req,res){
  if(req.isAuthenticated())
  {
    var postID = req.params.postID;
    var flag = false;
   
    User.find({_id : req.user.id}, function(err, user)
    {
     
      if(req.user.postLiked === undefined){
        User.findOneAndUpdate({_id : req.user.id}, {$push:{
          "postLiked":postID
          
          
     }}, function(err){
         if(err)
         {
           console.log(err);
         }
         else
         {
           console.log("LikeCount Increse");
          Post.findOne({_id:postID}, function(err1, post1){

            if(err1)
              console.log(err1);
            
            else{
              post1.likeCount++;
              
            }
          })
         }
        })
      
      
      }
      
      else{
       
        for(var i = 0; i < req.user.postLiked.length; i++)
        {
         
          var LikedPost = req.user.postLiked[i];
          // console.log(LikedPost.idOfPost);
          
          
          if(LikedPost.idOfPost === postID){
            // console.log(postID+"hii");
            flag =true;
             User.updateOne({_id: req.user._id},   {$pull: {postLiked: LikedPost} }, function(err){
                if(err)
                {
                  console.log(err);
                }
                else{
                  Post.findOne({_id:postID}, function(err2, post2){
                    if(err2)
                      console.log(err2);
                    
                    else{
                      post2.likeCount--;
                      post2.save(function(err){
                        if(!err){
                        // console.log(post2.likeCount);
                       
                       }else
                       {
                         console.log("Error");
                       }
                     });
                    }
                  });
                }
             
             })
            
             }
          
           
            break;
          }
        }
    
    
      if(flag === false)
      {
        User.findOneAndUpdate({_id : req.user.id}, {$push:{
          "postLiked":{
            "idOfPost":postID
          }
     }}, function(err){
         if(err)
         {
           console.log(err);
         }
         else{
           Post.findOne({_id:postID}, function(err3, post3){
             if(err3)
             console.log(err3);
             
             else{
               //console.log(post3.likeCount);
               post3.likeCount++;
               post3.save(function(err){
                 if(!err){
                  //console.log(post3.likeCount);
                
                }else
                {
                  console.log("Error");
                }
              });
               
            }
          });
         }
        })
      
      }
    });
   
    res.redirect("/home");
     
  }
 else{
   res.redirect("/login");
 }
});
app.post("/toggleLikeComment/:postID", function(req,res){
  if(req.isAuthenticated())
  {
    var postID = req.params.postID;
    var flag1 = false;
   
    User.find({_id : req.user.id}, function(err, user)
    {
     
      if(req.user.commentLiked === undefined){
        User.findOneAndUpdate({_id : req.user.id}, {$push:{
          "commentLiked":postID
          
          
     }}, function(err){
         if(err)
         {
           console.log(err);
         }
         else
         {
           console.log("LikeCount Increse");
          Comment.findOne({_id:postID}, function(err1, comment1){

            if(err1)
              console.log(err1);
            
            else{
              comment1.likeCount++;
              
            }
          })
         }
        })
      
      
      }
      
      else{
       
        for(var i = 0; i < req.user.commentLiked.length; i++)
        {
         
          var LikedPost = req.user.commentLiked[i];
          // console.log(LikedPost.idOfPost);
          
          console.log(postID+"hii");
          console.log(LikedPost+"hello");
          
          if(LikedPost === postID){
            flag1 =true;
             User.updateOne({_id: req.user._id},   {$pull: {commentLiked: LikedPost} }, function(err){
                if(err)
                {
                  console.log(err);
                }
                else{
                  Comment.findOne({_id:postID}, function(err2, comment2){
                    if(err2)
                      console.log(err2);
                    
                    else{
                      comment2.likeCount--;
                      comment2.save(function(err){
                        if(!err){
                        // console.log(post2.likeCount);
                       
                       }else
                       {
                         console.log("Error");
                       }
                     });
                    }
                  });
                }
             
             })
            
             }
          
           
            break;
          }
        }
    
    
      if(flag1 === false)
      {
        User.findOneAndUpdate({_id : req.user.id}, {$push:{
          "commentLiked":postID
          
     }}, function(err){
         if(err)
         {
           console.log(err);
         }
         else{
           Comment.findOne({_id:postID}, function(err3, comment3){
             if(err3)
             console.log(err3);
             
             else{
               //console.log(post3.likeCount);
               comment3.likeCount++;
               comment3.save(function(err){
                 if(!err){
                  //console.log(post3.likeCount);
                
                }else
                {
                  console.log("Error");
                }
              });
               
            }
          });
         }
        })
      
      }
    });
   
    res.redirect("/home");
     
  }
 else{
   res.redirect("/login");
 }
});
//   // app.post("/login", function(req, res){
  
//   //   const user = new User({
//   //     // name: req.body.fname,
//   //     // lname: req.body.lname,
//   //     username: req.body.username,
//   //     password: req.body.password,
//   //   });
    
//   //   req.login(user, function(err){
//   //     if (err) {
//   //       console.log(err);
//   //     } else {
//   //       User.findById(req.user.id, function(err, foundUser){
//   //         console.log(foundUser)
//   //         console.log(req.user.id)
//   //         if (err) {
//   //           console.log(err);
//   //         } else {
//   //           if (foundUser) {
//   //             passport.authenticate("local")(req, res, function(){
//   //               res.redirect("/home");
//   //             });
              
//   //           }
//   //           else{
//   //             res.redirect("/register")
//   //           }
//   //         }
//   //       });
//   //       // passport.authenticate("local")(req, res, function(){
//   //       //   res.redirect("/home");
//   //       // });
//   //     }
//   //   });
  
//   // });
  app.post("/login", function(req, res){
   
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
     

    
          passport.authenticate('local', function (err, user, info) { 
         if(err){
           res.json({success: false, message: err})
         } else{
          if (! user) {
            console.log("User not matched")
            console.log(req.body.username)
            console.log(user.password)

            res.render('login' ,{
                message: 'username or password incorrect',
                email: req.body.username,
                password:req.body.password
            })
          } else{
            req.login(user, function(err){
              if(err){
               
              }else{
                 res.redirect("/home")
              }
            })
          }
         }
      })(req, res);
    })
   
   
  

        // ------------------------------------------------------------------------

        // passport.authenticate("local")(req, res, function(err1,user1){
        //     if(err){
        //       console.log(err);
        //     }
        //     if(!user1){
        //       console.log("Password Not Found");
        //     }
        //     else{
        //       res.redirect("/home")
        //     }
        //   }
        // )
//   app.post('/login',passport.authenticate('local', { successRedirect: '/home',
// }));

// .post((req,res)=>{
//   let hint = "";
//   let response = "";
//   let searchQ = req.body.query.toLowerCase();

//   if(searchQ.length > 0){
//     Post.find(function(err, results){
//       if(err){
//         console.log(err);
//       }
//       else{
//         results.forEach(function(result){
//           if(result.title.indexOf(searchQ) != -1){
//               if(hint === ""){
//                 hint = "<a href ='"+ result.url + "' target='_blank'>" + result.title + "</a>";
//               }
//               else{
//                 hint = hint + "<br /> <a href ='"+ result.url + "' target='_blank'>" + result.title + "</a>" 
//               }
//           }
//         })
//       }
//       if(hint === ""){
//         response = "no resposne";
//       }
//       else{
//         response = hint;
//       }

//       res.send({response:response});
//     })
//   }
// })

  app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
  });


app.listen(3000, function() {
    console.log("Server started on port 3000");
  });

