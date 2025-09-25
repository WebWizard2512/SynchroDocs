"use client"

import React from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Doc } from '../../../convex/_generated/dataModel'
import {SiGoogledocs} from "react-icons/si"
import { BuildingIcon, CircleUserIcon } from 'lucide-react';
import {format} from "date-fns";
import DocumentMenu from './document-menu';
import { useRouter } from 'next/navigation';

interface DocumentRowProps{
    document: Doc<"documents">;
}
const DocumentRow = ({document}: DocumentRowProps) => {
    const router = useRouter();

  return (
    <TableRow 
    onClick = {() => router.push(`/documents/${document._id}`)}
    className='cursor-pointer'>
        <TableCell className='w-[50px]'>
            <SiGoogledocs className='size-6 fill-blue-500'/>
        </TableCell>
        <TableCell className='font-medium md:w-[45%]'>
            {document.title}
        </TableCell>
        <TableCell className='text-muted-foreground hidden md:flex items-center gap-2'>
            {document.organizationId ? <BuildingIcon className='size-4'/> : <CircleUserIcon className='size-4'/>}
            {document.organizationId ? "Organization" : "Personal"}
        </TableCell>
        <TableCell className='text-muted-foreground hidden md:table-cell'>
            {format(new Date(document._creationTime), "MMM dd, yyyy")}
        </TableCell>
        <DocumentMenu 
        documentId ={document._id}
        title={document.title}
        onNewTab = {() => window.open(`/documents/${document._id}`, "_blank")}/>
    </TableRow>
  )
}

export default DocumentRow

