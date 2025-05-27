
import React, { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BarChart, 
  Calendar, 
  Download, 
  FileArchive, 
  FileMinus, 
  FilePlus, 
  FileSearch, 
  FileText, 
  Printer 
} from 'lucide-react';
import { DatePicker } from '@/components/admin/reports/DatePicker';
import { convertToCSV, createPDFContent, downloadFile, getReportData } from '@/utils/reportUtils';
import { format } from 'date-fns';

type ReportType = 'occupancy' | 'applications' | 'maintenance' | 'blocks' | 'students';
type ReportFormat = 'pdf' | 'csv' | 'excel';
type ReportPeriod = 'current' | 'semester' | 'academic-year' | 'custom';

interface ReportConfig {
  type: ReportType;
  format: ReportFormat;
  period: ReportPeriod;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
  format: string;
  size: string;
  content?: string;
}

const AdminReports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('occupancy');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('pdf');
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('current');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['name', 'status', 'date']);
  
  const [recentReports, setRecentReports] = useState<Report[]>([
    {
      id: 'report-1',
      title: 'Room Occupancy Report',
      date: '2025-04-15',
      type: 'occupancy',
      format: 'pdf',
      size: '245 KB'
    },
    {
      id: 'report-2',
      title: 'Student Applications Summary',
      date: '2025-04-10',
      type: 'applications',
      format: 'excel',
      size: '128 KB'
    },
    {
      id: 'report-3',
      title: 'Maintenance Issues by Block',
      date: '2025-04-05',
      type: 'maintenance',
      format: 'pdf',
      size: '312 KB'
    }
  ]);

  const reportOptions: Record<ReportType, ReportConfig> = {
    occupancy: {
      type: 'occupancy',
      format: 'pdf',
      period: 'current',
      title: 'Room Occupancy Report',
      description: 'Details of all rooms with current occupancy status and student information.',
      icon: <FileArchive className="h-5 w-5" />
    },
    applications: {
      type: 'applications',
      format: 'pdf',
      period: 'current',
      title: 'Student Applications Report',
      description: 'Summary of all student accommodation applications with status details.',
      icon: <FileSearch className="h-5 w-5" />
    },
    maintenance: {
      type: 'maintenance',
      format: 'pdf',
      period: 'current',
      title: 'Maintenance Requests Report',
      description: 'List of all maintenance requests with status and resolution details.',
      icon: <FileMinus className="h-5 w-5" />
    },
    blocks: {
      type: 'blocks',
      format: 'pdf',
      period: 'current',
      title: 'Residence Blocks Report',
      description: 'Overview of all residence blocks, rooms and occupancy statistics.',
      icon: <FileArchive className="h-5 w-5" />
    },
    students: {
      type: 'students',
      format: 'pdf',
      period: 'current',
      title: 'Student Management Report',
      description: 'Comprehensive list of all students and their housing assignments.',
      icon: <FilePlus className="h-5 w-5" />
    }
  };

  // Get column options based on report type
  const getColumnOptions = () => {
    switch(reportType) {
      case 'occupancy':
        return [
          { id: 'block', label: 'Block Name' },
          { id: 'roomNumber', label: 'Room Number' },
          { id: 'type', label: 'Room Type' },
          { id: 'capacity', label: 'Capacity' },
          { id: 'occupied', label: 'Occupied Spaces' },
          { id: 'occupants', label: 'Student Names' },
          { id: 'status', label: 'Status' }
        ];
      case 'applications':
        return [
          { id: 'studentName', label: 'Student Name' },
          { id: 'studentId', label: 'Student ID' },
          { id: 'blockPreference', label: 'Block Preference' },
          { id: 'roomType', label: 'Room Type' },
          { id: 'applicationDate', label: 'Application Date' },
          { id: 'status', label: 'Status' },
          { id: 'assignedRoom', label: 'Assigned Room' }
        ];
      case 'maintenance':
        return [
          { id: 'issueType', label: 'Issue Type' },
          { id: 'description', label: 'Description' },
          { id: 'block', label: 'Block' },
          { id: 'roomNumber', label: 'Room Number' },
          { id: 'reportedBy', label: 'Reported By' },
          { id: 'dateReported', label: 'Date Reported' },
          { id: 'status', label: 'Status' },
          { id: 'priority', label: 'Priority' }
        ];
      case 'students':
        return [
          { id: 'name', label: 'Student Name' },
          { id: 'id', label: 'Student ID' },
          { id: 'email', label: 'Email' },
          { id: 'block', label: 'Block' },
          { id: 'room', label: 'Room' },
          { id: 'hasApplication', label: 'Has Active Application' },
          { id: 'hasMaintenance', label: 'Has Maintenance Requests' }
        ];
      case 'blocks':
        return [
          { id: 'name', label: 'Block Name' },
          { id: 'totalRooms', label: 'Total Rooms' },
          { id: 'availableRooms', label: 'Available Rooms' },
          { id: 'occupancyRate', label: 'Occupancy Rate (%)' },
          { id: 'gender', label: 'Gender Designation' },
          { id: 'maintenanceIssues', label: 'Pending Maintenance Issues' }
        ];
      default:
        return [];
    }
  };

  const handleGenerateReport = () => {
    // Validate date inputs for custom period
    if (reportPeriod === 'custom') {
      if (!startDate || !endDate) {
        toast.error('Please select both start and end dates for custom period');
        return;
      }
      if (endDate < startDate) {
        toast.error('End date must be after start date');
        return;
      }
    }
    
    // Validate at least one column is selected
    if (selectedColumns.length === 0) {
      toast.error('Please select at least one column to include in the report');
      return;
    }
    
    setGeneratingReport(true);
    
    // Get report data based on selected type and columns
    const reportData = getReportData(reportType, selectedColumns, startDate, endDate);
    
    // Generate the report content based on the format
    let reportContent = '';
    const reportTitle = reportOptions[reportType].title;
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
    const filename = `${reportType}_report_${timestamp}`;
    
    if (reportFormat === 'csv') {
      reportContent = convertToCSV(reportData);
    } else if (reportFormat === 'pdf' || reportFormat === 'excel') {
      // For demo purposes, we're using a simple text representation
      // In a real app, you would use a PDF or Excel generation library
      reportContent = createPDFContent(reportTitle, reportData);
    }
    
    // Calculate file size (this is a simplified approximation)
    const fileSizeBytes = new Blob([reportContent]).size;
    const fileSizeKB = Math.round(fileSizeBytes / 1024);
    
    setTimeout(() => {
      setGeneratingReport(false);
      
      const newReport = {
        id: `report-${Date.now()}`,
        title: reportOptions[reportType].title,
        date: new Date().toISOString().split('T')[0],
        type: reportType,
        format: reportFormat,
        size: `${fileSizeKB} KB`,
        content: reportContent
      };
      
      // Add to recent reports
      setRecentReports([newReport, ...recentReports].slice(0, 10));
      
      // Download the file
      downloadFile(reportContent, filename, reportFormat);
      
      toast.success('Report generated and download started');
    }, 1500);
  };

  const handleDownloadReport = (reportId: string) => {
    const report = recentReports.find(r => r.id === reportId);
    
    if (report) {
      if (!report.content) {
        // For demo reports that don't have content yet, generate it
        const reportData = getReportData(report.type as ReportType, ['name', 'status', 'date']);
        const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
        const filename = `${report.type}_report_${timestamp}`;
        
        let content = '';
        if (report.format === 'csv') {
          content = convertToCSV(reportData);
        } else {
          content = createPDFContent(report.title, reportData);
        }
        
        downloadFile(content, filename, report.format);
      } else {
        // For reports that already have content
        const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
        const filename = `${report.type}_report_${timestamp}`;
        downloadFile(report.content, filename, report.format);
      }
      
      toast.success('Report download started');
    } else {
      toast.error('Report not found');
    }
  };

  const handlePrintReport = (reportId: string) => {
    const report = recentReports.find(r => r.id === reportId);
    
    if (report) {
      // Generate content if it doesn't exist
      let content = report.content;
      if (!content) {
        const reportData = getReportData(report.type as ReportType, ['name', 'status', 'date']);
        content = createPDFContent(report.title, reportData);
      }
      
      // Create a printable document
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${report.title}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body>
              <h1>${report.title}</h1>
              <p>Generated on: ${new Date().toLocaleDateString()}</p>
              <pre>${content}</pre>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
      
      toast.success('Preparing report for printing');
    } else {
      toast.error('Report not found');
    }
  };

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns(
      selectedColumns.includes(columnId)
        ? selectedColumns.filter(id => id !== columnId)
        : [...selectedColumns, columnId]
    );
  };

  const getReportTypeIcon = (type: string) => {
    switch(type) {
      case 'occupancy': return <FileArchive className="h-4 w-4" />;
      case 'applications': return <FileSearch className="h-4 w-4" />;
      case 'maintenance': return <FileMinus className="h-4 w-4" />;
      case 'blocks': return <FileArchive className="h-4 w-4" />;
      case 'students': return <FilePlus className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getReportFormatBadge = (format: string) => {
    switch(format) {
      case 'pdf': return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">PDF</Badge>;
      case 'csv': return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">CSV</Badge>;
      case 'excel': return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Excel</Badge>;
      default: return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">{format}</Badge>;
    }
  };

  return (
    <AppShell>
      <div className="page-container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              onClick={() => setActiveTab('generate')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              New Report
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('scheduled')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Schedule Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} value={activeTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="generate">Generate Reports</TabsTrigger>
            <TabsTrigger value="recent">Recent Reports</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Generate New Report</CardTitle>
                  <CardDescription>
                    Configure and generate a new report based on your requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="reportType">Report Type</Label>
                      <Select 
                        value={reportType} 
                        onValueChange={(value) => {
                          setReportType(value as ReportType);
                          // Reset columns when changing report type
                          setSelectedColumns([]);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="occupancy" className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <FileArchive className="h-4 w-4" />
                              Room Occupancy Report
                            </div>
                          </SelectItem>
                          <SelectItem value="applications">
                            <div className="flex items-center gap-2">
                              <FileSearch className="h-4 w-4" />
                              Student Applications Report
                            </div>
                          </SelectItem>
                          <SelectItem value="maintenance">
                            <div className="flex items-center gap-2">
                              <FileMinus className="h-4 w-4" />
                              Maintenance Requests Report
                            </div>
                          </SelectItem>
                          <SelectItem value="blocks">
                            <div className="flex items-center gap-2">
                              <FileArchive className="h-4 w-4" />
                              Residence Blocks Report
                            </div>
                          </SelectItem>
                          <SelectItem value="students">
                            <div className="flex items-center gap-2">
                              <FilePlus className="h-4 w-4" />
                              Student Management Report
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        {reportOptions[reportType].description}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reportFormat">Format</Label>
                        <Select 
                          value={reportFormat} 
                          onValueChange={(value) => setReportFormat(value as ReportFormat)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF Document</SelectItem>
                            <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                            <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="reportPeriod">Time Period</Label>
                        <Select 
                          value={reportPeriod} 
                          onValueChange={(value) => setReportPeriod(value as ReportPeriod)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current">Current Status</SelectItem>
                            <SelectItem value="semester">Current Semester</SelectItem>
                            <SelectItem value="academic-year">Academic Year</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {reportPeriod === 'custom' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b py-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <DatePicker 
                            date={startDate} 
                            onSelect={setStartDate} 
                            placeholder="Select start date"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <DatePicker 
                            date={endDate} 
                            onSelect={setEndDate} 
                            placeholder="Select end date"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label>Select Columns</Label>
                      <div className="border rounded-md p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {getColumnOptions().map(column => (
                          <div key={column.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={column.id}
                              checked={selectedColumns.includes(column.id)}
                              onCheckedChange={() => handleColumnToggle(column.id)}
                            />
                            <label htmlFor={column.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {column.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        onClick={handleGenerateReport} 
                        disabled={generatingReport}
                        className="flex items-center gap-2"
                      >
                        {generatingReport ? 'Generating...' : 'Generate Report'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setSelectedColumns(getColumnOptions().map(c => c.id));
                        }}
                      >
                        Select All Columns
                      </Button>
                      
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setSelectedColumns([]);
                        }}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Report Templates</CardTitle>
                  <CardDescription>
                    Use pre-configured report templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <button 
                      className="w-full p-4 rounded-lg border border-muted hover:bg-muted/50 text-left transition-colors"
                      onClick={() => {
                        setReportType('occupancy');
                        setReportFormat('pdf');
                        setReportPeriod('current');
                        setSelectedColumns(['block', 'roomNumber', 'type', 'capacity', 'occupied', 'status']);
                      }}
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <FileArchive className="h-4 w-4" />
                        Room Occupancy Summary
                      </div>
                      <div className="text-sm text-muted-foreground">Current status of all rooms</div>
                    </button>
                    
                    <button 
                      className="w-full p-4 rounded-lg border border-muted hover:bg-muted/50 text-left transition-colors"
                      onClick={() => {
                        setReportType('applications');
                        setReportFormat('excel');
                        setReportPeriod('academic-year');
                        setSelectedColumns(['studentName', 'studentId', 'blockPreference', 'roomType', 'applicationDate', 'status']);
                      }}
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <FileSearch className="h-4 w-4" />
                        Applications Overview
                      </div>
                      <div className="text-sm text-muted-foreground">Annual summary with status breakdown</div>
                    </button>
                    
                    <button 
                      className="w-full p-4 rounded-lg border border-muted hover:bg-muted/50 text-left transition-colors"
                      onClick={() => {
                        setReportType('maintenance');
                        setReportFormat('csv');
                        setReportPeriod('semester');
                        setSelectedColumns(['issueType', 'block', 'roomNumber', 'dateReported', 'status', 'priority']);
                      }}
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <FileMinus className="h-4 w-4" />
                        Maintenance Analysis
                      </div>
                      <div className="text-sm text-muted-foreground">Issues by category and block</div>
                    </button>
                    
                    <button 
                      className="w-full p-4 rounded-lg border border-muted hover:bg-muted/50 text-left transition-colors"
                      onClick={() => {
                        setReportType('students');
                        setReportFormat('pdf');
                        setReportPeriod('current');
                        setSelectedColumns(['name', 'id', 'email', 'block', 'room']);
                      }}
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <FilePlus className="h-4 w-4" />
                        Student Directory
                      </div>
                      <div className="text-sm text-muted-foreground">Complete list of housed students</div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>
                  Access and download your recently generated reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report</TableHead>
                      <TableHead>Date Generated</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No reports generated yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentReports.map(report => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getReportTypeIcon(report.type)}
                              <span>{report.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>{report.date}</TableCell>
                          <TableCell>{getReportFormatBadge(report.format)}</TableCell>
                          <TableCell>{report.size}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDownloadReport(report.id)}
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:ml-2">Download</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handlePrintReport(report.id)}
                              >
                                <Printer className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:ml-2">Print</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scheduled Reports
                </CardTitle>
                <CardDescription>
                  Set up automatic report generation on a schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No scheduled reports</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Scheduled reports allow you to automatically generate and receive 
                    reports on a regular basis via email or system notifications.
                  </p>
                  <Button className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule New Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default AdminReports;
