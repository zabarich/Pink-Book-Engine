'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileJson, FileText, FileSpreadsheet, Database } from 'lucide-react';

export default function DownloadPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Download Data</h1>
          <p className="text-lg text-gray-600">
            Access Pink Book 2025-26 data in various formats
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Official Documents
            </CardTitle>
            <CardDescription>
              Government published documents and reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Pink Book 2025-26 (Full PDF)</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete official budget document (93 pages)
                  </p>
                </div>
                <a 
                  href="https://www.gov.im/media/1387536/pink-book-2025-26-final-v3_compressed.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </a>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Budget Speech 2025-26</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Treasury Minister's budget presentation
                  </p>
                </div>
                <Button size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Structured Data Files
            </CardTitle>
            <CardDescription>
              Machine-readable data extracted from the Pink Book
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Revenue Streams Data</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    All government income sources (JSON format)
                  </p>
                </div>
                <a href="/data/source/revenue-streams.json" download>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    JSON
                  </Button>
                </a>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Department Budgets</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Detailed departmental allocations (JSON format)
                  </p>
                </div>
                <a href="/data/source/department-budgets.json" download>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    JSON
                  </Button>
                </a>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Capital Programme</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Infrastructure and capital projects (JSON format)
                  </p>
                </div>
                <a href="/data/source/capital-programme.json" download>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    JSON
                  </Button>
                </a>
              </div>
            </div>

            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Reserves & Funds</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Reserve positions and fund balances (JSON format)
                  </p>
                </div>
                <a href="/data/source/reserves-funds.json" download>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    JSON
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Complete Dataset
            </CardTitle>
            <CardDescription>
              All Pink Book data in a single package
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Pink Book 2025-26 Complete Data Bundle</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    All structured data files in ZIP format (includes documentation)
                  </p>
                </div>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>Data Usage & Licensing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              All data is sourced from the official Isle of Man Government Pink Book 2025-26 and is 
              provided for informational purposes. Please refer to the official PDF for authoritative information.
            </p>
            <p>
              The structured JSON files are derived works created to facilitate data analysis and visualisation. 
              While every effort has been made to ensure accuracy, please verify critical figures against 
              the official source document.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}