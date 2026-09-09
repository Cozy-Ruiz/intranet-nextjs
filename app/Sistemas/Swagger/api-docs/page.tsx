'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    SwaggerUIBundle: any;
  }
}

export default function SwaggerDocs() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.replace('/Sistemas/Swagger/login-swagger');
      return;
    }

    // Agregar CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/swagger-ui-dist/swagger-ui.css';
    document.head.appendChild(link);

    // Agregar Swagger JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js';
    script.async = true;
    script.onload = () => {
      window.SwaggerUIBundle({
        url: '/backend/swagger.json',
        dom_id: '#swagger-ui',
        presets: [window.SwaggerUIBundle.presets.apis],
        requestInterceptor: (req: any) => {
          req.headers.Authorization = `Bearer ${token}`;
          return req;
        },
      });
    };
    document.body.appendChild(script);
  }, [router]);

  const handleLogout = async () => {

    const refreshToken = localStorage.getItem('refreshToken');

    try {
      await fetch('/backend/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    } 

    // Limpiar tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    // Redirigir al login
    //router.replace('/Sistemas/Swagger/login-swagger');
    router.replace('/backend/api-docs');
  };

  return (
    <div>
      <div className="flex justify-end p-4 bg-gray-100">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </div>
      <div id="swagger-ui" className="min-h-screen bg-white" />
    </div>
  );
}