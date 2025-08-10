import ProductSlider from "../sections/Home/ProductSlider";

type RelatedProductsSectionProps = {
  relatedProducts: any[]; // Replace 'any' with your actual product type if available
};

export default function RelatedProductsSection({ relatedProducts }: RelatedProductsSectionProps) {
  return (
    <ProductSlider
      props={{
        title: "Sản phẩm liên quan",
        products: relatedProducts
      }}
    />
  );
}