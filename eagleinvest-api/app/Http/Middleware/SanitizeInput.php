<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeInput
{
    /**
     * Caracteres peligrosos a eliminar
     */
    protected $dangerousPatterns = [
        '/<script\b[^>]*>(.*?)<\/script>/is',
        '/<iframe\b[^>]*>(.*?)<\/iframe>/is',
        '/javascript:/i',
        '/on\w+\s*=/i',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->all();
        
        array_walk_recursive($input, function (&$value) use ($request) {
            if (is_string($value)) {
                // Eliminar scripts maliciosos
                foreach ($this->dangerousPatterns as $pattern) {
                    $value = preg_replace($pattern, '', $value);
                }
                
                // Limpiar espacios
                $value = trim($value);
                
                // Escapar caracteres especiales HTML (excepto en campos específicos)
                if (!in_array($request->route()->getName(), $this->excludedRoutes())) {
                    $value = htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                }
            }
        });

        $request->merge($input);

        return $next($request);
    }

    /**
     * Rutas excluidas de sanitización HTML (para contenido rico)
     */
    protected function excludedRoutes(): array
    {
        return [
            'admin.content.update',
            // Agregar más rutas si necesario
        ];
    }
}
