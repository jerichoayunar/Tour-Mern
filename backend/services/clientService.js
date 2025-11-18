// services/clientService.js - ENHANCED VERSION
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

// Get all clients with enhanced filtering
export const getClients = async (query = {}) => {
  const { name, email, phone, role, status, loginMethod } = query;
  
  // Build filter - only non-admin users by default
  const filter = { role: { $ne: 'admin' } };
  
  // Enhanced filtering capabilities
  if (name) filter.name = { $regex: name, $options: 'i' };
  if (email) filter.email = { $regex: email, $options: 'i' };
  if (phone) filter.phone = { $regex: phone, $options: 'i' };
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (loginMethod) filter.loginMethod = loginMethod;

  const clients = await User.find(filter)
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .sort({ createdAt: -1 });

  return clients;
};

// Get single client
export const getClient = async (clientId) => {
  const client = await User.findById(clientId)
    .select('-password -resetPasswordToken -resetPasswordExpire');

  if (!client) {
    throw new ApiError(404, 'Client not found');
  }

  if (client.role === 'admin') {
    throw new ApiError(403, 'Access denied');
  }

  return client;
};

// Update client
export const updateClient = async (clientId, updateData) => {
  const existingClient = await User.findById(clientId);
  
  if (!existingClient || existingClient.role === 'admin') {
    throw new ApiError(404, 'Client not found');
  }

  if (updateData.email && updateData.email !== existingClient.email) {
    const emailExists = await User.findOne({ 
      email: updateData.email,
      _id: { $ne: clientId }
    });
    if (emailExists) {
      throw new ApiError(400, 'Email already exists');
    }
  }

  const client = await User.findByIdAndUpdate(
    clientId,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).select('-password -resetPasswordToken -resetPasswordExpire');

  return client;
};

// Delete client
export const deleteClient = async (clientId) => {
  const client = await User.findById(clientId);

  if (!client || client.role === 'admin') {
    throw new ApiError(404, 'Client not found');
  }

  await User.findByIdAndDelete(clientId);
};

// ✅ ENHANCED: Get client statistics with more insights
export const getClientStats = async () => {
  const totalClients = await User.countDocuments({ role: { $ne: 'admin' } });
  
  // Last 30 days registrations
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const newClientsLast30Days = await User.countDocuments({
    role: { $ne: 'admin' },
    createdAt: { $gte: thirtyDaysAgo }
  });

  // Last 7 days registrations
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const newClientsLast7Days = await User.countDocuments({
    role: { $ne: 'admin' },
    createdAt: { $gte: sevenDaysAgo }
  });

  // ✅ NEW: Authentication method breakdown
  const localUsers = await User.countDocuments({ 
    role: { $ne: 'admin' },
    loginMethod: 'local' 
  });
  
  const googleUsers = await User.countDocuments({ 
    role: { $ne: 'admin' },
    loginMethod: 'google' 
  });

  // ✅ NEW: Status breakdown
  const activeUsers = await User.countDocuments({ 
    role: { $ne: 'admin' },
    status: 'active' 
  });

  return {
    totalClients,
    newClientsLast30Days,
    newClientsLast7Days,
    // ✅ NEW FIELDS: Enhanced analytics
    byLoginMethod: {
      local: localUsers,
      google: googleUsers
    },
    byStatus: {
      active: activeUsers,
      inactive: totalClients - activeUsers
    },
    // ✅ NEW: Growth percentage (safe calculation)
    growthRate: totalClients > 0 ? 
      ((newClientsLast30Days / totalClients) * 100).toFixed(1) + '%' : '0%'
  };
};