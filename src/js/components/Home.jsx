import React, { useState, useEffect } from 'react';
import { Trash2, Plus, X } from 'lucide-react';

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userCreated, setUserCreated] = useState(false);
  
  const username = 'Rauldantaaa'; 
  const API_BASE = 'https://playground.4geeks.com/todo';

  // Función para crear usuario
  const createUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok || response.status === 201) {
        setUserCreated(true);
        setError('');
        return true;
      } else if (response.status === 400) {
        
        setUserCreated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creando usuario:', error);
      setError('Error creando usuario');
      return false;
    }
  };

  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/users/${username}`);
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.todos || []);
        setError('');
      } else if (response.status === 404) {
        // Usuario no existe, intentar crearlo
        const userCreated = await createUser();
        if (userCreated) {
          setTasks([]);
        }
      } else {
        throw new Error('Error obteniendo tareas');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error cargando las tareas');
    } finally {
      setLoading(false);
    }
  };

  
  const addTask = async () => {
    if (!newTask.trim()) return;
    
    const task = {
      label: newTask.trim(),
      is_done: false
    };

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/todos/${username}`, {
        method: 'POST',
        body: JSON.stringify(task),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Tarea agregada:', data);
        setNewTask('');
        setError('');
       
        await fetchTasks();
      } else {
        throw new Error('Error agregando tarea');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error agregando la tarea');
    } finally {
      setLoading(false);
    }
  };

 
  const deleteTask = async (taskId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/todos/${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setError('');
        
        await fetchTasks();
      } else {
        throw new Error('Error eliminando tarea');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error eliminando la tarea');
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar todas las tareas
  const clearAllTasks = async () => {
    try {
      setLoading(true);
      
      
      const deletePromises = tasks.map(task => 
        fetch(`${API_BASE}/todos/${task.id}`, {
          method: 'DELETE'
        })
      );
      
      await Promise.all(deletePromises);
      
      setError('');
      
      await fetchTasks();
    } catch (error) {
      console.error('Error:', error);
      setError('Error limpiando las tareas');
    } finally {
      setLoading(false);
    }
  };



  
  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        
      </h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

     
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Agregar nueva tarea..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <button
            onClick={addTask}
            disabled={loading || !newTask.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={18} />
            {loading ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </div>

      
      {tasks.length > 0 && (
        <div className="mb-4">
          <button
            onClick={clearAllTasks}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            {loading ? 'Limpiando...' : 'Limpiar todas las tareas'}
          </button>
        </div>
      )}

      
      <div className="space-y-2">
        {loading && tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Cargando tareas...
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay tareas. ¡Agrega una nueva!
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
            >
              <span className="flex-1 text-gray-800">
                {task.label}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                disabled={loading}
                className="ml-2 p-1 text-red-500 hover:text-red-700 disabled:text-gray-400"
                title="Eliminar tarea"
              >
                <X size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      
      {tasks.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          {tasks.length} tarea{tasks.length !== 1 ? 's' : ''} en total
        </div>
      )}

      
      <div className="mt-4 text-center text-xs text-gray-500">
        Usuario: {username}
      </div>
    </div>
  );
};

export default TodoList;