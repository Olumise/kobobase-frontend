// Category Types

export interface Category {
  id: string;
  name: string;
  userId: string | null;
  icon: string | null;
  color: string | null;
  isSystemCategory: boolean;
  isActive: boolean;
}

// API Request Types
export interface CreateCategoryPayload {
  name: string;
  icon?: string;
  color?: string;
  isSystemCategory?: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
}

export interface FindCategoryPayload {
  categoryName: string;
}

// API Response Types
export interface GetAllCategoriesResponse {
  message: string;
  data: {
    categories: Category[];
    total: number;
    systemCategories: number;
    userCategories: number;
  };
}

export interface GetSystemCategoriesResponse {
  message: string;
  data: {
    categories: Category[];
    total: number;
  };
}

export interface GetUserCategoriesResponse {
  message: string;
  data: {
    categories: Category[];
    total: number;
    systemCategories: number;
    userCategories: number;
  };
}

export interface GetCategoryResponse {
  message: string;
  data: Category;
}

export interface CreateCategoryResponse {
  message: string;
  data: Category;
}

export interface UpdateCategoryResponse {
  message: string;
  data: Category;
}

export interface DeleteCategoryResponse {
  message: string;
}

export interface FindCategoryResponse {
  message: string;
  data: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
    isSystemCategory: boolean;
    isActive: boolean;
    matchConfidence: number;
  } | null;
}
