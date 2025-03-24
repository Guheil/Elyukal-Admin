'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box } from 'lucide-react';

// No inline type declarations - they're now in custom-types.d.ts

interface ModelViewerProps {
    src: string | File;
    alt?: string;
    poster?: string;
    className?: string;
    style?: React.CSSProperties;
}

export function ModelViewer({ src, alt = 'A 3D model', poster, className, style }: ModelViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        // Dynamically import the model-viewer web component
        import('@google/model-viewer');
    }, []);
    
    useEffect(() => {
        // If src is a File object, create an object URL
        if (src instanceof File) {
            const url = URL.createObjectURL(src);
            setObjectUrl(url);
            
            // Clean up the object URL when component unmounts or src changes
            return () => {
                URL.revokeObjectURL(url);
                setObjectUrl(null);
            };
        } else {
            setObjectUrl(null);
        }
    }, [src]);

    if (!src) {
        return (
            <div
                className={`flex flex-col items-center justify-center border rounded-lg p-4 bg-gray-50 ${className || ''}`}
                style={style}
            >
                <Box className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No 3D model available</p>
            </div>
        );
    }

    // Determine the source URL - either the objectUrl (for File objects) or the src string
    const sourceUrl = objectUrl || (typeof src === 'string' ? src : '');
    
    return (
        <div ref={containerRef} className={className} style={style}>
            {/* @ts-ignore */}
            <model-viewer
                src={sourceUrl}
                alt={alt}
                poster={poster}
                auto-rotate
                camera-controls
                ar
                shadow-intensity="1"
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
}