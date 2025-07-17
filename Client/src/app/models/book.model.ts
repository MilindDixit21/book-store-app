export interface Book{
     _id?: string;
  title: string;
  author: string;
  genre: string;
  publishDate: Date;
  ISBN: string;
  summary: string;
  status: 'draft' | 'published';
  coverImage?: string;
  createdBy?: string;
  price:number;
}