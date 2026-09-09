import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DetalleUsuario = dynamic(() => import('./DetalleUsuario'));

export default function Page() {
    return (
        <Suspense>
            <DetalleUsuario />
        </Suspense>
    );
}