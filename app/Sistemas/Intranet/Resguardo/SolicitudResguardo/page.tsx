import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const SolicitudResguardo = dynamic(() => import('./SolicitudResguardo'));

export default function Page() {
    return (
        <Suspense>
            <SolicitudResguardo />
        </Suspense>
    );
}