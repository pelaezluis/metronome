// Script para validar variables de entorno desde .env
// Vite lee automáticamente el archivo .env, este script solo valida que esté configurado correctamente
// 
// Uso:
// npm run load-env

// Solo ejecutar si estamos en Node.js
if (typeof require !== 'undefined') {
    try {
        const fs = require('fs');
        const path = require('path');
        
        // Leer archivo .env
        const envPath = path.join(__dirname, '.env');
        
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const envVars = {};
            
            // Parsear archivo .env
            envContent.split('\n').forEach(line => {
                line = line.trim();
                if (line && !line.startsWith('#')) {
                    const [key, ...valueParts] = line.split('=');
                    if (key && valueParts.length > 0) {
                        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                        envVars[key.trim()] = value;
                    }
                }
            });
            
            // Validar que las variables requeridas estén presentes
            const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
            const missingVars = requiredVars.filter(varName => !envVars[varName] || envVars[varName].trim() === '');
            
            if (missingVars.length === 0) {
                console.log('✅ Archivo .env configurado correctamente');
                console.log('   VITE_SUPABASE_URL:', envVars.VITE_SUPABASE_URL ? '✓ Configurado' : '✗ Faltante');
                console.log('   VITE_SUPABASE_ANON_KEY:', envVars.VITE_SUPABASE_ANON_KEY ? '✓ Configurado' : '✗ Faltante');
            } else {
                console.warn('⚠️ Faltan las siguientes variables en .env:');
                missingVars.forEach(varName => {
                    console.warn(`   - ${varName}`);
                });
                console.warn('\nPor favor, completa estas variables en tu archivo .env');
            }
        } else {
            console.warn('⚠️ Archivo .env no encontrado.');
            console.warn('Por favor, crea un archivo .env en la raíz del proyecto con:');
            console.warn('   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co');
            console.warn('   VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui');
            console.warn('\nPuedes copiar env.example como base:');
            console.warn('   cp env.example .env');
        }
    } catch (error) {
        console.error('Error al validar .env:', error.message);
    }
} else {
    console.warn('Este script debe ejecutarse en Node.js');
}

