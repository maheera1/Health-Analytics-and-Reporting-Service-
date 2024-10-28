import express from 'express';
import { getAllUsers, createUser, getUserById } from '../controllers/exampleController';

const router = express.Router();

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserById);

export default router;