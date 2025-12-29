<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Firebase Credentials
    |--------------------------------------------------------------------------
    |
    | Path to your Firebase service account credentials JSON file.
    | You can download this from Firebase Console > Project Settings > Service Accounts
    |
    */
    'credentials' => env('FIREBASE_CREDENTIALS', storage_path('firebase-credentials.json')),

    /*
    |--------------------------------------------------------------------------
    | Firebase Database URL
    |--------------------------------------------------------------------------
    |
    | Your Firebase Realtime Database URL.
    | Format: https://your-project-id.firebaseio.com
    |
    */
    'database_url' => env('FIREBASE_DATABASE_URL', ''),

    /*
    |--------------------------------------------------------------------------
    | Firebase Storage Bucket
    |--------------------------------------------------------------------------
    |
    | Your Firebase Storage bucket name.
    | Format: your-project-id.appspot.com
    |
    */
    'storage_bucket' => env('FIREBASE_STORAGE_BUCKET', ''),

    /*
    |--------------------------------------------------------------------------
    | Firebase Project ID
    |--------------------------------------------------------------------------
    |
    | Your Firebase Project ID from the Firebase Console.
    |
    */
    'project_id' => env('FIREBASE_PROJECT_ID', ''),

    /*
    |--------------------------------------------------------------------------
    | Firebase API Key
    |--------------------------------------------------------------------------
    |
    | Your Firebase Web API Key for client-side operations.
    | Found in Firebase Console > Project Settings > General
    |
    */
    'api_key' => env('FIREBASE_API_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Firebase Auth Domain
    |--------------------------------------------------------------------------
    |
    | Your Firebase Auth domain.
    | Format: your-project-id.firebaseapp.com
    |
    */
    'auth_domain' => env('FIREBASE_AUTH_DOMAIN', ''),
];
