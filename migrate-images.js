import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env
dotenv.config();

// Configuración de Supabase
const rawUrl = process.env.VITE_SUPABASE_URL || 'https://xqikzccsnzelpumevmxo.supabase.co';
const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

// NOTA DE SEGURIDAD SÉNIOR: Para tareas de scraping, mantenimiento o migraciones masivas de storage,
// es altamente recomendable usar la SERVICE_ROLE_KEY de Supabase para evitar restricciones de RLS (Row Level Security).
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxaWt6Y2NzbnplbHB1bWV2bXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzA5NzUsImV4cCI6MjA5MjQ0Njk3NX0.bTwBIxc6bxkw4XNiucH6xRIHlw_HWbLvBHnl88DCx-s';
const BUCKET_NAME = 'productos';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Función recursiva para listar todos los archivos de un bucket de Supabase
 */
async function getFilesRecursively(prefix = '') {
  const allFiles = [];

  async function traverse(currentPath) {
    console.log(`🔍 Escaneando carpeta del storage: ${currentPath || '/'}`);
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list(currentPath, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' }
    });

    if (error) {
      console.error(`❌ Error listando recursos en "${currentPath}":`, error.message);
      throw error;
    }

    if (!data) return;

    for (const item of data) {
      if (item.name === '.emptyFolderPlaceholder') continue;

      const relativePath = currentPath ? `${currentPath}/${item.name}` : item.name;

      // Un elemento es carpeta si no tiene un ID de metadata o id de sistema
      const isFolder = !item.id || !item.metadata;

      if (isFolder) {
        await traverse(relativePath);
      } else {
        allFiles.push({
          path: relativePath,
          size: item.metadata?.size || 0,
          mimeType: item.metadata?.mimetype || ''
        });
      }
    }
  }

  await traverse(prefix);
  return allFiles;
}

/**
 * Migra las imágenes del bucket de JPG/PNG a WebP de forma eficiente y segura
 */
async function runImageMigration() {
  console.log('🚀 Iniciando Migración de Imágenes Existentes a WebP...');
  console.log(`🔗 Conectado a Supabase en: ${SUPABASE_URL}\n`);

  try {
    // 1. Conseguir todos los archivos
    const files = await getFilesRecursively('');
    console.log(`\n📦 Total de archivos encontrados en el bucket "${BUCKET_NAME}": ${files.length}`);

    // Filtrar los que ya son .webp para que sea Idempotente
    const targetFiles = files.filter(file => {
      const ext = path.extname(file.path).toLowerCase();
      return ext !== '.webp' && file.mimeType !== 'image/webp';
    });

    console.log(`🎯 Archivos pendientes de optimización (JPG/PNG/JPEG): ${targetFiles.length}\n`);

    if (targetFiles.length === 0) {
      console.log('✨ ¡Todas las imágenes ya se encuentran optimizadas en formato WebP! Nada por migrar.');
      return;
    }

    let savedBytesTotal = 0;
    let processedCount = 0;

    for (let i = 0; i < targetFiles.length; i++) {
      const file = targetFiles[i];
      processedCount++;
      const percentProgress = ((processedCount / targetFiles.length) * 100).toFixed(1);
      
      console.log(`--------------------------------------------------`);
      console.log(`⏳ [${processedCount}/${targetFiles.length}] (${percentProgress}%) Procesando: "${file.path}"`);
      console.log(`📏 Tamaño original: ${(file.size / 1024 / 1024).toFixed(3)} MB`);

      try {
        // A. Descargar archivo actual
        const { data: blob, error: downloadError } = await supabase.storage
          .from(BUCKET_NAME)
          .download(file.path);

        if (downloadError) {
          console.error(`❌ Error descargando "${file.path}":`, downloadError.message);
          continue;
        }

        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // B. Comprimir con Sharp a WebP (max 1200px ancho, mantener aspect ratio, calidad: 82)
        const transformer = sharp(buffer);
        const metadata = await transformer.metadata();

        let webpBuffer;
        if (metadata.width && metadata.width > 1200) {
          webpBuffer = await transformer
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 82, lossless: false, smartSubsample: true })
            .toBuffer();
        } else {
          webpBuffer = await transformer
            .webp({ quality: 82, lossless: false, smartSubsample: true })
            .toBuffer();
        }

        const newSize = webpBuffer.length;
        const compressionRatio = (((file.size - newSize) / file.size) * 100).toFixed(1);
        savedBytesTotal += (file.size - newSize);

        console.log(`📉 Optimización: ${(newSize / 1024 / 1024).toFixed(3)} MB | Reducción: -${compressionRatio}%`);

        // C. Subir el nuevo archivo WebP
        const oldExt = path.extname(file.path);
        const newFilePath = file.path.slice(0, -oldExt.length) + '.webp';

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(newFilePath, webpBuffer, {
            contentType: 'image/webp',
            upsert: true
          });

        if (uploadError) {
          console.error(`❌ Error subiendo WebP de "${file.path}" a "${newFilePath}":`, uploadError.message);
          continue;
        }

        console.log(`📤 Subido exitosamente: "${newFilePath}"`);

        // D. Actualizar la base de datos (imagenes_producto)
        // Obtenemos los URLs públicos correspondientes
        const { data: { publicUrl: oldUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.path);
        const { data: { publicUrl: newUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(newFilePath);

        // Busqueda robusta: por URL exacto o usando un ILIKE con el path del archivo para prevenir discrepancias de HTTP/HTTPS/Custom Domain
        let { data: dbRecords, error: fetchError } = await supabase
          .from('imagenes_producto')
          .select('id, url')
          .eq('url', oldUrl);

        if (fetchError || !dbRecords || dbRecords.length === 0) {
          // Fallback con el sufijo de ruta relativo
          const { data: fallbackRecords } = await supabase
            .from('imagenes_producto')
            .select('id, url')
            .ilike('url', `%${file.path}`);
          if (fallbackRecords) {
            dbRecords = fallbackRecords;
          }
        }

        if (dbRecords && dbRecords.length > 0) {
          for (const rec of dbRecords) {
            const { error: patchError } = await supabase
              .from('imagenes_producto')
              .update({ url: newUrl })
              .eq('id', rec.id);

            if (patchError) {
              console.error(`❌ Error actualizando URL en tabla para ID ${rec.id}:`, patchError.message);
            } else {
              console.log(`✅ Referencia de DB seleccionada (ID ${rec.id}) apuntada ahora a la extensión .webp`);
            }
          }
        } else {
          console.log(`⚠️ No se encontró registro referencial en imagenes_producto para: ${file.path}`);
        }

        // E. Eliminar el archivo antiguo (remover JPG/PNG antiguo del storage)
        const { error: deleteError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([file.path]);

        if (deleteError) {
          console.error(`⚠️ Error al remover archivo original redundante del storage:`, deleteError.message);
        } else {
          console.log(`🗑️ Eliminado del Storage el archivo redundante original.`);
        }

        console.log(`✨ Procesamiento de "${file.path}" completado con éxito.`);

      } catch (err) {
        console.error(`💥 Error fatal procesando archivo "${file.path}":`, err);
      }
    }

    console.log(`\n==================================================`);
    console.log(`🏁 ¡MIGRACIÓN CONCLUIDA CON ÉXITO!`);
    console.log(`✅ Archivos procesados: ${processedCount}`);
    console.log(`💾 Espacio total de Egress y Storage liberado: ${(savedBytesTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`==================================================`);

  } catch (error) {
    console.error('❌ Error crítico recorriendo la migración:', error);
  }
}

runImageMigration();
