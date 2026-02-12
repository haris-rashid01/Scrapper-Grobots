import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ResultsTableProps {
  data: Record<string, string>[];
}

const ResultsTable = ({ data }: ResultsTableProps) => {
  if (data.length === 0) return null;

  const columns = Object.keys(data[0]);

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return "—";
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="h-full w-full">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 border-b">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">#</TableHead>
            {columns.map((column) => (
              <TableHead key={column} className="h-10 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
                {column.replace(/_/g, " ")}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors border-b border-slate-100 dark:border-slate-800/50">
              <TableCell className="text-center font-mono text-[10px] text-slate-400 font-bold">
                {String(i + 1).padStart(2, "0")}
              </TableCell>
              {columns.map((column) => (
                <TableCell key={column} className="py-3 px-4 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {formatValue(row[column])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResultsTable;
