
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search, Download, MoreHorizontal, FileUp, FileX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface DataTableProps {
  data: Record<string, any>[];
  title: string;
  description?: string;
  emptyMessage?: string;
}

const DataTable = ({ data, title, description, emptyMessage = "No data available" }: DataTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileX className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              {emptyMessage}
            </p>
            <p className="text-xs text-muted-foreground max-w-md mb-6">
              Upload CSV files in the appropriate format to see data here
            </p>
            <Link to="/upload">
              <Button className="flex items-center">
                <FileUp className="mr-2 h-4 w-4" />
                Upload Data
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get all columns from the data
  const allColumns = Object.keys(data[0]);
  
  // Initialize visible columns if not set
  if (visibleColumns.length === 0 && allColumns.length > 0) {
    // Show all columns by default, or limit to first 8 if there are many
    setVisibleColumns(allColumns.length > 8 ? allColumns.slice(0, 8) : allColumns);
  }
  
  const filteredData = data.filter(row => 
    Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleExport = () => {
    // Create CSV content
    const headers = visibleColumns.join(',');
    const rows = filteredData.map(row => 
      visibleColumns.map(col => `"${String(row[col] || '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleColumn = (column: string) => {
    if (visibleColumns.includes(column)) {
      setVisibleColumns(visibleColumns.filter(col => col !== column));
    } else {
      setVisibleColumns([...visibleColumns, column]);
    }
  };

  return (
    <Card className="glass-card overflow-hidden animate-fade-in transition-all duration-300">
      <CardHeader className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <div className="w-full md:w-80 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allColumns.map(column => (
                  <DropdownMenuItem 
                    key={column}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleColumn(column);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={visibleColumns.includes(column)}
                        onChange={() => {}}
                        className="form-checkbox h-4 w-4"
                      />
                      <span>{column.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border rounded-md">
          <div className="max-h-[400px] overflow-auto table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((column) => (
                    <TableHead key={column} className="bg-muted/50 whitespace-nowrap">
                      {column.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {visibleColumns.map((column) => (
                        <TableCell key={`${rowIndex}-${column}`} className="whitespace-nowrap">
                          {row[column] !== undefined ? String(row[column]) : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
                      No results found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2 px-2">
          Showing {filteredData.length} of {data.length} entries
        </div>
      </CardContent>
    </Card>
  );
};

export default DataTable;
