// services/inquiryService.js
import Inquiry from '../models/Inquiry.js';
import ApiError from '../utils/ApiError.js';

// Get all inquiries with search, filter, pagination, and sort
export const getInquiries = async (query = {}) => {
  const pageSize = 10;
  const page = Number(query.pageNumber) || 1;
  
  // Build search query
  let searchQuery = {};
  
  // Name search
  if (query.name) {
    searchQuery.name = { $regex: query.name, $options: 'i' };
  }
  
  // Email search
  if (query.email) {
    searchQuery.email = { $regex: query.email, $options: 'i' };
  }
  
  // Keyword search across multiple fields
  if (query.keyword) {
    searchQuery.$or = [
      { name: { $regex: query.keyword, $options: 'i' } },
      { email: { $regex: query.keyword, $options: 'i' } },
      { message: { $regex: query.keyword, $options: 'i' } },
      { subject: { $regex: query.keyword, $options: 'i' } }
    ];
  }

  // Status filter
  if (query.status) {
    searchQuery.status = query.status;
  }

  // Priority filter
  if (query.priority) {
    searchQuery.priority = query.priority;
  }

  // Sort options
  let sortOptions = {};
  switch (query.sort) {
    case 'oldest':
      sortOptions = { createdAt: 1 };
      break;
    case 'name':
      sortOptions = { name: 1 };
      break;
    case 'email':
      sortOptions = { email: 1 };
      break;
    case 'status':
      sortOptions = { status: 1 };
      break;
    case 'priority':
      sortOptions = { priority: -1 }; // High priority first
      break;
    default: // newest first
      sortOptions = { createdAt: -1 };
  }

  const count = await Inquiry.countDocuments(searchQuery);
  const inquiries = await Inquiry.find(searchQuery)
    .populate('respondedBy', 'name email')
    .sort(sortOptions)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  return {
    inquiries,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
    count: inquiries.length
  };
};

// Get single inquiry
export const getInquiryById = async (inquiryId) => {
  const inquiry = await Inquiry.findById(inquiryId)
    .populate('respondedBy', 'name email');

  if (!inquiry) {
    throw new ApiError(404, 'Inquiry not found');
  }

  return inquiry;
};

// Create new inquiry
export const createInquiry = async (inquiryData) => {
  const { name, email, subject, message } = inquiryData;

  // Validate required fields
  if (!name || !email || !message) {
    throw new ApiError(400, 'Please provide name, email, and message');
  }

  // Validate email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Please provide a valid email address');
  }

  const inquiry = new Inquiry({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject ? subject.trim() : '',
    message: message.trim()
  });

  const createdInquiry = await inquiry.save();
  return createdInquiry;
};

// Update inquiry status/response
export const updateInquiry = async (inquiryId, updateData, userId) => {
  const { status, priority, response } = updateData;

  const inquiry = await Inquiry.findById(inquiryId);

  if (!inquiry) {
    throw new ApiError(404, 'Inquiry not found');
  }

  // Update fields if provided
  if (status) inquiry.status = status;
  if (priority) inquiry.priority = priority;
  if (response !== undefined) inquiry.response = response;
  
  // If adding a response, mark as replied and set responder
  if (response && response.trim() !== '') {
    inquiry.status = 'replied';
    inquiry.respondedBy = userId;
    inquiry.respondedAt = new Date();
  }

  const updatedInquiry = await inquiry.save();
  
  // Populate the respondedBy field for response
  await updatedInquiry.populate('respondedBy', 'name email');
  
  return updatedInquiry;
};

// Delete inquiry
export const deleteInquiry = async (inquiryId) => {
  const inquiry = await Inquiry.findById(inquiryId);

  if (!inquiry) {
    throw new ApiError(404, 'Inquiry not found');
  }

  await Inquiry.findByIdAndDelete(inquiryId);
};

// Get inquiry statistics
export const getInquiryStats = async () => {
  const totalInquiries = await Inquiry.countDocuments();
  const newInquiries = await Inquiry.countDocuments({ status: 'new' });
  const readInquiries = await Inquiry.countDocuments({ status: 'read' });
  const repliedInquiries = await Inquiry.countDocuments({ status: 'replied' });
  const closedInquiries = await Inquiry.countDocuments({ status: 'closed' });
  
  const highPriority = await Inquiry.countDocuments({ priority: 'high' });
  const mediumPriority = await Inquiry.countDocuments({ priority: 'medium' });
  const lowPriority = await Inquiry.countDocuments({ priority: 'low' });

  // Inquiries from last 7 days
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const recentInquiries = await Inquiry.countDocuments({
    createdAt: { $gte: lastWeek }
  });

  // Inquiries from last 30 days
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 30);

  const monthlyInquiries = await Inquiry.countDocuments({
    createdAt: { $gte: lastMonth }
  });

  return {
    total: totalInquiries,
    byStatus: {
      new: newInquiries,
      read: readInquiries,
      replied: repliedInquiries,
      closed: closedInquiries
    },
    byPriority: {
      high: highPriority,
      medium: mediumPriority,
      low: lowPriority
    },
    recent: {
      last7Days: recentInquiries,
      last30Days: monthlyInquiries
    }
  };
};

// services/inquiryService.js - Updated markAsRead
export const markAsRead = async (inquiryId) => {
  try {
    const inquiry = await Inquiry.findById(inquiryId);

    if (!inquiry) {
      throw new ApiError(404, 'Inquiry not found');
    }

    inquiry.status = 'read';
    const updatedInquiry = await inquiry.save();
    
    return updatedInquiry;
  } catch (error) {
    console.error('markAsRead error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      throw new ApiError(400, 'Invalid inquiry ID format');
    }
    
    // Re-throw the error with proper message
    throw new ApiError(500, `Failed to mark inquiry as read: ${error.message}`);
  }
};