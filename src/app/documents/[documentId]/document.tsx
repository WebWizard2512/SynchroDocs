"use client";

import { Editor } from './editor';
import { Toolbar } from './toolbar';
import { Navbar } from './navbar';
import { Room } from './room';
import { Preloaded, usePreloadedQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DocumentProps {
 preloadedDocument: Preloaded<typeof api.documents.getById>;
};

export const Document = ({ preloadedDocument }: DocumentProps) => {
    const router = useRouter();
    const [error, setError] = useState(false);
    
    let document;
    try {
        document = usePreloadedQuery(preloadedDocument);
    } catch (err) {
        if (!error) {
            setError(true);
        }
    }
    
    useEffect(() => {
        if (error) {
            router.replace('/');
        }
    }, [error, router]);
    
    if (error || !document) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <h2 className="text-xl font-semibold">Document not found</h2>
                    <p className="text-muted-foreground">Redirecting to home...</p>
                </div>
            </div>
        );
    }
    
    return (
        <Room>
            <div className="min-h-screen bg-[#FAFBFD]">
                <div className='flex flex-col px-4 pt-2 gap-y-2 fixed top-0 left-0 right-0 z-10 bg-[#FAFBFD] print:hidden'>
                    <Navbar data={document}/>
                    <Toolbar />
                </div>
                <div className='pt-[114px] print:pt-0'>
                    <Editor initialContent={document.initialContent} />
                </div>
            </div>
        </Room>
    )
}