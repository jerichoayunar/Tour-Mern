// backend/controllers/destinationController.js
import * as destinationService from '../services/destinationService.js';

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
export const getDestinations = async (req, res, next) => {
  try {
    const destinations = await destinationService.getDestinations(req.query);
    res.status(200).json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single destination
// @route   GET /api/destinations/:id
// @access  Public
export const getDestination = async (req, res, next) => {
  try {
    const destination = await destinationService.getDestination(req.params.id);
    res.status(200).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a destination
// @route   POST /api/destinations
// @access  Private/Admin
export const createDestination = async (req, res, next) => {
  try {
    const destination = await destinationService.createDestination(
      req.body, 
      req.file // The uploaded image file
    );
    res.status(201).json({
      success: true,
      message: 'Destination created successfully!',
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update destination
// @route   PUT /api/destinations/:id
// @access  Private/Admin
export const updateDestination = async (req, res, next) => {
  try {
    const destination = await destinationService.updateDestination(
      req.params.id, 
      req.body, 
      req.file // The uploaded image file (optional)
    );
    res.status(200).json({
      success: true,
      message: 'Destination updated successfully!',
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete destination
// @route   DELETE /api/destinations/:id
// @access  Private/Admin
export const deleteDestination = async (req, res, next) => {
  try {
    await destinationService.deleteDestination(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Destination deleted successfully!',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive destination
// @route   PUT /api/destinations/:id/archive
// @access  Private/Admin
export const archiveDestination = async (req, res, next) => {
  try {
    const destination = await destinationService.archiveDestination(
      req.params.id,
      req.user._id,
      req.body.reason
    );
    res.status(200).json({
      success: true,
      message: 'Destination archived successfully!',
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore archived destination
// @route   PUT /api/destinations/:id/restore
// @access  Private/Admin
export const restoreDestination = async (req, res, next) => {
  try {
    const destination = await destinationService.restoreDestination(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Destination restored successfully!',
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete destination
// @route   DELETE /api/destinations/:id/permanent
// @access  Private/Admin
export const permanentDeleteDestination = async (req, res, next) => {
  try {
    await destinationService.permanentDeleteDestination(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Destination permanently deleted!',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};