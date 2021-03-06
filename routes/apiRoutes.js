const db = require("../models");
const path = require("path");
const authenticated = require("../config/authenticated");
const passport = require("passport");
module.exports = function (app) {

    app.get("/", function (req, res) {
        console.log("At home page")
        res.sendFile("/html/index.html", {
            root: path.join(__dirname, "../public")
        });

    });
    app.get("/login", function (req, res) {
        // If the user already has an account send them to the mytrails page
        if (req.user) {
            console.log("redirect to mytrails")
            res.redirect("/mytrails");
        } else {
            console.log("not logged in")
            res.sendFile("/html/login.html", {
                root: path.join(__dirname, "../public")
            });
        };
    });
    app.get("/trails", authenticated, function (req, res) {
        // if authenticated, allow access to trails page
        res.sendFile("/html/trails.html", { root: path.join(__dirname, "../public") });
    });
    app.get("/mytrails", authenticated, function (req, res) {
        // if authenticated, allow access to mytrails page        
        res.sendFile("/html/mytrails.html", { root: path.join(__dirname, "../public") });
    });
    app.get("/mytrailreviews", authenticated, function (req, res) {
        // if authenticated, allow access to mytrailreviews page        
        res.sendFile("/html/mytrailreviews.html", { root: path.join(__dirname, "../public") });
    });
    app.get("/community", authenticated, function (req, res) {
        // if authenticated, allow access to community page
        res.sendFile("/html/community.html", { root: path.join(__dirname, "../public") });
    });
    // Post a new user
    app.post("/api/user", function (req, res) {
        console.log("posting new user");
        console.log(req.body)
        db.User.create({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            hasReview: req.body.hasReview
        }).then(function (result) {
            console.log("Inserted into user table");
            res.redirect("/");
        }).catch(function (err) {
            console.log(err);
        })
    })

    // Post a new review
    app.post("/api/new/review", function (req, res) {
        db.Review.create({
            reviewTitle: req.body.reviewTitle,
            reviewText: req.body.reviewText,
            UserId: req.body.userId,
            user: req.body.user,
            trailLocation: req.body.trailLocation,
            trailName: req.body.trailName
        }).then(function (result) {
            console.log("Inserted into Review table");
            res.json(result);
        })
    })

    // login
    app.put("/api/user", passport.authenticate("local"), function (req, res) {
        db.User.findOne({
            where: {
                username: req.body.username,
                password: req.body.password
            }

        }).then(function (dbUser) {
            console.log("passport checking user...")
            // console.log(req.user);
            // Added Passport logic for validating user
            if (req.user) {
                console.log("true");
                // console.log(dbUser);
                res.json(dbUser);
            }
            else { res.sendFile("/html/login.html", { root: path.join(__dirname, "../public") }) };
        });
    })

    // Get Review page
    // app.get("/:id", function (req, res) {
    //     console.log("Inside unique id");
    //     res.sendFile(path.join(__dirname, "/../public/html/review.html"));
    // })

    // update user table
    app.put("/api/user/update/:id", function (req, res) {
        const id = req.params.id;
        console.log("Updating user table");
        console.log(id);

        db.User.update({
            favorites: req.body.favorites
        }, {
            where: {
                id: id
            }
        }).then(function (result) {
            console.log("Updated user table");
            res.json(result);
        })
    })

    // Get User info
    app.get("/api/user/:id", function (req, res) {
        console.log("Inside get user info function");
        const id = req.params.id;
        db.User.findAll({
            where: {
                id: id
            }
        }).then(function (result) {
            console.log(result);
            res.json(result);
        }).catch(function (err) {
            console.log(err);
        })
    })

    //add favorite
    // app.put("/api/user/", function (req, res) {
    //     const id = req.body.id;
    //     console.log("Adding a favorite");

    //     db.User.update({
    //         favorites: req.body.favorites
    //     }, {
    //         where: {
    //             id: id
    //         }
    //     }).then(function (result) {
    //         console.log("Updated favorites table");
    //         res.json(result);
    //     })
    // })

    // View all reviews and users
    app.get("/api/view/reviews", function (req, res) {
        console.log("Viewing all reviews");
        db.Review.findAll({
        }).then(function (result) {
            res.json(result);
        })
    })

    // Get the username of the poster
    app.get("/api/user/username", function (req, res) {
        console.log("Inside get user name function");

        db.Review.findAll({
            include: [{
                model: db.User,
                attributes: ['userName'],
                where: {
                    userId: db.Sequelize.col('User.id')
                }
            }],

        }).then(function (result) {
            console.log(result);
            res.json(result);
        }).catch(function (err) {
            console.log(err);
        })
    })

    // To get the username who commented
    app.get("/api/comment/username/:id/:comment", function (req, res) {

        db.User.findOne({
            where: {
                id: req.params.id
            }
        }).then(function (dbUser) {
            console.log(dbUser);
            const result = {
                dbUser: dbUser,
                comment: req.params.comment
            }
            res.json(result);
        })
    })

    // To look at your own reviews
    app.get("/api/myreviews/:id", function (req, res) {
        console.log("Inside myreviews function");

        db.Review.findAll({
            where: {
                UserId: req.params.id
            }
        }).then(function (myReview) {
            res.json(myReview);
        })
    })

    // post a comment on a review
    app.post("/api/new/comment", function (req, res) {
        db.Comment.create({
            commentText: req.body.commentText,
            userId: req.body.userId,
            ReviewId: req.body.reviewId,
            user: req.body.user
        }).then(function (result) {
            console.log("Inserted into Comments table");
            res.json(result);
        }).catch(function (err) {
            console.log(err);
        })
    })

    // retrieve commments for specific review
    app.get("/api/comment/:reviewId", function (req, res) {

        db.Comment.findAll({
            where: {
                ReviewId: req.params.reviewId
            }
        }).then(function (comment) {
            res.json(comment);
        })
    })

    // retrieve all commments
    app.get("/api/comment", function (req, res) {
        db.Comment.findAll({
        }).then(function (comment) {
            res.json(comment);
        })
    })

    // delete a review
    app.put("/api/review/delete/:id", function (req, res) {
        const id = req.params.id;
        db.Review.destroy({
            where: {
                id: id
            }
        }).then(function (result) {
            res.json(result);
        })
    })

    // delete a comment
    app.put("/api/comment/delete/:id", function (req, res) {
        const id = req.params.id;
        db.Comment.destroy({
            where: {
                id: id
            }
        }).then(function (result) {
            res.json(result);
        })
    })

    // update a review
    app.put("/api/review/update/:id", function (req, res) {
        const id = req.params.id;

        db.Review.update({
            reviewText: req.body.contents
        },
            {
                where: {
                    id: id
                }
            }).then(function () {
                console.log("Updated review table");
                res.json("Updated");
            })
    })


    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
}