import prisma from '../utils/prisma.js';
import { validationResult } from 'express-validator';


export const getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search ? {
      title: { contains: search, mode: 'insensitive' }
    } : {};

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: Number(limit),
        include: { owner: { select: { name: true, email: true } } }
      }),
      prisma.project.count({ where })
    ]);

    res.json({
      data: projects,
      pagination: {
        page: Number(page),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const createProject = async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, ownerId } = req.body;
    
    
    let user = await prisma.user.findFirst({ where: { id: Number(ownerId) } });
    
    if (!user) {
        
        return res.status(404).json({ message: "User not found. Please create a user first." });
    }

    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        ownerId: Number(ownerId)
      }
    });
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};