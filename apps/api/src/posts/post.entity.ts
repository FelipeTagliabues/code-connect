export type PostDetails = {
  id: string;
  title: string;
  description: string;
  code: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  createdAt: Date;
  authorId: string;
  authorName: string;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
};
