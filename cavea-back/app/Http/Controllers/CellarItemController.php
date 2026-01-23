<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CellarItem;
use App\Policies\CellarItemPolicy;
use Illuminate\Support\Facades\Auth;
use App\Services\BottleService;
use App\Services\VintageService;
use App\Services\CellarItemService;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class CellarItemController extends Controller
{
    public function __construct(
        protected BottleService $bottleService,
        protected VintageService $vintageService,
        protected CellarItemService $cellarItemService
    ) {
    }

    public function index(): JsonResponse
    {
        $items = $this->cellarItemService->getUserItems(auth()->id());
        return response()->json($items);
    }

    /**
     * Get the ten last added cellar items.
     */
    public function getLastAdded(): JsonResponse
    {
        $items = $this->cellarItemService->getLastAdded(auth()->id());
        return response()->json($items);
    }

    /**
     * Get the stock of bottles.
     */
    public function getTotalStock(): JsonResponse
    {
        $total = $this->cellarItemService->getTotalStock(auth()->id());
        return response()->json(['total_stock' => $total]);
    }

    public function getStockByColour(): JsonResponse
    {
        $stocks = $this->cellarItemService->getStockByColour(auth()->id());
        return response()->json($stocks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        Log::info('[CELLAR_ITEM_POST] Request received', [
            'user_id' => auth()->id(),
            'request_data' => $request->all(),
            'headers' => [
                'content-type' => $request->header('Content-Type'),
                'authorization' => $request->header('Authorization') ? 'Bearer ***' : null,
            ],
        ]);

        try {
            $validated = $request->validate([
                'bottle.name' => 'required|string|max:255',
                'bottle.domain' => 'nullable|string|max:255',
                'bottle.PDO' => 'nullable|string|max:255',
                'bottle.colour_id' => 'required|exists:colours,id',
                'vintage.year' => 'required|integer|digits:4|min:1900|max:2100',
                'stock' => 'required|integer|min:0',
                'rating' => 'nullable|numeric|min:0|max:5',
                'price' => 'nullable|numeric|min:0',
                'shop' => 'nullable|string|max:255',
                'offered_by' => 'nullable|string|max:255',
                'drinking_window_start' => 'nullable|integer|digits:4|min:1900|max:2100',
                'drinking_window_end' => 'nullable|integer|digits:4|min:1900|max:2100|gte:drinking_window_start',
            ]);

            Log::info('[CELLAR_ITEM_POST] Validation successful', [
                'user_id' => auth()->id(),
                'validated_data' => $validated,
            ]);
        } catch (ValidationException $e) {
            Log::error('[CELLAR_ITEM_POST] Validation failed', [
                'user_id' => auth()->id(),
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Les données fournies ne sont pas valides',
                'errors' => $e->errors(),
            ], 422);
        }

        try {
            Log::info('[CELLAR_ITEM_POST] Finding or creating bottle', [
                'user_id' => auth()->id(),
                'bottle_data' => $validated['bottle'],
            ]);

            $bottle = $this->bottleService->findOrCreate($validated['bottle']);

            Log::info('[CELLAR_ITEM_POST] Bottle created/found', [
                'user_id' => auth()->id(),
                'bottle_id' => $bottle->id,
                'bottle_name' => $bottle->name,
            ]);

            Log::info('[CELLAR_ITEM_POST] Finding or creating vintage', [
                'user_id' => auth()->id(),
                'vintage_data' => $validated['vintage'],
            ]);

            $vintage = $this->vintageService->findOrCreate($validated['vintage']);

            Log::info('[CELLAR_ITEM_POST] Vintage created/found', [
                'user_id' => auth()->id(),
                'vintage_id' => $vintage->id,
                'vintage_year' => $vintage->year,
            ]);

            Log::info('[CELLAR_ITEM_POST] Creating cellar item', [
                'user_id' => auth()->id(),
                'bottle_id' => $bottle->id,
                'vintage_id' => $vintage->id,
                'stock' => $validated['stock'],
            ]);

            $cellarItem = $this->cellarItemService->create([
                'bottle_id' => $bottle->id,
                'vintage_id' => $vintage->id,
                ...$validated
            ], auth()->id());

            Log::info('[CELLAR_ITEM_POST] Cellar item created successfully', [
                'user_id' => auth()->id(),
                'cellar_item_id' => $cellarItem->id,
                'bottle_name' => $cellarItem->bottle->name,
                'vintage_year' => $cellarItem->vintage->year,
                'stock' => $cellarItem->stock,
            ]);

            return response()->json($cellarItem, 201);
        } catch (\Exception $e) {
            Log::error('[CELLAR_ITEM_POST] Error creating cellar item', [
                'user_id' => auth()->id(),
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'validated_data' => $validated ?? null,
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la création de l\'article',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(CellarItem $cellarItem): JsonResponse
    {
        $this->authorize('view', $cellarItem);
        //
        $cellarItem->load(['bottle.colour', 'vintage']);
        return response()->json($cellarItem);
    }

    public function filterByColour(int $colourId): JsonResponse
    {
        $items = $this->cellarItemService->filterByColour(auth()->id(), $colourId);
        return response()->json($items);
    }

    public function incrementStock(CellarItem $cellarItem): JsonResponse
    {
        $this->authorize('update', $cellarItem);

        $item = $this->cellarItemService->incrementStock($cellarItem);
        return response()->json($item);
    }

    public function decrementStock(CellarItem $cellarItem): JsonResponse
    {
        $this->authorize('update', $cellarItem);

        $item = $this->cellarItemService->decrementStock($cellarItem);
        return response()->json($item);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CellarItem $cellarItem): JsonResponse
    {
        $this->authorize('update', $cellarItem);

        $validated = $request->validate([
            'stock' => 'integer|min:0',
            'rating' => 'nullable|numeric|min:0|max:5',
            'price' => 'nullable|numeric|min:0',
            'shop' => 'nullable|string|max:255',
            'offered_by' => 'nullable|string|max:255',
            'drinking_window_start' => 'nullable|integer|digits:4|min:1900|max:2100',
            'drinking_window_end' => 'nullable|integer|digits:4|min:1900|max:2100|gte:drinking_window_start',
        ]);

        $item = $this->cellarItemService->update($cellarItem, $validated);
        return response()->json($item);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CellarItem $cellarItem): JsonResponse
    {
        $this->authorize('delete', $cellarItem);

        $this->cellarItemService->delete($cellarItem);
        return response()->json(null, 204);
    }
}
