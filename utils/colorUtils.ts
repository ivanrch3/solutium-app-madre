// Convierte valores RGB a formato Hexadecimal (#RRGGBB)
const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Extrae una paleta de colores dominante de una URL de imagen.
 * @param imageSrc La URL de la imagen (debe permitir CORS o ser local).
 * @returns Una promesa que resuelve a un array de strings hexadecimales (ej: ['#ff0000', '#00ff00']).
 */
export const extractPaletteFromImage = (imageSrc: string): Promise<string[]> => {
    return new Promise((resolve) => {
        const img = new Image();
        // Importante: Permite cargar imágenes de otros dominios si tienen cabeceras CORS configuradas
        img.crossOrigin = "Anonymous"; 

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve([]);
            
            // Reducimos la imagen para procesar menos píxeles y ganar velocidad
            const MAX_SIZE = 50; 
            canvas.width = MAX_SIZE;
            canvas.height = MAX_SIZE;
            ctx.drawImage(img, 0, 0, MAX_SIZE, MAX_SIZE);
            
            try {
                const imageData = ctx.getImageData(0, 0, MAX_SIZE, MAX_SIZE).data;
                const colorCounts: Record<string, number> = {};
                
                // Recorremos los píxeles (cada 4 valores: R, G, B, Alpha)
                for (let i = 0; i < imageData.length; i += 4) {
                    const r = imageData[i];
                    const g = imageData[i + 1];
                    const b = imageData[i + 2];
                    const a = imageData[i + 3];
                    
                    // 1. Ignorar píxeles transparentes
                    if (a < 128) continue; 
                    
                    // 2. Ignorar blancos o casi blancos (fondos)
                    if (r > 245 && g > 245 && b > 245) continue;
                    
                    // 3. Ignorar negros o casi negros (textos/bordes)
                    if (r < 20 && g < 20 && b < 20) continue; 
                    
                    // Agrupamos colores similares redondeando a múltiplos de 20 para evitar duplicados cercanos
                    const round = (n: number) => Math.round(n / 20) * 20;
                    const key = `${round(r)},${round(g)},${round(b)}`;
                    
                    colorCounts[key] = (colorCounts[key] || 0) + 1;
                }
                
                // Ordenamos por frecuencia (los más usados primero)
                const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
                
                // Tomamos los top 3 y los convertimos a Hex
                const colors = sorted.slice(0, 3).map(([key]) => {
                    const [r, g, b] = key.split(',').map(Number);
                    return rgbToHex(r, g, b);
                });
                
                resolve(colors);
            } catch (e) {
                // Canvas security error (CORS) triggers fallback silently
                resolve([]);
            }
        };

        img.onerror = () => {
            // Error de carga o bloqueo CORS estricto. 
            // Resolvemos con array vacío para que el componente use el fallback de hash.
            console.warn("Extracción de color: No se pudo acceder a los datos de la imagen (posible restricción CORS). Usando fallback.");
            resolve([]);
        };

        // Definir src al final para asegurar que los handlers estén listos
        img.src = imageSrc;
    });
};