<?php

// Roteador do `php artisan serve` (só dev). Igual ao do framework, mas serve
// apenas ARQUIVOS: public/tutoriais/ é uma pasta (assets) e sem isto a URL
// /tutoriais caía no servidor embutido do PHP com 404 em vez de ir ao Laravel.

$publicPath = getcwd();

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

if ($uri !== '/' && is_file($publicPath.$uri)) {
    return false;
}

require_once $publicPath.'/index.php';
