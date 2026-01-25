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
    Route::get('/cellar-items/last', [CellarItemController::class, 'getLastAdded']);
    Route::get('/cellar-items/total-stock', [CellarItemController::class, 'getTotalStock']);
    Route::get('/cellar-items/stock-by-colour', [CellarItemController::class, 'getStockByColour']);
    Route::get('/cellar-items/{cellarItemId}', [CellarItemController::class, 'show']);
    Route::get('/cellar-items/colour/{colourId}', [CellarItemController::class, 'filterByColour']);
    Route::get('/cellar-items/region/{regionId}', [CellarItemController::class, 'filterByRegion']);
    Route::post('/cellar-items', [CellarItemController::class, 'store']);
    Route::put('/cellar-items/{cellarItem}', [CellarItemController::class, 'update']);
    Route::post('/cellar-items/{cellarItem}/increment', [CellarItemController::class, 'incrementStock']);
    Route::post('/cellar-items/{cellarItem}/decrement', [CellarItemController::class, 'decrementStock']);
    Route::delete('/cellar-items/{cellarItem}', [CellarItemController::class, 'destroy']);
});
