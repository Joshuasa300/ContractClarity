
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, GitCommit } from 'lucide-react';

interface Change {
  id: string;
  date: string;
  type: 'feature' | 'improvement' | 'bug-fix';
  description: string;
}

const recentChanges: Change[] = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'feature',
    description: 'Added multi-language support for contract analysis'
  },
  {
    id: '2',
    date: '2024-01-10',
    type: 'improvement',
    description: 'Enhanced PDF text extraction accuracy'
  },
  {
    id: '3',
    date: '2024-01-08',
    type: 'bug-fix',
    description: 'Fixed issue with Google OAuth authentication'
  },
  {
    id: '4',
    date: '2024-01-05',
    type: 'feature',
    description: 'Added risk assessment categorization'
  }
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'feature':
      return 'bg-green-100 text-green-800';
    case 'improvement':
      return 'bg-blue-100 text-blue-800';
    case 'bug-fix':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function ChangesFooter() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <GitCommit className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Changes</h3>
          </div>
          <p className="text-sm text-gray-600">
            Stay updated with the latest improvements and features
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {recentChanges.map((change) => (
            <Card key={change.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge 
                    variant="secondary" 
                    className={getTypeColor(change.type)}
                  >
                    {change.type.replace('-', ' ')}
                  </Badge>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {change.date}
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {change.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © 2024 ContractAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
