<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CellarItemController;

Route::post('/register', [UserController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/cellar-items', [CellarItemController::class, 'index']);
    Route::get('/cellar-items/{id}', [CellarItemController::class, 'show']);
    Route::post('/cellar-items', [CellarItemController::class, 'store']);
    Route::put('/cellar-items/{id}', [CellarItemController::class, 'update']);
    Route::post('/cellar-items/{id}/increment', [CellarItemController::class, 'incrementStock']);
    Route::post('/cellar-items/{id}/decrement', [CellarItemController::class, 'decrementStock']);
    Route::delete('/cellar-items/{id}', [CellarItemController::class, 'destroy']);
});