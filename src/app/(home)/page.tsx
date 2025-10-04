"use client";

import React, { useState } from 'react';
import { Navbar } from './navbar';
import { TemplatesGallery } from './templates-gallery';
import { usePaginatedQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { DocumentsTable } from './documents-table';
import { useSearchParam } from '@/hooks/use-search-param';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Building2, User } from 'lucide-react';

const Home = () => {
  const [search] = useSearchParam();
  const { orgId } = useAuth();
  const [showPersonal, setShowPersonal] = useState(false);
  
  const {results, status, loadMore} = usePaginatedQuery(
    api.documents.get, 
    { search, showPersonal }, 
    { initialNumItems: 5 }
  );
  
  // Check if user is in an organization
  const isInOrganization = !!orgId;
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className='fixed top-0 left-0 right-0 z-10 h-16 bg-white p-4'>
        <Navbar />
      </div>
      <div className='mt-16'>
        <TemplatesGallery showPersonal={showPersonal} />
        
        {/* Document switcher when in organization */}
        {isInOrganization && (
          <div className="max-w-screen-xl mx-auto px-16 pt-6 pb-2">
            <div className="flex gap-2 items-center">
              <Button
                onClick={() => setShowPersonal(false)}
                variant={!showPersonal ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Building2 className="h-4 w-4" />
                Organization
              </Button>
              <Button
                onClick={() => setShowPersonal(true)}
                variant={showPersonal ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Personal
              </Button>
            </div>
          </div>
        )}
        
        <DocumentsTable
          documents={results}
          loadMore={loadMore}
          status={status}
        />
      </div>
    </div>
  )
}

export default Home