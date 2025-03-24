declare namespace JSX {
    interface IntrinsicElements {
        'model-viewer': ModelViewerJSX;
    }
}

interface ModelViewerJSX extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
    src: string;
    alt?: string;
    poster?: string;
    'auto-rotate'?: boolean | string;
    'camera-controls'?: boolean | string;
    ar?: boolean | string;
    'shadow-intensity'?: string;
    style?: React.CSSProperties;
    'animation-name'?: string;
    'camera-orbit'?: string;
    'environment-image'?: string;
    exposure?: string;
    'field-of-view'?: string;
    'interaction-prompt'?: string;
    loading?: 'auto' | 'lazy' | 'eager';
    'min-camera-orbit'?: string;
    'max-camera-orbit'?: string;
    'min-field-of-view'?: string;
    'max-field-of-view'?: string;
    'orbit-sensitivity'?: string;
    'rotation-per-second'?: string;
    'shadow-softness'?: string;
    'skybox-image'?: string;
    children?: React.ReactNode;
    className?: string;
    id?: string;
}