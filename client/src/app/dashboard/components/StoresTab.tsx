import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COLORS } from '../../constants/colors';
import { Store, MapPin, BarChart2 } from 'lucide-react';
import { fetchStores, Store as StoreType } from '../../api/storeService';
import { BASE_URL } from '@/config';

// Import Recharts components
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

interface StoresTabProps {
  analyticsData: any;
}

export default function StoresTab({ analyticsData }: StoresTabProps) {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [typeData, setTypeData] = useState<any[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<any[]>([]);
  const [topRatedStores, setTopRatedStores] = useState<StoreType[]>([]);
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
        // Fetch all stores
        const storesResponse = await fetchStores();
        if (storesResponse && Array.isArray(storesResponse)) {
          setStores(storesResponse);
          
          // Process store type distribution data
          const types: Record<string, number> = {};
          storesResponse.forEach((store: StoreType) => {
            const storeType = store.type || 'Uncategorized';
            types[storeType] = (types[storeType] || 0) + 1;
          });
          
          const typeChartData = Object.keys(types).map(type => ({
            name: type,
            value: types[type]
          }));
          setTypeData(typeChartData);

          // Process rating distribution
          const ratings = {
            '0-1': 0,
            '1-2': 0,
            '2-3': 0,
            '3-4': 0,
            '4-5': 0
          };

          storesResponse.forEach((store: StoreType) => {
            const rating = store.rating || 0;
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

          // Get top rated stores
          const sortedStores = [...storesResponse].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          setTopRatedStores(sortedStores.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
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
          {/* Top row - Store Type Distribution and Rating Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Store Type Distribution */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle style={{ color: COLORS.accent }}>Store Types</CardTitle>
                <CardDescription>Distribution of stores by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={140}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Rating Distribution */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle style={{ color: COLORS.accent }}>Rating Distribution</CardTitle>
                <CardDescription>Number of stores by rating range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ratingDistribution}
                      margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Stores" fill={COLORS.secondary} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second row - Top Rated Stores */}
          
        </>
      )}
    </div>
  );
}