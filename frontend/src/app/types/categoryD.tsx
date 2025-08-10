  export interface SubCategory {
    _id: string;
    name: string;
    hidden: boolean;
    categoryId?: string;
  }

  export interface Category {
    _id: string;
    name: string;
    hidden: boolean;
    subcategories?: SubCategory[];
  }