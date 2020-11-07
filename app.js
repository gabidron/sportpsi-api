const express = require("express");
const app = express();

const multer = require('multer');

const Post = require('./api/models/post');
const Comm = require("./comm");
const Msg = require("./msg");
const Res = require("./res");
const Web = require("./web");
const WebReq = require("./webReq");

const postsData = new Post();
const postedComments = new Comm();
const msgData = new Msg();
const resData = new Res();
const websData = new Web();
const webReqData = new WebReq();

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${getExt(file.mimetype)}`)
    }
});

const getExt = (mimetype) => {
    switch (mimetype) {
        case "image/png":
            return '.png';
        case "image/jpeg":
            return '.jpg';
        case "application/pdf":
            return '.pdf';
        case "video/mp4":
            return '.mp4';
    }
}

var upload = multer({ storage: storage });


app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get("/api/posts", (req, res) => {
    res.status(200).send(postsData.get());
})

app.get("/api/webs", (req, res) => {
    //console.log('dsds');
    res.status(200).send(websData.get());
})

app.get("/api/posts/query/:category", (req, res) => {
    const category = req.params.category.toLocaleUpperCase();
    const posts = postsData.get();

    let foundPosts = [];

    for (let i = 0; i < posts.length; ++i) {
        let postCategory = posts[i].category;
        postCategory = postCategory.toLocaleUpperCase();

        if (postCategory == category) {
            foundPosts.push(posts[i]);
        }
    }

    if (foundPosts.length != 0)
        res.status(200).send(foundPosts);
    else
        res.status(404).send("not found");


})
app.get("/api/webs/req", (req, res) => {
    res.status(200).send(webReqData.get());
})
app.get("/api/posts/comms", (req, res) => {

    let comments = postedComments.get();
    res.status(200).send(comments);
})

app.get("/api/posts/:id/comm", (req, res) => {
    let comments = postedComments.get();

    let commentsList = [];

    for (let i = 0; i < comments.length; ++i) {
        if (comments[i].postID == req.params.id && comments[i].aproved)
            commentsList.push(comments[i]);
    }

    res.status(200).send(commentsList);
})

app.get("/api/posts/search/:text", (req, res) => {
    const text = req.params.text.toLocaleUpperCase();
    const posts = postsData.get();

    let foundPosts = [];

    for (let i = 0; i < posts.length; ++i) {

        let title = posts[i].title;
        title = title.toLocaleUpperCase();

        if (title.includes(text)) {
            foundPosts.push(posts[i]);
        }

    }

    if (foundPosts.length != 0)
        res.status(200).send(foundPosts);
    else
        res.status(404).send("not found");
})

app.get("/api/posts/:postId", (req, res) => {
    const postId = req.params.postId;
    const posts = postsData.get();
    const foundPost = posts.find((post) => post.id == postId);


    if (foundPost) {
        res.status(200).send(foundPost);
    } else {
        res.status(404).send("Not Found")
    }
})
app.post("/api/webs/:id/:email", (req, res) => {

    console.log('sdafds');

    const id = req.params.id;
    const email = req.params.email;

    const newWebReq = {
        "id": id,
        "email": email
    };
    console.log(newWebReq);
    webReqData.add(newWebReq);
    res.status(200).send('ok');

})
app.post("/api/posts/comms/:postId/:comment/:state", (req, res) => {

    let comments = postedComments.get();
    const comm = req.params.comment;
    const id = req.params.postId;
    const state = req.params.state;

    for (let i = 0; i < comments.length; ++i) {
        if (comments[i].postID == id && comments[i].comm == comm) {
            comments[i].aproved = (state == 1);
        }
    }
    console.log(comments);
    postedComments.storeData(comments);
    res.status(201).send('ok');

})
app.post("/api/webs/delete/:id", (req, res) => {
    let webs = websData.get();
    let newWebs = [];

    for (let i = 0; i < webs.length; ++i) {

        if (webs[i].id != req.params.id) {
            newWebs.push(webs[i]);
        }
    }

    postsData.storeData(newWebs);
    res.status(201).send('ok');
})

app.get("/api/web/:id", (req, res) => {
    let webs = websData.get();
    let WEB;
    for (web of webs) {
        if (web.id == req.params.id) {
            WEB = web;
        }
    }
    res.status(201).send(WEB);
})

app.post("/api/res/delete/:id", (req, res) => {
    let ress = resData.get();
    let newRes = [];

    for (let i = 0; i < ress.length; ++i) {

        if (ress[i].id != req.params.id) {
            newRes.push(ress[i]);
        }
    }

    postsData.storeData(newRes);
    res.status(201).send('ok');
})

app.post("/api/posts/delete/:id", (req, res) => {
    let posts = postsData.get();
    let newPosts = [];

    for (let i = 0; i < posts.length; ++i) {

        if (posts[i].id != req.params.id) {
            newPosts.push(posts[i]);
        }
    }

    postsData.storeData(newPosts);
    res.status(201).send('ok');
})

app.post("/api/posts/edit/:id", upload.single("post-image"), (req, res) => {

    let posts = postsData.get();
    for (let i = 0; i < posts.length; ++i) {

        if (posts[i].id == req.params.id) {
            if (req.body.title) {
                posts[i].title = req.body.title;
            }
            posts[i].content = req.body.content;
            posts[i].category = req.body.category;
            if (typeof req.file != 'undefined' && req.file.path) {
                posts[i].post_image = req.file.path;
            }
        }

    }
    //console.log(posts);
    postsData.storeData(posts);
    res.status(201).send('ok');

})

app.post("/api/posts/comm/:postID/:comm", (req, res) => {

    const id = req.params.postID;
    const comm = req.params.comm;

    const newComm = {
        "comm": comm,
        "aproved": false,
        "postID": id
    };

    postedComments.add(newComm);

    res.status(201).send('ok');

})


app.get("/api/res", (req, res) => {
    res.status(201).send(resData.get());
})

app.post("/api/web", upload.single("vid"), (req, res) => {
    const newWeb = {
        "id": `${Date.now()}`,
        "title": req.body.title,
        "vid": req.file.path
    }
    websData.add(newWeb);
    res.status(201).send(newWeb);
})

app.post("/api/res", upload.single("res-file"), (req, res) => {
    const newRes = {
        "id": `${Date.now()}`,
        "title": req.body.title,
        "res-file": req.file.path,
        "category": req.body.category
    }
    resData.add(newRes);
    res.status(201).send(newRes);
})
app.post("/api/posts", upload.single("post-image"), (req, res) => {

    const newPost = {
        "id": `${Date.now()}`,
        "title": req.body.title,
        "content": req.body.content,
        "post_image": req.file.path,
        "added_date": `${Date.now()}`,
        "category": req.body.category
    }
    postsData.add(newPost);
    res.status(201).send(newPost);
})
app.get("/api/message", (req, res) => {
    res.status(201).send(msgData.get());
})
app.post("/api/message/:message/:email", (req, res) => {
    console.log(req.body);
    const newMsg = {
        "id": `${Date.now()}`,
        "msg": req.params.message,
        "email": req.params.email,
    }
    console.log(newMsg);
    msgData.add(newMsg);
    res.status(201).send('ok');
})

app.listen(process.env.PORT || 3000, () => console.log(`Listening on ${process.env.PORT || 3000}`));