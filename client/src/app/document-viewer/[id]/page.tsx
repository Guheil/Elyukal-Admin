'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { COLORS } from '../../constants/colors';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function DocumentViewerPage() {
    const params = useParams();
    const [numPages, setNumPages] = useState<number>(0);
    const documentUrl = decodeURIComponent(params.id as string);
    const isPDF = documentUrl.toLowerCase().endsWith('.pdf');

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-6xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft className="mr-2" size={20} />
                    Back
                </Button>

                <div className="bg-white rounded-lg shadow-lg p-4 h-[80vh] overflow-auto">
                    {isPDF ? (
                        <Document
                            file={documentUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="flex flex-col items-center"
                        >
                            {Array.from(new Array(numPages), (el, index) => (
                                <Page 
                                    key={`page_${index + 1}`} 
                                    pageNumber={index + 1} 
                                    className="mb-4"
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            ))}
                        </Document>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <img
                                src={documentUrl}
                                alt="Document"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

