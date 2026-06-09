'use client';

import { useMemo } from 'react';
import { EtfConfig } from '../lib/types';
import { aggregateBy, aggregateTopHoldings, calculateAverageTer } from '../lib/math';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface DashboardProps {
  etfs: EtfConfig[];
  totalWeight: number;
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#64748b',
  '#ec4899',
  '#14b8a6',
];

export default function Dashboard({ etfs, totalWeight }: DashboardProps) {
  const geoData = useMemo(() => aggregateBy(etfs, 'country').slice(0, 10), [etfs]);
  const sectorData = useMemo(() => aggregateBy(etfs, 'sector').slice(0, 10), [etfs]);
  const currencyData = useMemo(() => aggregateBy(etfs, 'currency').slice(0, 5), [etfs]);
  const topHoldings = useMemo(() => aggregateTopHoldings(etfs, 10), [etfs]);
  const avgTer = useMemo(() => calculateAverageTer(etfs), [etfs]);

  if (etfs.length === 0 || totalWeight === 0) {
    return (
      <Card className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[400px] h-full border-dashed">
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium text-foreground mb-2">No Data to Display</h3>
          <p>Add ETFs and allocate weight to see your portfolio analysis.</p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="px-3 py-2 border-border shadow-lg rounded-lg text-sm border">
          <p className="font-medium text-foreground">{payload[0].name}</p>
          <p className="text-primary font-semibold">{payload[0].value.toFixed(2)}%</p>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Weighted Avg TER</h3>
            <p className="text-3xl font-bold text-foreground">{avgTer.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Total Assets Analyzed
            </h3>
            <p className="text-3xl font-bold text-foreground">
              {etfs.reduce((sum, etf) => sum + etf.holdings.length, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col justify-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Active ETFs</h3>
            <p className="text-3xl font-bold text-foreground">
              {etfs.filter((e) => e.globalWeight > 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Holdings Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top 10 Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topHoldings}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis
                    type="number"
                    unit="%"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)' }} />
                  <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={28}>
                    {topHoldings.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Exposure */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={geoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {geoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sector Exposure */}
        <Card>
          <CardHeader>
            <CardTitle>Sector Exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
