import React from "react";
import { Category, SubCategory } from "../types/categoryD";

type Props = {
  categories: Category[];
  selectedCategory?: string;
  selectedSubCategory?: string;
  onCategoryChange: (id: string) => void;
  onSubCategoryChange: (id: string) => void;
};

export default function CategoryDropdown({
  categories,
  selectedCategory,
  selectedSubCategory,
  onCategoryChange,
  onSubCategoryChange,
}: Props) {
  const currentCategory = categories.find((c) => c._id === selectedCategory);

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <select
        value={selectedCategory || ""}
        onChange={(e) => {
          onCategoryChange(e.target.value);
          onSubCategoryChange(""); // reset subcategory khi chọn category mới
        }}
      >
        <option value="">Tất cả danh mục</option>
        {categories
          .filter((cat) => !cat.hidden)
          .map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
      </select>
      {currentCategory && currentCategory.subcategories && currentCategory.subcategories.length > 0 && (
        <select
          value={selectedSubCategory || ""}
          onChange={(e) => onSubCategoryChange(e.target.value)}
        >
          <option value="">Tất cả danh mục con</option>
          {currentCategory.subcategories
            .filter((sub) => !sub.hidden)
            .map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
        </select>
      )}
    </div>
  );
}