import CommentsModel from '../models/Comments.js';

export const create = async (req, res) => {
  try {
    const { text, postId, user } = req.body;

    const comment = new CommentsModel({
      text,
      postId,
      user: {
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
    });

    const savedComment = await comment.save();
    res.json(savedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не удалось создать комментарий' });
  }
};


export const getAllByPost = async (req, res) => {
  try {
    const comments = await CommentsModel.find({ postId: req.params.id }).sort({
      createdAt: -1,
    });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не удалось получить комментарии' });
  }
};
