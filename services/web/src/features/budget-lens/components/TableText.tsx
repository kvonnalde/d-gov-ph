interface TableTextProps {
  value: string | null | undefined;
  className?: string;
  maxLength?: number;
}

export function TableText({ value, className, maxLength = 250 }: TableTextProps) {
  if (!value) return <span className={className}>Not listed</span>;

  const text = value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
  return <span className={className} title={text === value ? undefined : value}>{text}</span>;
}