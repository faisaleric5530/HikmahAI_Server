const { v4: uuidv4 } = require('uuid');
const { blog: BlogModel, user: UserModel } = require('../../database');
const { APIError, ServiceErrorHandler } = require('../exceptions');

const stripHtml = (html) => html.replace(/<[^>]+>/g, '');

const toPublicBlog = (blog) => ({
  id: blog.public_id,
  title: blog.title,
  body: blog.body,
  excerpt: blog.excerpt,
  status: blog.status,
  authorId: blog.author ? blog.author.public_id : blog.author_id,
  authorName: blog.author ? blog.author.name : undefined,
  createdAt: blog.created_at,
  updatedAt: blog.updated_at,
});

const AUTHOR_INCLUDE = { model: UserModel, as: 'author', attributes: ['public_id', 'name'] };

const listBlogs = async () => {
  try {
    const blogs = await BlogModel.findAll({
      where: { status: 'published' },
      include: [AUTHOR_INCLUDE],
      order: [['created_at', 'DESC']],
    });
    return blogs.map(toPublicBlog);
  } catch (err) {
    throw new ServiceErrorHandler(err, 'BlogService::listBlogs');
  }
};

const findBlogOrThrow = async (blogId) => {
  const blog = await BlogModel.findOne({ where: { public_id: blogId }, include: [AUTHOR_INCLUDE] });
  if (!blog) throw APIError.NotFound('Blog not found');
  return blog;
};

const getBlog = async ({ blogId }) => {
  try {
    return toPublicBlog(await findBlogOrThrow(blogId));
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'BlogService::getBlog');
  }
};

const createBlog = async ({ authorId, title, body, status }) => {
  try {
    const blog = await BlogModel.create({
      public_id: uuidv4(),
      author_id: authorId,
      title,
      body,
      excerpt: stripHtml(body).slice(0, 150),
      status: status || 'published',
    });

    return toPublicBlog(await findBlogOrThrow(blog.public_id));
  } catch (err) {
    throw new ServiceErrorHandler(err, 'BlogService::createBlog');
  }
};

const assertOwnerOrAdmin = (blog, requester) => {
  if (blog.author_id !== requester.publicId && requester.role !== 'admin') {
    throw APIError.Forbidden('You do not have permission to modify this blog');
  }
};

const updateBlog = async ({ blogId, requester, title, body, status }) => {
  try {
    const blog = await findBlogOrThrow(blogId);
    assertOwnerOrAdmin(blog, requester);

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (body !== undefined) {
      updates.body = body;
      updates.excerpt = stripHtml(body).slice(0, 150);
    }
    if (status !== undefined) updates.status = status;

    await blog.update(updates);
    return toPublicBlog(await findBlogOrThrow(blogId));
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'BlogService::updateBlog');
  }
};

const deleteBlog = async ({ blogId, requester }) => {
  try {
    const blog = await findBlogOrThrow(blogId);
    assertOwnerOrAdmin(blog, requester);

    await blog.destroy();
    return { id: blogId };
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'BlogService::deleteBlog');
  }
};

module.exports = { listBlogs, getBlog, createBlog, updateBlog, deleteBlog };
