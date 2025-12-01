// routes/clientRoutes.js
import express from 'express';
import {
  getClients,
  getClient,
  updateClient,
  deleteClient,
  archiveClient,
  restoreClient,
  permanentDeleteClient,
  getClientStats
} from '../controllers/clientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { updateClientSchema } from '../validations/clientValidation.js';

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/', getClients);
router.get('/stats', getClientStats);
router.get('/:id', getClient);
router.put('/:id', validateRequest(updateClientSchema), updateClient);
router.put('/:id/archive', archiveClient);
router.put('/:id/restore', restoreClient);
router.delete('/:id', deleteClient);
router.delete('/:id/permanent', permanentDeleteClient);

export { router as clientRoutes };