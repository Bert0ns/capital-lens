import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader } from '../ui/card';
import { COLORS, ChartTitleWithInfo, CustomTooltip } from './Shared';

interface TopHoldingsChartProps {
  data: { name: string; value: number }[];
}

export function TopHoldingsChart({ data }: TopHoldingsChartProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <ChartTitleWithInfo
          title="Top 10 Holdings"
          info="The 10 largest individual companies you own across all your active ETFs, aggregated by their proportional weight."
        />
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart
              data={data}
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
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
