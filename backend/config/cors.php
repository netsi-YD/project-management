<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'https://project-management-mkay.vercel.app',
        'https://project-management-b7pojiyoo-netsis-projects-37c553c2.vercel.app',
    ],
    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

'supports_credentials' => true,
];
