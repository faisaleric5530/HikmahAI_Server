const { sendResponse, throwErrorResponse } = require('../utils/response');
const { HttpStatusCode } = require('../constants/status');
const blogService = require('../services/blog-service');

class BlogController {
  static listBlogs = async (req, res) => {
    try {
      const response = await blogService.listBlogs();
      return sendResponse(res, 'success', { message: 'Blogs fetched successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static getBlog = async (req, res) => {
    try {
      const response = await blogService.getBlog({ blogId: req.params.blogId });
      return sendResponse(res, 'success', { message: 'Blog fetched successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static createBlog = async (req, res) => {
    try {
      const response = await blogService.createBlog({ ...req.body, authorId: req.user.publicId });
      return sendResponse(res, 'success', {
        status: HttpStatusCode.CREATED,
        message: 'Blog published successfully',
        data: response,
      });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static updateBlog = async (req, res) => {
    try {
      const response = await blogService.updateBlog({
        blogId: req.params.blogId,
        requester: req.user,
        ...req.body,
      });
      return sendResponse(res, 'success', { message: 'Blog updated successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };

  static deleteBlog = async (req, res) => {
    try {
      const response = await blogService.deleteBlog({ blogId: req.params.blogId, requester: req.user });
      return sendResponse(res, 'success', { message: 'Blog deleted successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };
}

module.exports = BlogController;
