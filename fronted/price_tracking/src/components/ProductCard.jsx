// import { Link } from "react-router-dom";

// export default function ProductCard({ product }) {
//   // ---------------------------
//   // ProductCard Component
//   // ---------------------------
//   // Displays a single product in a card layout
//   // - Clickable, links to product detail page
//   // - Shows image, title, and current price

//   return (
//     <Link
//       to={`/product/${product.id}`} // Navigate to product detail page
//       className="group rounded-2xl border bg-white p-3 shadow-sm transition hover:shadow-md"
//     >
//       {/* ---------------------------
//           Product Image Container
//           --------------------------- */}
//       <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
//         {product.image_url ? (
//           <img
//             src={product.image_url}
//             alt={product.title}
//             className="h-full w-full object-cover transition group-hover:scale-105"
//           />
//         ) : (
//           // Fallback if no image available
//           <div className="flex h-full w-full items-center justify-center text-gray-400">
//             No image
//           </div>
//         )}
//       </div>

//       {/* ---------------------------
//           Product Info
//           --------------------------- */}
//       <div className="mt-3">
//         {/* Product Title */}
//         <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
//           {product.title}
//         </h3>

//         {/* Product Price */}
//         <div className="mt-1 text-sm text-gray-600">
//           {product.currency || "₹"}
//           {product.current_price}
//         </div>
//       </div>
//     </Link>
//   );
// }


// -----------------------
// Theme 02
// ------------------------

import { Link } from "react-router-dom";
import { useState } from "react";

export default function ProductCard({ product }) {
  // ---------------------------
  // State for image loading and errors
  // ---------------------------
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ---------------------------
  // Handle image load events
  // ---------------------------
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // ---------------------------
  // Format price with proper currency
  // ---------------------------
  const formatPrice = (price, currency = "₹") => {
    if (!price) return "Price not available";
    
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return "Invalid price";
    
    return `${currency}${numericPrice.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // ---------------------------
  // Truncate long titles
  // ---------------------------
  const truncateTitle = (title, maxLength = 60) => {
    if (!title) return "No title available";
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  // ---------------------------
  // Get store name from URL
  // ---------------------------
  const getStoreName = (url) => {
    if (!url) return null;
    
    try {
      const domain = new URL(url).hostname;
      if (domain.includes('amazon')) return 'Amazon';
      if (domain.includes('flipkart')) return 'Flipkart';
      if (domain.includes('myntra')) return 'Myntra';
      if (domain.includes('nykaa')) return 'Nykaa';
      return domain.replace('www.', '');
    } catch {
      return null;
    }
  };

  const storeName = getStoreName(product.product_url);
  const formattedPrice = formatPrice(product.current_price, product.currency);
  const truncatedTitle = truncateTitle(product.title);

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1"
    >
      {/* ---------------------------
          Product Image Container
          --------------------------- */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
        {!imageError && product.image_url ? (
          <>
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
            )}
            
            {/* Product Image */}
            <img
              src={product.image_url}
              alt={product.title}
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-110 object-fill  ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          </>
        ) : (
          // Fallback if no image available or image failed to load
          <div className="flex h-full w-full flex-col items-center justify-center text-gray-400 bg-gray-50">
            <svg 
              className="h-12 w-12 mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <span className="text-xs text-center px-2">No image available</span>
          </div>
        )}

        {/* Store Badge */}
        {storeName && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center rounded-full bg-black/80 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {storeName}
            </span>
          </div>
        )}

        {/* SKU Badge */}
        {product.sku && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm border border-gray-200">
              SKU: {product.sku}
            </span>
          </div>
        )}
      </div>

      {/* ---------------------------
          Product Info
          --------------------------- */}
      <div className="mt-4 space-y-2">
        {/* Product Title */}
        <h3 
          className="font-medium text-gray-900 leading-tight transition-colors group-hover:text-gray-700"
          title={product.title}
        >
          {truncatedTitle}
        </h3>

        {/* Price and Additional Info */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {/* Current Price */}
            <div className="text-lg font-bold text-gray-900">
              {formattedPrice}
            </div>

            {/* Last Updated */}
            {product.last_checked && (
              <div className="text-xs text-gray-500 mt-1">
                Updated {new Date(product.last_checked).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short'
                })}
              </div>
            )}
          </div>

          {/* View Details Indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg 
              className="h-5 w-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M14 5l7 7m0 0l-7 7m7-7H3" 
              />
            </svg>
          </div>
        </div>

        {/* Price History Indicator (if available) */}
        {product.history && product.history.length > 0 && (
          <div className="flex items-center text-xs text-gray-500">
            <svg 
              className="h-3 w-3 mr-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
            {product.history.length} price records
          </div>
        )}
      </div>
    </Link>
  );
}
