import {
  Users, Crown, TrendingUp, CalendarDays, PoundSterling, UserPlus
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

const membershipGrowth = [
  { month: "Sep", ajbn: 82, lions: 12 },
  { month: "Oct", ajbn: 96, lions: 18 },
  { month: "Nov", ajbn: 110, lions: 22 },
  { month: "Dec", ajbn: 118, lions: 28 },
  { month: "Jan", ajbn: 134, lions: 35 },
  { month: "Feb", ajbn: 148, lions: 42 },
  { month: "Mar", ajbn: 162, lions: 48 },
];

const revenueData = [
  { month: "Sep", ajbn: 8200, lions: 3000 },
  { month: "Oct", ajbn: 9600, lions: 4500 },
  { month: "Nov", ajbn: 11000, lions: 5500 },
  { month: "Dec", ajbn: 11800, lions: 7000 },
  { month: "Jan", ajbn: 13400, lions: 8750 },
  { month: "Feb", ajbn: 14800, lions: 10500 },
  { month: "Mar", ajbn: 16200, lions: 12000 },
];

const eventAttendance = [
  { name: "Q4 Networking", networking: 65, charity: 0 },
  { name: "Golf Day", networking: 0, charity: 42 },
  { name: "Winter Gala", networking: 0, charity: 58 },
  { name: "FinTech RT", networking: 38, charity: 0 },
  { name: "Q1 Dinner", networking: 72, charity: 0 },
];

const memberStatus = [
  { name: "Active", value: 148, fill: "hsl(207, 58%, 24%)" },
  { name: "Pending", value: 14, fill: "hsl(40, 80%, 50%)" },
  { name: "Expired", value: 22, fill: "hsl(0, 72%, 51%)" },
];

const kpis = [
  { label: "Total Members", value: "162", change: "+9.5%", icon: Users, color: "text-primary" },
  { label: "Impact Lions", value: "48", change: "+14.3%", icon: Crown, color: "text-gold" },
  { label: "Revenue (MTD)", value: "£28,200", change: "+12.1%", icon: PoundSterling, color: "text-teal" },
  { label: "Pending Approvals", value: "14", change: "", icon: UserPlus, color: "text-gold" },
  { label: "Events This Quarter", value: "6", change: "+2", icon: CalendarDays, color: "text-primary" },
  { label: "Avg Referrals/Member", value: "2.4", change: "+0.3", icon: TrendingUp, color: "text-teal" },
];

export function AnalyticsOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">AJBN network overview and analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon size={16} className={kpi.color} />
              <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">{kpi.value}</p>
            {kpi.change && (
              <p className="text-xs text-teal mt-1 font-medium">{kpi.change} vs last month</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Membership growth */}
        <div className="bg-card rounded-xl border p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Membership Growth</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={membershipGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 18%, 89%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(213, 12%, 48%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(213, 12%, 48%)" />
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(210, 18%, 89%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="ajbn"
                stackId="1"
                stroke="hsl(207, 58%, 24%)"
                fill="hsl(207, 58%, 24%)"
                fillOpacity={0.15}
                name="AJBN Members"
              />
              <Area
                type="monotone"
                dataKey="lions"
                stackId="2"
                stroke="hsl(40, 80%, 50%)"
                fill="hsl(40, 80%, 50%)"
                fillOpacity={0.2}
                name="Impact Lions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="bg-card rounded-xl border p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Revenue Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 18%, 89%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(213, 12%, 48%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(213, 12%, 48%)" tickFormatter={(v) => `£${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(210, 18%, 89%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => `£${value.toLocaleString()}`}
              />
              <Bar dataKey="ajbn" fill="hsl(207, 58%, 24%)" radius={[4, 4, 0, 0]} name="AJBN Revenue" />
              <Bar dataKey="lions" fill="hsl(40, 80%, 50%)" radius={[4, 4, 0, 0]} name="Lions Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Event attendance */}
        <div className="bg-card rounded-xl border p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Event Attendance</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={eventAttendance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 18%, 89%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(213, 12%, 48%)" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(213, 12%, 48%)" width={80} />
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(210, 18%, 89%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="networking" fill="hsl(207, 58%, 24%)" radius={[0, 4, 4, 0]} name="Networking" />
              <Bar dataKey="charity" fill="hsl(40, 80%, 50%)" radius={[0, 4, 4, 0]} name="Charity" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Member status pie */}
        <div className="bg-card rounded-xl border p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Member Status</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={memberStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {memberStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(210, 18%, 89%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
