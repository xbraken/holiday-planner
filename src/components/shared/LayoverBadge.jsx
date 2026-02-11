import { CircleDot, Moon } from 'lucide-react';

export default function LayoverBadge({ layover }) {
  return (
    <div className="flex items-center gap-1.5 pl-8 py-1">
      <div className="w-px h-4 bg-gray-300 ml-[11px]" />
      <span className="text-[11px] text-gray-500 flex items-center gap-1">
        <CircleDot className="w-3 h-3 text-gray-400" />
        {layover.duration} layover at {layover.code}
        {layover.overnight && (
          <span className="text-amber-500 flex items-center gap-0.5">
            <Moon className="w-3 h-3" />
            Overnight
          </span>
        )}
      </span>
    </div>
  );
}
