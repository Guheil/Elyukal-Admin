import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Package, Search, Filter, Eye, Star,
  BarChart3, Grid, List, ArrowUpDown,
  Loader2, Plus, RefreshCw, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// Placeholder for empty state illustration
const EmptyStateIllustration = () => (
  <div className="flex items-center justify-center p-6">
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-200">
      <rect x="4" y="5" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 9H20" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 14L8 16L10 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 14L16 16L14 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export default function ProductsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  // Fixed price range since we removed the slider
  const priceRange = [0, 10000];
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Default to 'all' since we removed the tabs
  const activeTab = 'all';
  // State for products data
  const [products, setProducts] = useState<any[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/store-user/fetch-products`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.products) {
        setProducts(data.products);

        // Calculate total views and reviews
        let views = 0;
        let reviews = 0;
        data.products.forEach((product: any) => {
          views += product.views || 0;
          reviews += product.total_reviews || 0;
        });
        setTotalViews(views);
        setTotalReviews(reviews);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique categories for filter
  const categories = ['all'];
  if (products) {
    products.forEach((product: { category: string; }) => {
      if (product.category && !categories.includes(product.category)) {
        categories.push(product.category);
      }
    });
  }

  // Filter and sort products
  const processProducts = () => {
    if (!products || products.length === 0) return [];

    return products
      .filter((product: { name: string; category: string; price_min: string | undefined; price_max: string | undefined; views: number; average_rating: string; isNew: any; in_stock: boolean; }) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

        // For price filtering
        const productPrice = product.price_min ? parseFloat(String(product.price_min)) : 0;
        const withinPriceRange = productPrice >= priceRange[0] && productPrice <= priceRange[1];

        // For tab filtering
        const matchesTab = activeTab === 'all' ||
          (activeTab === 'popular' && (product.views > 10 || parseFloat(product.average_rating) > 4)) ||
          (activeTab === 'new' && product.isNew);

        return matchesSearch && matchesCategory && withinPriceRange && matchesTab;
      })
      .sort((a: { name: string; price_min: string; price_max: string; average_rating: string; views: number; }, b: { name: string; price_min: string; price_max: string; average_rating: string; views: number; }) => {
        if (sortBy === 'name') {
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (sortBy === 'price') {
          const aPrice = a.price_min ? parseFloat(String(a.price_min)) : 0;
          const bPrice = b.price_min ? parseFloat(String(b.price_min)) : 0;
          return sortOrder === 'asc' ? aPrice - bPrice : bPrice - aPrice;
        } else if (sortBy === 'rating') {
          const aRating = parseFloat(a.average_rating || '0');
          const bRating = parseFloat(b.average_rating || '0');
          return sortOrder === 'asc' ? aRating - bRating : bRating - aRating;
        } else if (sortBy === 'views') {
          return sortOrder === 'asc'
            ? (a.views || 0) - (b.views || 0)
            : (b.views || 0) - (a.views || 0);
        }
        return 0;
      })
      .slice(0, 10); // Limit to 10 products for overview
  };

  const filteredProducts = processProducts();

  // Simulate loading when changing filters
  // Add a dummy dependency to maintain the same array size as before
  const dummyDep = true;

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, sortBy, sortOrder, dummyDep]);

  // Toggle sort order
  const toggleSort = (field: React.SetStateAction<string>) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };



  // Function to render rating stars
  const renderRatingStars = (rating: string) => {
    const ratingValue = typeof rating === 'string' ? parseFloat(rating) : rating;
    const validRating = isNaN(ratingValue) ? 0 : ratingValue;

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            fill={i < Math.floor(validRating) ? "#FFB800" : 'transparent'}
            stroke={i < Math.floor(validRating) ? "#FFB800" : "#D1D5DB"}
            className={i < Math.floor(validRating) ? 'text-yellow-400' : 'text-gray-300'}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{validRating.toFixed(1)}</span>
      </div>
    );
  };

  // Format price display
  const formatPrice = (product: { price_min: string | undefined; price_max: string | undefined; price: string | null | undefined; }) => {
    if (product.price_min !== undefined && product.price_max !== undefined) {
      if (product.price_min === product.price_max) {
        return `₱${parseFloat(product.price_min).toFixed(2)}`;
      }
      return `₱${parseFloat(product.price_min).toFixed(2)} - ₱${parseFloat(product.price_max).toFixed(2)}`;
    } else if (product.price !== undefined && product.price !== null) {
      return `₱${parseFloat(product.price).toFixed(2)}`;
    }
    return 'N/A';
  };

  // Toggle product selection
  const toggleProductSelection = (productId: any) => {
    if ((selectedProducts as string[]).includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };



  // Handle refreshing product data
  const handleRefresh = () => {
    fetchProducts();
  };

  // Empty state component
  const EmptyState = () => (
    <div className="py-12 text-center">
      <EmptyStateIllustration />
      <h3 className="mt-4 text-lg font-medium">No products found</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
        {searchTerm || selectedCategory !== 'all'
          ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
          : 'Get started by adding your first product to showcase in your store.'}
      </p>
      <div className="mt-6">
        <Link href="/store-user/products">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Product
          </Button>
        </Link>
      </div>
    </div>
  );

  // Grid view component
  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
      {filteredProducts.map((product: { image_urls?: any; name?: any; status?: any; category?: any; description?: any; views?: any; average_rating?: any; rating?: any; price_min?: string | undefined; price_max?: string | undefined; price?: string | null | undefined; }, index: React.Key | null | undefined) => (
        <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="relative h-48 bg-gray-100 flex items-center justify-center">
            {product.image_urls && product.image_urls.length > 0 ? (
              <img
                src={product.image_urls[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-12 w-12 text-gray-400" />
            )}
            <Badge className="absolute top-2 right-2 bg-blue-600 text-white">
              {product.status || 'Active'}
            </Badge>
          </div>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base font-medium line-clamp-1">{product.name}</CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                {product.category || 'Uncategorized'}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2 h-10">
              {product.description || 'No description available'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex justify-between items-center">
              <div className="font-medium text-lg">{formatPrice({
                price_min: product.price_min,
                price_max: product.price_max,
                price: product.price
              })}</div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-gray-500">
                  <Eye size={14} className="mr-1" />
                  <span className="text-xs">{product.views || 0}</span>
                </div>
                <div>{renderRatingStars(product.average_rating || product.rating || 0)}</div>
              </div>
            </div>
          </CardContent>

        </Card>
      ))}
    </div>
  );

return (
  <div className="space-y-6">
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center">
              <Package className="mr-2 h-5 w-5 text-blue-600" />
              Products Management
            </CardTitle>
            <CardDescription className="text-gray-500">
              Analyze, manage and optimize your product portfolio
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode('table')}
                className={viewMode === 'table' ? 'bg-gray-100' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-gray-100' : ''}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search products by name, SKU, or description..."
              className="pl-8 pr-4 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[180px]">
              <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <select
                className="pl-8 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <Link href="/store-user/products">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Manage Products
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-500">Loading products...</span>
          </div>
        ) : filteredProducts.length > 0 ? (
          viewMode === 'table' ? (
            <div>

              <div className="rounded-md border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-12 border-b py-3 px-4 font-medium bg-gray-50 text-gray-600">
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedProducts.length === filteredProducts.length}
                      onChange={() => {
                        if (selectedProducts.length === filteredProducts.length) {
                          setSelectedProducts([]);
                        } else {
                          setSelectedProducts(filteredProducts.map((_p: any, i: any) => i));
                        }
                      }}
                    />
                  </div>
                  <div
                    className="col-span-3 flex items-center cursor-pointer"
                    onClick={() => toggleSort('name')}
                  >
                    Product
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                  <div className="col-span-2 text-center">Category</div>
                  <div
                    className="col-span-2 text-center cursor-pointer"
                    onClick={() => toggleSort('price')}
                  >
                    Price
                    <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  </div>
                  <div className="col-span-1 text-center">Stock</div>
                  <div
                    className="col-span-1 text-center cursor-pointer"
                    onClick={() => toggleSort('views')}
                  >
                    Views
                    <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  </div>
                  <div
                    className="col-span-1 text-center cursor-pointer"
                    onClick={() => toggleSort('rating')}
                  >
                    Rating
                    <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  </div>

                </div>

                {filteredProducts.map((product: { image_urls?: any; name?: any; description?: any; category?: any; in_stock?: boolean; views?: any; average_rating?: any; price_min?: string | undefined; price_max?: string | undefined; }, index: React.Key | null | undefined) => (
                  <div key={index} className={`grid grid-cols-12 border-b py-3 px-4 items-center ${typeof index === 'number' && index % 2 === 1 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-150`}>
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={typeof index === 'number' && selectedProducts.includes(String(index))}
                        onChange={() => toggleProductSelection(index)}
                      />
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center mr-3">
                          {product.image_urls && product.image_urls.length > 0 ?
                            <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover rounded" /> :
                            <Package className="h-5 w-5 text-gray-400" />
                          }
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {product.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                        {product.category || 'Uncategorized'}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-center font-medium">
                      {formatPrice({
                        price_min: product.price_min || '0',
                        price_max: product.price_max || '0',
                        price: null
                      })}
                    </div>
                    <div className="col-span-1 text-center">
                      {product.in_stock ? (
                        <Badge className="bg-green-100 text-green-600">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-600">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    <div className="col-span-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Eye size={14} className="text-gray-500" />
                        <span>{product.views || 0}</span>
                      </div>
                    </div>
                    <div className="col-span-1 text-center">
                      {renderRatingStars(product.average_rating || "0")}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ) : (
            <GridView />
          )
        ) : (
          <EmptyState />
        )}
      </CardContent>

      {filteredProducts.length > 0 && (
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-gray-500">
            Showing {filteredProducts.length} of {products.length || 0} products
          </div>
          <div className="flex items-center">
            <Button variant="outline" size="sm" className="text-xs">
              <ChevronRight className="mr-1 h-3 w-3 rotate-180" />
              Previous
            </Button>
            <div className="flex items-center mx-2">
              <Button variant="outline" size="sm" className="text-xs bg-blue-50">1</Button>
              <Button variant="ghost" size="sm" className="text-xs">2</Button>
              <Button variant="ghost" size="sm" className="text-xs">3</Button>
              <span className="mx-1">...</span>
              <Button variant="ghost" size="sm" className="text-xs">10</Button>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              Next
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <BarChart3 className="mr-2 h-4 w-4 text-blue-600" />
            Product Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{products.length || 0}</div>
          <p className="text-xs text-gray-500">Total Products</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Views</span>
              <span className="text-sm font-medium">{totalViews}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-sm">Reviews</span>
              <span className="text-sm font-medium">{totalReviews}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-sm">In Stock</span>
              <span className="text-sm font-medium">
                {products.filter(p => p.in_stock).length || 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{
                width: `${(products.filter(p => p.in_stock).length / (products.length || 1)) * 100}%`
              }}></div>
            </div>

          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Star className="mr-2 h-4 w-4 text-yellow-500" />
            Top Rated Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products
              .sort((a, b) => parseFloat(b.average_rating || '0') - parseFloat(a.average_rating || '0'))
              .slice(0, 3)
              .map((product, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                    {product.image_urls && product.image_urls.length > 0 ? (
                      <img src={product.image_urls[0]} alt={product.name} className="h-full w-full object-cover rounded" />
                    ) : (
                      <Package className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <div className="flex items-center">
                      {renderRatingStars(product.average_rating || '0')}
                      <span className="ml-2 text-xs text-gray-500">({product.total_reviews || 0} reviews)</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="mr-2 h-4 w-4 text-purple-600" />
              Most Viewed Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 3)
                .map((product, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <img src={product.image_urls[0]} alt={product.name} className="h-full w-full object-cover rounded" />
                      ) : (
                        <Package className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <div className="flex items-center">
                        <Eye size={14} className="text-gray-500" />
                        <span className="ml-1 text-xs text-gray-500">{product.views || 0} views</span>
                        <span className="mx-1 text-gray-300">•</span>
                        <span className="text-xs text-gray-500">
                          {formatPrice({
                            price_min: product.price_min,
                            price_max: product.price_max,
                            price: null
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
