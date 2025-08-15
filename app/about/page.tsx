'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Users, Target, Shield } from 'lucide-react';

export default function AboutPage() {
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
          <h1 className="text-4xl font-bold">About the Pink Book</h1>
          <p className="text-lg text-gray-600">
            The Official Budget Document of the Isle of Man Government
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              What is the Pink Book?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Pink Book is the Isle of Man Government's comprehensive budget document for the fiscal year 2025-26. 
              It details all government revenue sources, departmental expenditure, capital programmes, and financial reserves.
            </p>
            <p>
              This document serves as the foundation for all government financial planning and provides transparency 
              about how public funds are allocated and utilised across the Island's services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Purpose of this Explorer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Budget Explorer makes the Pink Book data more accessible and interactive. Users can:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Visualise revenue and expenditure breakdowns</li>
              <li>Understand departmental budgets and allocations</li>
              <li>Explore different budget scenarios in Workshop Mode</li>
              <li>See historical trends and projections</li>
              <li>Access key financial metrics at a glance</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Who Uses This Tool?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This tool is designed for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Government Officials:</strong> For policy planning and budget workshops</li>
              <li><strong>MHKs:</strong> To understand and analyse budget allocations</li>
              <li><strong>Civil Servants:</strong> For departmental planning and resource management</li>
              <li><strong>Citizens:</strong> To understand how government funds are allocated</li>
              <li><strong>Researchers:</strong> For economic and policy analysis</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data Accuracy & Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              All data in this explorer is extracted directly from the official Pink Book 2025-26 published by 
              the Isle of Man Treasury. Page references are provided throughout the tool to allow verification 
              against the source document.
            </p>
            <p>
              <strong>Key Figures:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Total Revenue: £1.389 billion</li>
              <li>Total Expenditure: £1.388 billion</li>
              <li>General Reserve: £1.76 billion</li>
              <li>National Insurance Fund: £850 million</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4 pt-6">
          <a 
            href="https://www.gov.im/media/1387536/pink-book-2025-26-final-v3_compressed.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button>
              Download Official Pink Book PDF
            </Button>
          </a>
          <Link href="/workshop">
            <Button variant="outline">
              Try Workshop Mode
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}