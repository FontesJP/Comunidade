export type ArticleCategory = 'Métodos Rápidos' | 'Estudos de Caso' | 'Hacks de Marketing' | 'Contingência';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: ArticleCategory; // New field
  tags: string[];
  imageUrl: string;
  isPremium: boolean;
  content?: ArticleContent; 
}

export interface ArticleContent {
  intro: string;
  sections: {
    heading: string;
    body: string;
  }[];
  conclusion: string;
}

export enum ViewState {
  HOME = 'HOME',
  ARTICLE = 'ARTICLE',
  LOADING = 'LOADING',
}

export interface GenerateArticleRequest {
  topic: string;
}