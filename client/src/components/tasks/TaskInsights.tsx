import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { PRIORITIES, type Task } from '../../api';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

/** Reads a theme colour from the CSS variables in shared/theme.css. */
const cssColor = (name: string, alpha = 1) => {
  const rgb = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim().split(' ').join(', ');
  return `rgba(${rgb}, ${alpha})`;
};

export default function TaskInsights({ tasks }: { tasks: Task[] }) {
  const done = tasks.filter((t) => t.completed).length;
  const byPriority = PRIORITIES.map((p) => tasks.filter((t) => t.priority === p).length);
  const ink = cssColor('ink-soft');
  const grid = cssColor('line');

  return (
    <div className="grid gap-6 p-5 sm:grid-cols-2">
      <figure>
        <figcaption className="mb-3 text-[13px] text-ink-mute">Open vs done</figcaption>
        <div className="mx-auto h-48 max-w-[220px]">
          <Doughnut
            data={{
              labels: ['Open', 'Done'],
              datasets: [{ data: [tasks.length - done, done], backgroundColor: [cssColor('rust'), cssColor('moss')], borderColor: cssColor('paper-raised'), borderWidth: 3 }],
            }}
            options={{ maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { color: ink, boxWidth: 10 } } } }}
          />
        </div>
      </figure>
      <figure>
        <figcaption className="mb-3 text-[13px] text-ink-mute">Tasks by priority</figcaption>
        <div className="h-48">
          <Bar
            data={{
              labels: PRIORITIES.map((p) => p[0].toUpperCase() + p.slice(1)),
              datasets: [{ data: byPriority, backgroundColor: [cssColor('ink-mute', 0.55), cssColor('ink-soft', 0.75), cssColor('rust')], borderRadius: 6 }],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: ink }, grid: { display: false } },
                y: { beginAtZero: true, ticks: { color: ink, precision: 0 }, grid: { color: grid } },
              },
            }}
          />
        </div>
      </figure>
    </div>
  );
}
