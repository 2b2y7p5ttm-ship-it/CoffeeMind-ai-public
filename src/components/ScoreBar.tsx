interface ScoreBarProps {
  label: string;
  value: number; // 1-10
}

export function ScoreBar({ label, value }: ScoreBarProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-[4.5rem] text-muted-foreground font-medium tracking-wide text-[10px] uppercase">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
      <span className="w-3 text-right font-serif font-medium text-primary text-xs">{value}</span>
    </div>
  );
}
