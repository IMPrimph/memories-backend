import mongoose from "mongoose";
import PostMessage from "../models/postMessages.js"

export const getPosts = async (req, res) => {
    const { page } = req.query;
    try {
        const LIMIT = 2;
        // get the start index of every page
        const startIndex = (Number(page) - 1) * LIMIT;
        const total = await PostMessage.countDocuments({});

        const posts = await PostMessage.find().sort({
            _id: -1
        }).limit(LIMIT).skip(startIndex);

        return res.status(200).json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT) });
    } catch (error) {
        console.log(err)
        return res.status(500).json({
            message: error.message
        })
    }
}

export const getPost = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await PostMessage.findById(id);

        res.status(200).json(post);
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
}

export const getPostsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query;

    try {
        const title = new RegExp(searchQuery, "i");

        const posts = await PostMessage.find({ $or: [ { title }, { tags: { $in: tags.split(',') } } ]});

        res.json({ data: posts });
    } catch (error) {
        console.log(error)
        res.status(404).json({ message: error.message });
    }
}

export const createPost = async (req, res) => {
    const post = req.body;
    const newPost = new PostMessage({ ...post, creator: req.userId, createdAt: new Date().toISOString() })

    try {
        await newPost.save()
        return res.status(201).json(newPost)
    } catch (error) {
        console.log(err)
        return res.status(500).json({
            message: error.message
        })
    }
}

export const updatePost = async (req, res) => {
    const { id: _id } = req.params;
    const post = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No post with that id')

        const updatedPost = await PostMessage.findByIdAndUpdate(_id, { ...post, _id }, { new: true })
        return res.json(updatedPost);
    } catch (error) {
        console.log(err)
        return res.status(500).json({
            message: error.message
        })
    }
}

export const commentPost = async (req, res) => {
    const { id: _id } = req.params;
    const { value } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No post with that id')

        const post = await PostMessage.findById(_id)
        post.comments.push(value);

        const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, { new: true })
        return res.json(updatedPost);
    } catch (error) {
        console.log(err)
        return res.status(500).json({
            message: error.message
        })
    }
}

export const deletePost = async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that id')
        await PostMessage.findByIdAndDelete(id)
        return res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: error.message
        })
    }
}

export const likePost = async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that id');
        if (!req.userId) return res.json({ message: 'Unauthenticated' });

        const post = await PostMessage.findById(id);

        const index = post.likes.findIndex((id) => id === req.userId);

        if (index === -1) {
            post.likes.push(req.userId)
        } else {
            post.likes = post.likes.filter((id) => id !== String(req.userId));
        }

        const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true })
        return res.json(updatedPost);
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: error.message
        })
    }
}