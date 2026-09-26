import mongoose from "mongoose";
import Group from "../models/Group.js";
import GroupMessage from "../models/GroupMessage.js";
import User from "../models/User.js";

// =========================
// CREATE GROUP
// =========================

export const createGroup = async (req, res, next) => {
  try {
    const { name, memberIds } = req.body;

    const currentUserId = req.user.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
        data: null,
      });
    }

    if (
      !Array.isArray(memberIds) ||
      memberIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one member is required",
        data: null,
      });
    }

    const uniqueMemberIds = [
      ...new Set(
        memberIds.map((id) => String(id))
      ),
    ];

    for (const id of uniqueMemberIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid member ID: ${id}`,
          data: null,
        });
      }
    }

    // Creator ko automatically group mein add karo
    if (
      !uniqueMemberIds.includes(
        String(currentUserId)
      )
    ) {
      uniqueMemberIds.push(
        String(currentUserId)
      );
    }

    const users = await User.find({
      _id: {
        $in: uniqueMemberIds,
      },
    }).select("name email role");

    if (users.length !== uniqueMemberIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more users not found",
        data: null,
      });
    }

    const group = await Group.create({
      name: name.trim(),
      createdBy: currentUserId,
      members: uniqueMemberIds,
    });

    const populatedGroup =
      await Group.findById(group._id)
        .populate(
          "createdBy",
          "name email role"
        )
        .populate(
          "members",
          "name email role"
        );

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      data: populatedGroup,
    });
  } catch (error) {
    return next(error);
  }
};

// =========================
// GET MY GROUPS
// =========================

export const getMyGroups = async (
  req,
  res,
  next
) => {
  try {
    const currentUserId = req.user.userId;

    const groups = await Group.find({
      members: currentUserId,
    })
      .populate(
        "createdBy",
        "name email role"
      )
      .populate(
        "members",
        "name email role"
      )
      .sort({
        updatedAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    return next(error);
  }
};

// =========================
// GET GROUP MESSAGES
// =========================

export const getGroupMessages = async (
  req,
  res,
  next
) => {
  try {
    const { groupId } = req.params;

    const currentUserId = req.user.userId;

    if (
      !mongoose.Types.ObjectId.isValid(groupId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Group ID",
        data: null,
      });
    }

    const group = await Group.findOne({
      _id: groupId,
      members: currentUserId,
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found or access denied",
        data: null,
      });
    }

    const messages =
      await GroupMessage.find({
        groupId,
      })
        .populate(
          "senderId",
          "name email role"
        )
        .sort({
          createdAt: 1,
        });

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    return next(error);
  }
};