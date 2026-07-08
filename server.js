const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const session = require("express-session");
const Comment = require("./comments");

const app = express();

// ================= Middleware =================

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: "commenthubsecret",
        resave: false,
        saveUninitialized: true,
    })
);

// ================= View Engine =================

app.set("view engine", "ejs");
app.set("views", __dirname);

// ================= MongoDB =================

mongoose
    .connect("mongodb://127.0.0.1:27017/comments")
    .then(() => console.log("✅ Database Connected!"))
    .catch((err) => console.log(err));

// ================= Dashboard =================

app.get("/", (req, res) => {
    res.render("dash");
});

// ================= All Comments =================

app.get("/comments", async (req, res) => {
    try {
        const comments = await Comment.find();

        res.render("index", {
            comments,
            sessionId: req.sessionID,
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Error");
    }
});

// ================= New Comment =================

app.get("/comments/new", (req, res) => {
    res.render("new");
});

// ================= Create =================

app.post("/comments", async (req, res) => {
    try {

        const { user, text } = req.body;

        await Comment.create({
            user,
            text,
        });

        res.redirect("/comments");

    } catch (err) {
        console.log(err);
    }
});

// ================= Show One =================

app.get("/comments/:id", async (req, res) => {
    try {

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).render("404");
        }

        res.render("show", {
            comment,
            sessionId: req.sessionID,
        });

    } catch (err) {
        console.log(err);
        res.render("404");
    }
});

// ================= Edit =================

app.get("/comments/:id/edit", async (req, res) => {
    try {

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).render("404");
        }

        res.render("edit", { comment });

    } catch (err) {
        console.log(err);
    }
});

// ================= Update =================

app.patch("/comments/:id", async (req, res) => {
    try {

        const { user, text } = req.body;

        await Comment.findByIdAndUpdate(req.params.id, {
            user,
            text,
        });

        res.redirect("/comments");

    } catch (err) {
        console.log(err);
    }
});

// ================= Like =================

app.patch("/comments/:id/like", async (req, res) => {

    try {

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.redirect("/comments");
        }

        comment.likes++;

        if (comment.dislikes > 0) {
            comment.dislikes--;
        }

        await comment.save();

        res.redirect("/comments");

    } catch (err) {

        console.log(err);
        res.redirect("/comments");

    }

});

// ================= Dislike =================

app.patch("/comments/:id/dislike", async (req, res) => {

    try {

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.redirect("/comments");
        }

        comment.dislikes++;

        if (comment.likes > 0) {
            comment.likes--;
        }

        await comment.save();

        res.redirect("/comments");

    } catch (err) {

        console.log(err);
        res.redirect("/comments");

    }

});

// ================= Delete =================

app.delete("/comments/:id", async (req, res) => {

    try {

        await Comment.findByIdAndDelete(req.params.id);

        res.redirect("/comments");

    } catch (err) {

        console.log(err);

    }

});

// ================= 404 =================

app.use((req, res) => {
    res.status(404).render("404");
});

// ================= Server =================

app.listen(4400, () => {
    console.log("🚀 Server running on http://localhost:4400");
});