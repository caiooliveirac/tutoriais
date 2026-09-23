<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // Geocodificação de endereços (tela do TARM). Política do OSM: até 1 req/s,
    // User-Agent identificável; resultados ficam em cache.
    'nominatim' => [
        'url' => env('NOMINATIM_URL', 'https://nominatim.openstreetmap.org'),
        'user_agent' => env('NOMINATIM_USER_AGENT', 'samu-mais/1.0 (+https://mnrs.com.br/tutoriais)'),
    ],

    // Tempo de deslocamento por rua. O servidor público do OSRM é só para
    // demonstração; produção deve apontar para um OSRM próprio (ver docs/API.md).
    'osrm' => [
        'url' => env('OSRM_URL', 'https://router.project-osrm.org'),
    ],

    // Token das integrações que enviam posição das unidades (AVL/GPS).
    'rastreamento' => [
        'token' => env('RASTREAMENTO_TOKEN'),
    ],

];
