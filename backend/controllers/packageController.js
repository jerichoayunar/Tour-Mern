// controllers/packageController.js
import * as packageService from '../services/packageService.js';

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
export const getPackages = async (req, res, next) => {
  try {
    const packages = await packageService.getPackages(req.query);
    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single package
// @route   GET /api/packages/:id
// @access  Public
export const getPackage = async (req, res, next) => {
  try {
    const pkg = await packageService.getPackage(req.params.id);
    res.status(200).json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a package
// @route   POST /api/packages
// @access  Private/Admin
export const createPackage = async (req, res, next) => {
  try {
    // UPDATE: Pass req.file to service
    const pkg = await packageService.createPackage(req.body, req.file);
    res.status(201).json({
      success: true,
      message: 'Package created successfully!',
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private/Admin
export const updatePackage = async (req, res, next) => {
  try {
    // UPDATE: Pass req.file to service
    const pkg = await packageService.updatePackage(req.params.id, req.body, req.file);
    res.status(200).json({
      success: true,
      message: 'Package updated successfully!',
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete package
// @route   DELETE /api/packages/:id
// @access  Private/Admin
export const deletePackage = async (req, res, next) => {
  try {
    await packageService.deletePackage(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Package deleted successfully!',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive package
// @route   PUT /api/packages/:id/archive
// @access  Private/Admin
export const archivePackage = async (req, res, next) => {
  try {
    const pkg = await packageService.archivePackage(
      req.params.id,
      req.user._id,
      req.body.reason
    );
    res.status(200).json({
      success: true,
      message: 'Package archived successfully!',
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore archived package
// @route   PUT /api/packages/:id/restore
// @access  Private/Admin
export const restorePackage = async (req, res, next) => {
  try {
    const pkg = await packageService.restorePackage(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Package restored successfully!',
      data: pkg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete package
// @route   DELETE /api/packages/:id/permanent
// @access  Private/Admin
export const permanentDeletePackage = async (req, res, next) => {
  try {
    await packageService.permanentDeletePackage(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Package permanently deleted!',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};