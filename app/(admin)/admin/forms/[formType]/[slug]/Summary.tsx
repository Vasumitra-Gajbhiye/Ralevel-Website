// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Pie,
//   PieChart,
//   XAxis,
//   YAxis,
// } from "recharts";

// type Props = {
//   submissions: any[];
// };

// export default function Summary({ submissions }: Props) {
//   const total = submissions.length;

//   const statusCounts = submissions.reduce((acc, s) => {
//     acc[s.status] = (acc[s.status] || 0) + 1;
//     return acc;
//   }, {} as Record<string, number>);

//   const levelCounts = submissions.reduce((acc, s) => {
//     const level = s.responses["academic-background"]?.currentLevel;
//     if (level) acc[level] = (acc[level] || 0) + 1;
//     return acc;
//   }, {} as Record<string, number>);

//   const dateCounts = submissions.reduce((acc, s) => {
//     const date = new Date(s.submittedAt).toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//     });
//     acc[date] = (acc[date] || 0) + 1;
//     return acc;
//   }, {} as Record<string, number>);

//   const statusData = Object.entries(statusCounts).map(([key, value]) => ({
//     name: key,
//     value,
//   }));

//   const levelData = Object.entries(levelCounts).map(([key, value]) => ({
//     name: key,
//     value,
//   }));

//   const dateData = Object.entries(dateCounts).map(([key, value]) => ({
//     date: key,
//     count: value,
//   }));

//   return (
//     <div className="space-y-8">
//       {/* STATS */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <StatCard title="Total Responses" value={total} />
//         <StatCard title="Pending" value={statusCounts["pending"] || 0} />
//         <StatCard title="Approved" value={statusCounts["approved"] || 0} />
//         <StatCard title="Rejected" value={statusCounts["rejected"] || 0} />
//       </div>

//       {/* CHARTS */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* STATUS PIE */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Status breakdown</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ChartContainer config={{}}>
//               <PieChart width={300} height={260}>
//                 <Pie
//                   data={statusData}
//                   dataKey="value"
//                   nameKey="name"
//                   outerRadius={100}
//                 />
//                 <ChartTooltip content={<ChartTooltipContent />} />
//               </PieChart>
//             </ChartContainer>
//           </CardContent>
//         </Card>

//         {/* LEVEL PIE */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Academic level</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ChartContainer config={{}}>
//               <PieChart width={300} height={260}>
//                 <Pie
//                   data={levelData}
//                   dataKey="value"
//                   nameKey="name"
//                   outerRadius={100}
//                 />
//                 <ChartTooltip content={<ChartTooltipContent />} />
//               </PieChart>
//             </ChartContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* TIMELINE */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Submissions over time</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <ChartContainer config={{}}>
//             <BarChart width={600} height={280} data={dateData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis allowDecimals={false} />
//               <Bar dataKey="count" radius={[4, 4, 0, 0]} />
//               <ChartTooltip content={<ChartTooltipContent />} />
//             </BarChart>
//           </ChartContainer>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// function StatCard({ title, value }: { title: string; value: number }) {
//   return (
//     <Card>
//       <CardHeader className="pb-2">
//         <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="text-3xl font-semibold">{value}</div>
//       </CardContent>
//     </Card>
//   );
// }
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

type Vote = {
  vote: 1 | -1;
};

type FormSubmission = {
  _id: string;
  votes?: Vote[];
  createdAt: string;
};

type Props = {
  submissions: FormSubmission[];
  totalResponses: number;
};

export default function Summary({ submissions, totalResponses }: Props) {
  const total = totalResponses;

  // 🔹 Calculate scores
  const scores = submissions.map((s) => {
    const votes = s.votes ?? [];
    const up = votes.filter((v) => v.vote === 1).length;
    const down = votes.filter((v) => v.vote === -1).length;
    return up - down;
  });

  const avgScore =
    scores.length > 0
      ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
      : 0;

  const positiveCount = scores.filter((s) => s > 0).length;
  const positiveRatio = total ? Math.round((positiveCount / total) * 100) : 0;

  const topScore = scores.length ? Math.max(...scores) : 0;

  // 🔹 Score Distribution
  const scoreBuckets = {
    strongPositive: 0,
    mildPositive: 0,
    neutral: 0,
    negative: 0,
  };

  scores.forEach((score) => {
    if (score >= 2) scoreBuckets.strongPositive++;
    else if (score === 1) scoreBuckets.mildPositive++;
    else if (score === 0) scoreBuckets.neutral++;
    else scoreBuckets.negative++;
  });

  const scoreData = [
    { name: "Strong +", value: scoreBuckets.strongPositive },
    { name: "Mild +", value: scoreBuckets.mildPositive },
    { name: "Neutral", value: scoreBuckets.neutral },
    { name: "Negative", value: scoreBuckets.negative },
  ];

  // 🔹 Timeline Data
  const dateCounts = submissions.reduce((acc, s) => {
    const date = new Date(s.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });

    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dateData = Object.entries(dateCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Responses" value={total} />
        <StatCard title="Average Score" value={avgScore} />
        <StatCard title="Positive Signal %" value={`${positiveRatio}%`} />
        <StatCard title="Top Score" value={topScore} />
      </div>

      {/* SCORE DISTRIBUTION */}
      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}}>
            <PieChart width={350} height={280}>
              <Pie
                data={scoreData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* TIMELINE */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}}>
            <BarChart width={600} height={280} data={dateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
