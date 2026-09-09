'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginSwagger() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/backend/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usuario, password: password }),
      });

      const data = await res.json();

      if (data.token) {
        // ✅ Guardar el token en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);

        // ✅ Redirigir SIN mostrar token en la URL
        router.push('/Sistemas/Swagger/api-docs');
      } else {
        setError(data.message || 'Credenciales incorrectas');
      }
    } catch {
      setError('Error al conectar con el servidor');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-40 text-center space-y-4">
      <h2 className="text-xl font-semibold">Acceso a la documentación API</h2>
      <form onSubmit={handleLogin} className="space-y-2">
        <input
          className="w-full p-2 border rounded"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Entrar
        </button>
      </form>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}