import { Types } from "mongoose";

type RawSender =
  | Types.ObjectId
  | {
      _id: Types.ObjectId | string;
      username: string;
      avatar_url?: string;
    };

export interface MessageLike {
  _id: Types.ObjectId | string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  sender?: RawSender | null;
}

export interface SerializedMessage {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  sender: {
    id: string;
    username: string;
    avatarUrl: string | null;
  } | null;
}

export const serializeMessage = (message: MessageLike): SerializedMessage => {
  const rawSender = message.sender;

  const populatedSender =
    rawSender && typeof (rawSender as any).username === "string"
      ? (rawSender as {
          _id: Types.ObjectId | string;
          username: string;
          avatar_url?: string;
        })
      : null;

  return {
    id: message._id.toString(),
    content: message.content,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    sender: populatedSender && {
      id: populatedSender._id.toString(),
      username: populatedSender.username,
      avatarUrl: populatedSender.avatar_url ?? null,
    },
  };
};
