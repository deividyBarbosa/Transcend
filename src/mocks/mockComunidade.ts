export type Comment = {
  id: string;
  author: string;
  isAnonymous: boolean;
  content: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  author: string;
  isAnonymous: boolean;
  likes: number;
  comments: Comment[];
  createdAt: string;
  likedByUser: boolean;
};

export const mockComunidade: Post[] = [
  {
    id: '1',
    title: 'Dúvidas hormonais',
    content:
      'Oi gente, tudo bem? Sou nova por aqui e estou começando meu processo de transição hormonal...',
    author: 'Anônimo',
    isAnonymous: true,
    likes: 12,
    likedByUser: false,
    createdAt: '2024-01-20',
    comments: [],
  },
];
