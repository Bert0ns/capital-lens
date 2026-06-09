import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader } from '../ui/card';
import { ChartTitleWithInfo, CustomTooltip } from './Shared';

interface ConcentrationChartProps {
  data: { name: string; value: number }[];
}

export function ConcentrationChart({ data }: ConcentrationChartProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <ChartTitleWithInfo
          title="Portfolio Concentration (Top 50 Holdings)"
          info="A cumulative sum of your top 50 holdings. Helps identify if your portfolio is top-heavy (e.g., your top 5 stocks making up 30% of your net worth)."
        />
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                type="number"
                unit="%"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 'dataMax']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
