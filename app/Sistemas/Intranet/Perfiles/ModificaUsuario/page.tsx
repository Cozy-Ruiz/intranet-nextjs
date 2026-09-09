import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ModificaUsuario = dynamic(() => import('./ModificaUsuario'));

export default function Page() {
    return (
        <Suspense>
            <ModificaUsuario />
        </Suspense>
    );
}