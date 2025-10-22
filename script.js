// Lista de Tareas con API Backend
let tareasPorHacer = []; 
let tareasTerminadas = []; 

// Configuración de la API - CAMBIAR ESTA URL cuando despliegues en Render
const API_URL = 'https://tareas.materiamental.cl/api/tasks';

// Cargar tareas desde el backend
async function cargarTareas() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al cargar tareas');
        
        const todasLasTareas = await response.json();
        
        // Separar tareas completadas y pendientes
        tareasPorHacer = todasLasTareas.filter(tarea => !tarea.completed);
        tareasTerminadas = todasLasTareas.filter(tarea => tarea.completed);
        
        mostrarTareas();
        actualizarContadores();
    } catch (error) {
        console.error('Error cargando tareas:', error);
        alert('No se pudieron cargar las tareas. Verifica tu conexión.');
    }
}

// Agregar una tarea nueva
async function agregarTarea() {
    const textarea = document.querySelector('textarea[name="ingresartarea"]');
    const textoTarea = textarea.value.trim();
    
    // Validación
    if (textoTarea === '') {
        alert('Por favor escribe una tarea antes de agregar');
        return; 
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: textoTarea,
                completed: false
            })
        });
        
        if (!response.ok) throw new Error('Error al agregar tarea');
        
        // Limpiar formulario
        textarea.value = '';
        
        // Recargar tareas desde el servidor
        await cargarTareas();
    } catch (error) {
        console.error('Error agregando tarea:', error);
        alert('No se pudo agregar la tarea. Intenta de nuevo.');
    }
}

// Eliminar una tarea
async function eliminarTarea(id, esCompletada) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar tarea');
        
        // Recargar tareas desde el servidor
        await cargarTareas();
    } catch (error) {
        console.error('Error eliminando tarea:', error);
        alert('No se pudo eliminar la tarea. Intenta de nuevo.');
    }
}

// Marcar una tarea como completada o pendiente
async function toggleTarea(id, esCompletada) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                completed: !esCompletada
            })
        });
        
        if (!response.ok) throw new Error('Error al actualizar tarea');
        
        // Recargar tareas desde el servidor
        await cargarTareas();
    } catch (error) {
        console.error('Error actualizando tarea:', error);
        alert('No se pudo actualizar la tarea. Intenta de nuevo.');
    }
}

// Mostrar todas las tareas
function mostrarTareas() {
    mostrarTareasPorHacer();
    mostrarTareasTerminadas();
}

// Mostrar pendientes
function mostrarTareasPorHacer() {
    const lista = document.querySelector('#porhacer ul');
    lista.innerHTML = '';
    
    tareasPorHacer.forEach((tarea, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="tarea">
                <p class="tareaID">${index + 1}.</p>
                <p class="tareaNombre">${tarea.text}</p>
            </div>
            <div class="opciones">
                <button onclick="eliminarTarea('${tarea.id}', false)">Eliminar</button>
                <input type="checkbox" onchange="toggleTarea('${tarea.id}', false)">
            </div>
        `;
        lista.appendChild(li);
    });
    
    if (tareasPorHacer.length === 0) {
        lista.innerHTML = '<li>¡Todo listo!</li>';
    }
}

// Mostrar completadas
function mostrarTareasTerminadas() {
    const lista = document.querySelector('#terminadas ul');
    lista.innerHTML = '';

    tareasTerminadas.forEach((tarea, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="tarea">
                <p class="tareaID">${index + 1}.</p>
                <p class="tareaNombre" style="text-decoration: line-through;">${tarea.text}</p>
            </div>
            <div class="opciones">
                <button onclick="eliminarTarea('${tarea.id}', true)">Eliminar</button>
                <input type="checkbox" checked onchange="toggleTarea('${tarea.id}', true)">
            </div>
        `;
        lista.appendChild(li);
    });
    
    if (tareasTerminadas.length === 0) {
        lista.innerHTML = '<li>Ni una papa pelá.</li>';
    }
}

// Actualizar números de los títulos
function actualizarContadores() {
    const tituloPorHacer = document.querySelector('#porhacer h1');
    tituloPorHacer.textContent = `Tengo (${tareasPorHacer.length}) tareas por hacer`;
    
    const tituloTerminadas = document.querySelector('#terminadas h1');
    tituloTerminadas.textContent = `Ya terminé (${tareasTerminadas.length}) tareas`;
}

// Actualizar fecha
function actualizarFecha() {
    const ahora = new Date();
    const fechaTexto = ahora.toLocaleDateString('es-ES');
    const hora = ahora.toLocaleTimeString('es-ES');
    
    const header = document.querySelector('header h2');
    header.textContent = `Hoy es ${fechaTexto} y son las ${hora}`;
}

// Función para exportar tareas (opcional)
async function exportarTareas() {
    try {
        const response = await fetch(API_URL);
        const todasLasTareas = await response.json();
        
        const datos = {
            tareasPorHacer: todasLasTareas.filter(t => !t.completed),
            tareasTerminadas: todasLasTareas.filter(t => t.completed),
            fechaExportacion: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(datos, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'mis-tareas.json';
        link.click();
    } catch (error) {
        console.error('Error exportando tareas:', error);
        alert('No se pudieron exportar las tareas.');
    }
}

// Eventos
document.addEventListener('DOMContentLoaded', function() {
    // Cargar tareas desde el backend al inicio
    cargarTareas();
    
    actualizarFecha();
    
    const formulario = document.querySelector('form');
    formulario.addEventListener('submit', function(evento) {
        evento.preventDefault();
        agregarTarea();
    });
    
    const botonLimpiar = document.querySelector('button[type="reset"]');
    botonLimpiar.addEventListener('click', function() {
        document.querySelector('textarea[name="ingresartarea"]').value = '';
    });
});