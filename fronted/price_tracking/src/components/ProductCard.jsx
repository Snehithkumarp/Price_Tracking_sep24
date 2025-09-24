import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  // ---------------------------
  // ProductCard Component
  // ---------------------------
  // Displays a single product in a card layout
  // - Clickable, links to product detail page
  // - Shows image, title, and current price

  return (
    <Link
      to={`/product/${product.id}`} // Navigate to product detail page
      className="group rounded-2xl border bg-white p-3 shadow-sm transition hover:shadow-md"
    >
      {/* ---------------------------
          Product Image Container
          --------------------------- */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          // Fallback if no image available
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* ---------------------------
          Product Info
          --------------------------- */}
      <div className="mt-3">
        {/* Product Title */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {product.title}
        </h3>

        {/* Product Price */}
        <div className="mt-1 text-sm text-gray-600">
          {product.currency || "₹"}
          {product.current_price}
        </div>
      </div>
    </Link>
  );
}
