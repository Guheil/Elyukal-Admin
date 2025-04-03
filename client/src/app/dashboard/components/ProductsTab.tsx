import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COLORS } from '../../constants/colors';
import { Package, TrendingUp, BarChart2 } from 'lucide-react';
import { fetchProducts, fetchPopularProducts, fetchMostViewedProducts, Product } from '../../api/productService';
import { BASE_URL } from '@/config';

// Import Recharts components
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

interface ProductsTabProps {
  analyticsData: any;
}

export default function ProductsTab({ analyticsData }: ProductsTabProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [mostViewedProducts, setMostViewedProducts] = useState<Product[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [priceRangeData, setPriceRangeData] = useState<any[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // COLORS for charts
  const CHART_COLORS = [
    COLORS.primary,
    COLORS.secondary,
    COLORS.accent,
    COLORS.success,
    COLORS.error,
    COLORS.gradient.start,
    COLORS.gradient.middle,
    COLORS.gradient.end,
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all products
        const productsResponse = await fetchProducts();
        if (productsResponse && productsResponse.products) {
          setProducts(productsResponse.products);
          
          // Process category distribution data
          const categories: Record<string, number> = {};
          productsResponse.products.forEach((product: Product) => {
            if (product.category) {
              categories[product.category] = (categories[product.category] || 0) + 1;
            }
          });
          
          const categoryChartData = Object.keys(categories).map(category => ({
            name: category,
            value: categories[category]
          }));
          setCategoryData(categoryChartData);

          // Process price range distribution
          const priceRanges = {
            '0-50': 0,
            '51-100': 0,
            '101-200': 0,
            '201-500': 0,
            '501+': 0
          };

          productsResponse.products.forEach((product: Product) => {
            const price = product.price_min;
            if (price <= 50) priceRanges['0-50']++;
            else if (price <= 100) priceRanges['51-100']++;
            else if (price <= 200) priceRanges['101-200']++;
            else if (price <= 500) priceRanges['201-500']++;
            else priceRanges['501+']++;
          });

          const priceRangeChartData = Object.keys(priceRanges).map(range => ({
            name: range,
            count: priceRanges[range as keyof typeof priceRanges]
          }));
          setPriceRangeData(priceRangeChartData);

          // Process rating distribution
          const ratings = {
            '0-1': 0,
            '1-2': 0,
            '2-3': 0,
            '3-4': 0,
            '4-5': 0
          };

          productsResponse.products.forEach((product: Product) => {
            const rating = parseFloat(product.average_rating || '0');
            if (rating < 1) ratings['0-1']++;
            else if (rating < 2) ratings['1-2']++;
            else if (rating < 3) ratings['2-3']++;
            else if (rating < 4) ratings['3-4']++;
            else ratings['4-5']++;
          });

          const ratingChartData = Object.keys(ratings).map(range => ({
            name: range,
            count: ratings[range as keyof typeof ratings]
          }));
          setRatingDistribution(ratingChartData);
        }

        // Fetch popular products
        const popularResponse = await fetchPopularProducts();
        if (popularResponse && popularResponse.products) {
          setPopularProducts(popularResponse.products.slice(0, 5));
        }

        // Fetch most viewed products
        const viewedResponse = await fetchMostViewedProducts();
        if (viewedResponse && viewedResponse.products) {
          setMostViewedProducts(viewedResponse.products.slice(0, 5));
        }

      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const name = payload[0].name || 'Category';
      const value = payload[0].value !== undefined ? payload[0].value : 0;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          {/* <p className="text-sm font-medium">{`${label || 'N/A'}`}</p> */}
          <p className="text-xs" style={{ color: payload[0].color }}>{`${name}: ${value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }}></div>
        </div>
      ) : (
        <>
          {/* Top row - Category Distribution and Price Range */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle style={{ color: COLORS.accent }}>Product Categories</CardTitle>
                <CardDescription>Distribution of products by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Price Range Distribution */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle style={{ color: COLORS.accent }}>Price Distribution</CardTitle>
                <CardDescription>Number of products by price range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                                      <ResponsiveContainer width="100%" height="100%">
                                          <BarChart
                                              data={priceRangeData}
                                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                          >
                                              <CartesianGrid strokeDasharray="3 3" />
                                              <XAxis
                                                  dataKey="name"
                                                  tickFormatter={(tick) => `₱${tick}`} // ₱ sa X-axis
                                              />
                                              <YAxis />
                                              <Tooltip
                                                  formatter={(value, name, props) => [`${value} products`, `Price Range: ₱${props.payload.name}`]} 
                                              />
                                              <Bar dataKey="count" name="Products" fill={COLORS.primary} />
                                          </BarChart>
                                      </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second row - Rating Distribution */}
          <div className="grid grid-cols-1 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle style={{ color: COLORS.accent }}>Rating Distribution</CardTitle>
                <CardDescription>Number of products by rating range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ratingDistribution}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Products" fill={COLORS.secondary} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Third row - Most Viewed Products */}
          {/* <div className="grid grid-cols-1 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle style={{ color: COLORS.accent }}>Most Viewed Products</CardTitle>
                <CardDescription>Products with the highest number of views</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mostViewedProducts.map(product => ({
                        name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
                        views: product.views || 0
                      }))}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="views" fill={COLORS.accent} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div> */}
        </>
      )}
    </div>
  );
}