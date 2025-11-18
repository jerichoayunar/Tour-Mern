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