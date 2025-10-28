<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleDevPrefix
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Si l'URL commence par /dev, on le retire du path
        $uri = $request->getRequestUri();
        if (str_starts_with($uri, '/dev')) {
            $newUri = substr($uri, 4) ?: '/';
            $request->server->set('REQUEST_URI', $newUri);
        }
        
        return $next($request);
    }
}