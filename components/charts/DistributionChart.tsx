import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader } from '../ui/card';
import { ChartTitleWithInfo, CustomTooltip } from './Shared';

interface DistributionChartProps {
  data: { name: string; value: number }[];
}

export function DistributionChart({ data }: DistributionChartProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <ChartTitleWithInfo
          title="Holdings Weight Distribution"
          info="Groups your underlying stocks by their individual size. Determines if you hold a few large positions vs thousands of tiny fractional positions."
        />
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="number"
                unit="%"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)' }} />
              <Bar dataKey="value" fill="var(--chart-2)" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
