// controllers/clientController.js
import * as clientService from '../services/clientService.js';

// @desc    Get all clients (users) - Admin only
// @route   GET /api/clients
// @access  Private/Admin
export const getClients = async (req, res, next) => {
  try {
    const clients = await clientService.getClients(req.query);
    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private/Admin
export const getClient = async (req, res, next) => {
  try {
    const client = await clientService.getClient(req.params.id);
    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private/Admin
export const updateClient = async (req, res, next) => {
  try {
    const client = await clientService.updateClient(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Client updated successfully!',
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private/Admin
export const deleteClient = async (req, res, next) => {
  try {
    await clientService.deleteClient(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Client deleted successfully!',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get client statistics
// @route   GET /api/clients/stats
// @access  Private/Admin
export const getClientStats = async (req, res, next) => {
  try {
    const stats = await clientService.getClientStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};