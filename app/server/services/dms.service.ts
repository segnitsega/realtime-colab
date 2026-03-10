import { Types } from "mongoose";
import { Conversation } from "../models/conversation";
import { DMMessage } from "../models/dm-message";
import { AppError } from "../utils/AppError";

function normalizeParticipantIds(userId: string, otherUserId: string): Types.ObjectId[] {
  const a = new Types.ObjectId(userId);
  const b = new Types.ObjectId(otherUserId);
  return [a, b].sort((x, y) => x.toString().localeCompare(y.toString()));
}

function participantIds(conversation: { participants: any[] }): string[] {
  return conversation.participants.map((p: any) =>
    p._id ? p._id.toString() : p.toString(),
  );
}

async function ensureParticipant(conversation: any, userId: string) {
  const ids = participantIds(conversation);
  if (!ids.includes(userId)) {
    throw new AppError("Conversation not found", 404);
  }
}

export async function getOrCreateConversation(userId: string, otherUserId: string) {
  if (userId === otherUserId) {
    throw new AppError("Cannot create DM with yourself", 400);
  }

  const participantIds = normalizeParticipantIds(userId, otherUserId);
  let conversation = await Conversation.findOne({
    type: "dm",
    participants: { $all: participantIds },
    $expr: { $eq: [{ $size: "$participants" }, 2] },
  })
    .populate("participants", "username avatar_url")
    .lean();

  if (!conversation) {
    conversation = await Conversation.create({
      type: "dm",
      participants: participantIds,
    });
    conversation = await Conversation.findById(conversation._id)
      .populate("participants", "username avatar_url")
      .lean();
  }

  return conversation;
}

export async function getConversations(userId: string) {
  const conversations = await Conversation.find({
    type: "dm",
    participants: new Types.ObjectId(userId),
  })
    .populate("participants", "username avatar_url")
    .sort({ updatedAt: -1 })
    .lean();

  const list = conversations.map((c: any) => {
    const other = c.participants.find((p: any) => p._id.toString() !== userId);
    return {
      id: c._id,
      type: c.type,
      updatedAt: c.updatedAt,
      participant: other || null,
    };
  });

  return list;
}

export async function getConversation(conversationId: string, userId: string) {
  const conversation = await Conversation.findById(conversationId)
    .populate("participants", "username avatar_url")
    .lean();

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  await ensureParticipant(conversation, userId);

  const other = (conversation as any).participants.find(
    (p: any) => p._id.toString() !== userId,
  );
  return {
    id: conversation._id,
    type: conversation.type,
    participants: (conversation as any).participants,
    participant: other || null,
  };
}

export async function getConversationMessages(
  conversationId: string,
  userId: string,
  options: { page?: number; limit?: number },
) {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  await ensureParticipant(conversation, userId);

  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 50;
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    DMMessage.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username avatar_url"),
    DMMessage.countDocuments({ conversation: conversationId }),
  ]);

  return {
    page,
    limit,
    total,
    messages,
  };
}

export async function sendDMMessage(
  conversationId: string,
  userId: string,
  data: { content: string },
) {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  await ensureParticipant(conversation, userId);

  if (!data.content || typeof data.content !== "string" || !data.content.trim()) {
    throw new AppError("Message content is required", 400);
  }

  const message = await DMMessage.create({
    conversation: conversationId,
    sender: userId,
    content: data.content.trim(),
  });

  await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

  return message;
}

export async function updateDMMessage(
  conversationId: string,
  messageId: string,
  userId: string,
  data: { content: string },
) {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  await ensureParticipant(conversation, userId);

  const message = await DMMessage.findOne({
    _id: messageId,
    conversation: conversationId,
  });
  if (!message) {
    throw new AppError("Message not found", 404);
  }
  if (message.sender.toString() !== userId) {
    throw new AppError("You can only edit your own messages", 403);
  }
  if (!data.content || !data.content.trim()) {
    throw new AppError("Message content is required", 400);
  }

  message.content = data.content.trim();
  await message.save();

  return message;
}

export async function deleteDMMessage(
  conversationId: string,
  messageId: string,
  userId: string,
) {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  await ensureParticipant(conversation, userId);

  const message = await DMMessage.findOne({
    _id: messageId,
    conversation: conversationId,
  });
  if (!message) {
    throw new AppError("Message not found", 404);
  }
  if (message.sender.toString() !== userId) {
    throw new AppError("You can only delete your own messages", 403);
  }

  await message.deleteOne();
  return true;
}
