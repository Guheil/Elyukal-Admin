'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface LoadSuccessProps {
    numPages: number;
}

export default function DocumentViewerPage() {
    const params = useParams();
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.2);
    const [rotation, setRotation] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const documentUrl = decodeURIComponent(params.id as string);
    const isPDF = documentUrl.toLowerCase().endsWith('.pdf');
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
            setContainerHeight(containerRef.current.offsetHeight);
        }

        const handleResize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
                setContainerHeight(containerRef.current.offsetHeight);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function onDocumentLoadSuccess({ numPages }: LoadSuccessProps) {
        setNumPages(numPages);
        setIsLoading(false);
    }

    const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.2, 3));
    const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.6));
    const resetZoom = () => setScale(1.2);
    const rotate = () => setRotation(prevRotation => (prevRotation + 90) % 360);

    const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
    const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));

    const headerStyle = {
        background: `linear-gradient(90deg, ${COLORS.gradient.start} 0%, ${COLORS.gradient.middle} 50%, ${COLORS.gradient.end} 100%)`,
        fontFamily: FONTS.semibold,
    };

    return (
        <div className="flex flex-col min-h-screen" style={{ background: COLORS.container, fontFamily: FONTS.regular }}>
            <header className="shadow-md p-4" style={headerStyle}>
                <div className="container mx-auto flex items-center">
                    <Button
                        onClick={() => window.history.back()}
                        variant="ghost"
                        className="flex items-center hover:bg-white/20 mr-4"
                        style={{ color: COLORS.white }}
                    >
                        <ArrowLeft className="mr-2" size={20} />
                        Back
                    </Button>
                    <h1 className="text-xl" style={{ fontFamily: FONTS.bold, color: COLORS.white }}>Document Viewer</h1>
                </div>
            </header>

            <main className="flex-grow container mx-auto p-4 md:p-6">
                <div className="rounded-lg shadow-lg p-4 md:p-6" style={{ background: COLORS.white }}>
                    {/* Document viewer tools */}
                    <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={zoomIn}
                                variant="outline"
                                className="flex items-center border-2 hover:bg-primary/10"
                                style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                            >
                                <ZoomIn size={18} className="mr-1" /> Zoom In
                            </Button>
                            <Button
                                onClick={zoomOut}
                                variant="outline"
                                className="flex items-center border-2 hover:bg-primary/10"
                                style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                            >
                                <ZoomOut size={18} className="mr-1" /> Zoom Out
                            </Button>
                            <Button
                                onClick={resetZoom}
                                variant="outline"
                                className="flex items-center border-2 hover:bg-primary/10"
                                style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                            >
                                <RotateCcw size={18} className="mr-1" /> Reset
                            </Button>
                            <Button
                                onClick={rotate}
                                variant="outline"
                                className="flex items-center border-2 hover:bg-primary/10"
                                style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                            >
                                Rotate
                            </Button>
                        </div>

                        {isPDF && numPages > 0 && (
                            <div className="flex items-center space-x-2 px-4 py-2 rounded-full" style={{ background: COLORS.lightgray }}>
                                <Button
                                    onClick={goToPrevPage}
                                    disabled={pageNumber <= 1}
                                    className="w-8 h-8 rounded-full p-0 flex items-center justify-center"
                                    style={{
                                        background: pageNumber <= 1 ? COLORS.lightgray : COLORS.primary,
                                        color: pageNumber <= 1 ? COLORS.gray : COLORS.white
                                    }}
                                >
                                    <ChevronLeft size={18} />
                                </Button>
                                <span className="text-sm font-medium mx-2" style={{ color: COLORS.gray }}>
                                    Page {pageNumber} of {numPages}
                                </span>
                                <Button
                                    onClick={goToNextPage}
                                    disabled={pageNumber >= numPages}
                                    className="w-8 h-8 rounded-full p-0 flex items-center justify-center"
                                    style={{
                                        background: pageNumber >= numPages ? COLORS.lightgray : COLORS.primary,
                                        color: pageNumber >= numPages ? COLORS.gray : COLORS.white
                                    }}
                                >
                                    <ChevronRight size={18} />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Document display area */}
                    <div
                        ref={containerRef}
                        className="overflow-auto rounded-lg p-2 flex justify-center"
                        style={{
                            background: COLORS.lightgray,
                            height: "calc(100vh - 240px)",
                            minHeight: "500px",
                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
                        }}
                    >
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-full w-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.primary }}></div>
                                <p className="mt-4" style={{ color: COLORS.gray, fontFamily: FONTS.semibold }}>Loading document...</p>
                            </div>
                        )}

                        {isPDF ? (
                            <Document
                                file={documentUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={() => {
                                    setIsLoading(false);
                                    console.error("Error loading PDF document");
                                }}
                                loading={null}
                                error={
                                    <div className="flex flex-col items-center justify-center h-full w-full p-8">
                                        <FileText size={48} style={{ color: COLORS.error }} />
                                        <p className="mt-4 text-center" style={{ color: COLORS.error, fontFamily: FONTS.semibold }}>
                                            Failed to load PDF document
                                        </p>
                                        <Button
                                            className="mt-4"
                                            style={{ background: COLORS.error, color: COLORS.white }}
                                            onClick={() => window.location.reload()}
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                }
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    scale={scale}
                                    rotate={rotation}
                                    width={containerWidth > 0 ? containerWidth * 0.8 : undefined}
                                    height={containerHeight > 0 ? containerHeight * 0.8 : undefined}
                                    loading={null}
                                    className="shadow-lg"
                                    error={
                                        <div className="flex items-center justify-center p-4">
                                            <p style={{ color: COLORS.error, fontFamily: FONTS.regular }}>Error loading page</p>
                                        </div>
                                    }
                                    renderAnnotationLayer={true}
                                    renderTextLayer={true}
                                />
                            </Document>
                        ) : (
                            <div className="flex items-center justify-center h-full w-full">
                                <img
                                    src={documentUrl}
                                    alt="Document"
                                    style={{
                                        maxWidth: '90%',
                                        maxHeight: '90%',
                                        transform: `scale(${scale}) rotate(${rotation}deg)`,
                                        transition: 'transform 0.2s ease',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    }}
                                    onLoad={() => setIsLoading(false)}
                                    onError={() => {
                                        setIsLoading(false);
                                        console.error("Error loading image document");
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Document info */}
                    <div className="mt-4 text-sm px-4 py-3 rounded-md" style={{ background: COLORS.lightgray, color: COLORS.gray }}>
                        <div className="flex items-center justify-between">
                            <span>
                                <strong>File:</strong> {documentUrl.split('/').pop()}
                            </span>
                            <span>
                                <strong>Type:</strong> {isPDF ? 'PDF Document' : 'Image'}
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="shadow-inner p-4" style={{ background: COLORS.white}}>
                <div className="container mx-auto text-center text-sm" style={{ color: COLORS.gray }}>
                    <p><span className="font-bold">Tip:</span> Use mouse wheel + Ctrl to zoom in and out • Click and drag to pan</p>
                </div>
            </footer>
        </div>
    );
}