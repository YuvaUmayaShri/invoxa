const ActivityLog = require('../models/ActivityLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get activity logs with search and pagination
// @route   GET /api/activity
// @access  Private (Admin / Accounts)
const getActivityLogs = async (req, res) => {
  try {
    const { search, entity, action, page = 1, limit = 20 } = req.query;
    const query = {};

    if (entity) query.entity = entity;
    if (action) query.action = action;

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { entityId: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    return successResponse(res, {
      logs,
      total,
      pages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch activity logs.', err.message, 500);
  }
};

module.exports = { getActivityLogs };
