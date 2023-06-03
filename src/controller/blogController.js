const { isValidObjectId } = require('mongoose');
const blogModel = require('../model/blogModel');
const { isValidValue,filterQueryPATH } = require('../middleware/auth');

// Create a new blog
const createBlog = async (req, res) => {
    try {
        const { title, body, category, authorId, tags, subcategory, isPublished } = req.body;

        // Validate required fields
        if (!isValidValue(title) || !isValidValue(body) || !isValidValue(category)) {
            return res.status(400).send({ status: false, message: 'Please provide valid title and body' });
        }

        // Check if the blog is marked as deleted
        if (req.body.isDeleted) {
            return res.status(400).send({ status: false, message: 'Please provide valid title and body' });
        }

        const blogData = {
            title: title,
            body: body,
            category: category,
            authorId: authorId,
            tags: tags,
            subcategory: subcategory,
            isPublished: isPublished ? isPublished : false,
            publishedAt: isPublished ? Date.now() : null
        };

        const blog = await blogModel.create(blogData);
        res.status(201).send({ status: true, data: blog });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

// Get blogs based on filters
const getBlog = async (req, res) => {
    try {
        const data = req.query;
        const filterQuery = { isDeleted: false, deletedAt: null };
        const queries = Object.keys(data).map(String);

        // Validate filter queries
        if (!filterQueryPATH(queries)) {
            return res.status(400).send({ status: false, message: 'Please provide valid query' });
        }

        if (Object.keys(data).length > 0) {
            const { category, authorId, tags, subcategory } = req.query;

            if (isValidValue(authorId) && isValidObjectId(authorId)) {
                filterQuery.authorId = authorId;
            }

            if (isValidValue(category)) {
                filterQuery.category = category;
            }

            if (isValidValue(subcategory)) {
                const subArr = subcategory.trim().split(',').map(subBlog => subBlog.trim());
                filterQuery.subcategory = { $all: subArr };
            }

            if (isValidValue(tags)) {
                const tagsArr = tags.trim().split(',').map(tag => tag.trim());
                filterQuery.tags = { $all: tagsArr };
            }
        }

        const filterBlog = await blogModel.find(filterQuery);

        if (filterBlog.length > 0) {
            return res.status(200).send({ status: true, message: "Blog List", data: filterBlog });
        } else {
            return res.status(404).send({ status: false, message: "No Blog Found" });
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

// Update a blog
const updateBlog = async (req, res) => {
    try {
        const data = req.body;

        // Check if any update query is specified
        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, message: "Please specify at least one update query" });
        }

        const { title, body, tags, subcategory, isPublished, publishedAt, isDeleted } = data;

        // Check if the blog is marked as deleted
        if (isDeleted) {
            return res.status(400).send({ status: false, message: 'Blog cannot be deleted' });
        }

        if (isPublished === true) {
            publishedAt = dateAndTime;
        } else if (isPublished === false) {
            publishedAt = null;
        }

        const update = await blogModel.findByIdAndUpdate(blogId, {
            $set: {
                title: title,
                body: body,
                isPublished: isPublished,
                publishedAt: publishedAt
            },
            $addToSet: {
                tags: tags,
                subcategory: subcategory
            }
        }, { new: true });

        if (!update) {
            return res.status(404).send({ status: false, message: 'Blog not found', data: update });
        }

        if (update.isDeleted === true) {
            return res.status(404).send({ status: false, message: 'Blog cannot be deleted' });
        }

        res.status(200).send({ status: true, message: 'Blog updated successfully', data: update });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

// Delete a blog by its ID
const deleteBlogById = async (req, res) => {
    try {
        let blogId = req.params.blogId;
        const dateAndTime = new Date();

        let blog = await blogModel.findOneAndUpdate({ _id: blogId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: dateAndTime } }, { new: true });

        if (blog == null) {
            return res.status(404).send({ status: false, message: "Blog not found" });
        } else {
            return res.status(200).send({ status: true, message: "Deleted successfully" });
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

// Delete blogs by query
const deleteBlogByQuery = async (req, res) => {
    try {
        let data = req.query;
        let id = req.authorId;

        let deletedBlog = await blogModel.updateMany(
            {
                $and: [
                    { isDeleted: false }, { authorId: id }, data
                ]
            },
            { $set: { isDeleted: true, deletedAt: dateAndTime } }
        );

        if (deletedBlog.modifiedCount > 0) {
            return res.status(200).send({ status: true, message: `${deletedBlog.modifiedCount} blog deleted` });
        } else {
            return res.status(404).send({ status: false, message: "No blogs found" });
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { createBlog, getBlog, updateBlog, deleteBlogById, deleteBlogByQuery };
