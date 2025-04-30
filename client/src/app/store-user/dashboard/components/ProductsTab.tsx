import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COLORS } from '../../../constants/colors';
import { Package, TrendingUp, BarChart2, Search, Filter, Eye, Star, Edit, Trash2 } from 'lucide-react';

interface ProductsTabProps {
  analyticsData: any;
}

export default function ProductsTab({ analyticsData }: ProductsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Get unique categories for filter
  const categories = ['all'];
  if (analyticsData.topProducts) {
    analyticsData.topProducts.forEach((product: any) => {
      if (product.category && !categories.includes(product.category)) {
        categories.push(product.category);
      }
    });
  }

  // Filter products based on search term and category
  const filteredProducts = analyticsData.topProducts ? analyticsData.topProducts.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  // Function to render rating stars
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            fill={i < Math.floor(rating) ? COLORS.secondary : 'transparent'}
            stroke={COLORS.secondary}
            className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
          />
        ))}
        <span className="ml-1 text-sm" style={{ color: COLORS.gray }}>{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">Your Products</CardTitle>
              <CardDescription>Manage your store products</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-8 w-full sm:w-[240px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <select
                  className="pl-8 h-10 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              <Button style={{ backgroundColor: COLORS.primary, color: 'white' }}>
                <Package className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 border-b py-3 px-4 font-medium" style={{ backgroundColor: COLORS.lightgray }}>
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Category</div>
              <div className="col-span-1 text-center">Price</div>
              <div className="col-span-1 text-center">Views</div>
              <div className="col-span-1 text-center">Rating</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product: any, index: number) => (
                <div key={index} className="grid grid-cols-12 border-b py-3 px-4 items-center">
                  <div className="col-span-5">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500 truncate">{product.description || 'No description'}</div>
                  </div>
                  <div className="col-span-2 text-center">
                    <Badge variant="outline" style={{ backgroundColor: `${COLORS.primary}15`, color: COLORS.primary }}>
                      {product.category || 'Uncategorized'}
                    </Badge>
                  </div>
                  <div className="col-span-1 text-center">${product.price.toFixed(2)}</div>
                  <div className="col-span-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye size={14} style={{ color: COLORS.gray }} />
                      <span>{product.views || 0}</span>
                    </div>
                  </div>
                  <div className="col-span-1 text-center">
                    {renderRatingStars(product.rating || 0)}
                  </div>
                  <div className="col-span-2 text-right space-x-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" style={{ borderColor: COLORS.error, color: COLORS.error }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your search or filter' : 'Get started by adding a new product'}
                </p>
                <div className="mt-6">
                  <Button style={{ backgroundColor: COLORS.primary, color: 'white' }}>
                    <Package className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}