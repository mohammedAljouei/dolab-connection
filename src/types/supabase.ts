export interface Schema {
  Tables: {
    likes: {
      Row: {
        created_at: string;
        id: string;
        post_id: string;
        user_id: string;
      };
      Insert: {
        created_at?: string;
        id?: string;
        post_id?: string;
        user_id?: string;
      };
      Update: {
        created_at?: string;
        id?: string;
        post_id?: string;
        user_id?: string;
      };
      Relationships: [];
    };
    posts: {
      Row: {
        id: string;
        content: string;
        created_at: string;
        user_id: string;
      };
      Insert: {
        id?: string;
        content: string;
        created_at?: string;
        user_id: string;
      };
      Update: {
        id?: string;
        content?: string;
        created_at?: string;
        user_id?: string;
      };
      Relationships: [];
    };
    profiles: {
      Row: {
        id: string;
        username: string;
        avatar_url: string;
      };
      Insert: {
        id?: string;
        username: string;
        avatar_url?: string;
      };
      Update: {
        id?: string;
        username?: string;
        avatar_url?: string;
      };
      Relationships: [];
    };
    replies: {
      Row: {
        id: string;
        post_id: string;
        user_id: string;
        content: string;
        created_at: string;
      };
      Insert: {
        id?: string;
        post_id: string;
        user_id: string;
        content: string;
        created_at?: string;
      };
      Update: {
        id?: string;
        post_id?: string;
        user_id?: string;
        content?: string;
        created_at?: string;
      };
      Relationships: [];
    };
  };
  Views: {};
  Functions: {};
  Enums: {};
  CompositeTypes: {};
}