import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader } from '../ui/card';
import { COLORS, ChartTitleWithInfo, CustomTooltip } from './Shared';

interface PieChartCardProps {
  title: string;
  info: string;
  data: { name: string; value: number }[];
  colorOffset?: number;
}

export function PieChartCard({ title, info, data, colorOffset = 0 }: PieChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <ChartTitleWithInfo title={title} info={info} />
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[(index + colorOffset) % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
