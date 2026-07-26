const createBlogSchema = require('./create-blog');
const updateBlogSchema = require('./update-blog');
const blogIdSchema = require('./blog-id');

module.exports = { createBlogSchema, updateBlogSchema, blogIdSchema };
