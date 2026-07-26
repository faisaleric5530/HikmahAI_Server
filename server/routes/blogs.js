const { Router } = require('express');
const BlogController = require('../controllers/blog-controller');
const zodValidation = require('../middleware/request-validator');
const { strictAuth, requireRole } = require('../middleware/auth');
const { createBlogSchema, updateBlogSchema, blogIdSchema } = require('../schema/blogs');

const blogRouter = Router();

blogRouter.use(strictAuth);

blogRouter.get('/', BlogController.listBlogs);
blogRouter.post('/', requireRole('scholar', 'admin'), zodValidation(createBlogSchema), BlogController.createBlog);
blogRouter.get('/:blogId', zodValidation(blogIdSchema), BlogController.getBlog);
blogRouter.patch('/:blogId', zodValidation(updateBlogSchema), BlogController.updateBlog);
blogRouter.delete('/:blogId', zodValidation(blogIdSchema), BlogController.deleteBlog);

module.exports = blogRouter;
