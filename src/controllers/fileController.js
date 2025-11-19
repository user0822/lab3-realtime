import prisma from '../utils/prisma.js';

export const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const file = await prisma.file.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        uploadedBy: req.user.userId
      }
    });
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};