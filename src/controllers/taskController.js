import prisma from '../utils/prisma.js';
import { getIO } from '../socket/index.js';

export const createTask = async (req, res) => {
  try {
    const { title, projectId, assigneeId } = req.body;
    
    const task = await prisma.task.create({
      data: {
        title,
        projectId: Number(projectId),
        assigneeId: assigneeId ? Number(assigneeId) : null,
        status: "TODO"
      }
    });

    if (assigneeId) {
      await prisma.notification.create({
        data: {
            message: `Вам призначено нове завдання: ${title}`,
            userId: Number(assigneeId),
            type: "INFO"
        }
      });
     
      getIO().to(`user_${assigneeId}`).emit('new_notification', {
        message: `Вам призначено нове завдання: ${title}`
      });
    }

    getIO().to(`project_${projectId}`).emit('task_created', task);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};