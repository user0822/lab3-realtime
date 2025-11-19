import express from 'express';
import { body } from 'express-validator';
import { getProjects, createProject } from '../controllers/projectController.js';

const router = express.Router();


router.get('/', getProjects);


router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('ownerId').isInt().withMessage('Owner ID must be a number'),
  ],
  createProject
);

export default router;