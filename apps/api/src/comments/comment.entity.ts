export type CommentDetails = {
  id: string;
  parentId: string | null;
  content: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
};

export type CommentThread = CommentDetails & { replies: CommentDetails[] };
