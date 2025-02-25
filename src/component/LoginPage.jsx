import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import bcrypt from "bcryptjs";
// eslint-disable-next-line react/prop-types
const LoginPage = ({setIsAdmin}) => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  

  const handleLogin = async (e) => {
    e.preventDefault();
    
    let {data,error} = await supabase
    .from('admin_users')
    .select('password')
    .single();
    if(error || !data){
      alert('Error obteniendo la contraseña:');
      return;
    }    
      // 2. Comparar la contraseña ingresada con la almacenada
    const match = await bcrypt.compare(password, data.password);
    if (match) {
      localStorage.setItem("isAdmin", "true");
      setIsAdmin(true);
      navigate("/");
    } else {
      alert("Contraseña incorrecta");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>
      <form onSubmit={handleLogin} className="bg-white shadow-md rounded-lg p-6">
        <input
          type="password"
          placeholder="Ingrese la contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded w-full mb-4"
          required
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded w-full">
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}

export default LoginPage