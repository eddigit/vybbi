import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: 'Jan', nouveaux: 300, actifs: 250 },
  { name: 'Fév', nouveaux: 350, actifs: 320 },
  { name: 'Mar', nouveaux: 400, actifs: 380 },
  { name: 'Avr', nouveaux: 480, actifs: 450 },
  { name: 'Mai', nouveaux: 520, actifs: 500 },
  { name: 'Jun', nouveaux: 580, actifs: 560 },
  { name: 'Jul', nouveaux: 620, actifs: 600 },
  { name: 'Aoû', nouveaux: 660, actifs: 640 },
  { name: 'Sep', nouveaux: 700, actifs: 680 },
];

export function AcquisitionChart() {
  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Acquisition de Partenaires</CardTitle>
        <CardDescription className="text-muted-foreground">
          Évolution mensuelle des nouveaux partenaires et partenaires actifs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="nouveaux" 
              stroke="hsl(var(--success))" 
              strokeWidth={3}
              name="Nouveaux partenaires"
              dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="actifs" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Partenaires actifs"
              strokeDasharray="5 5"
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}