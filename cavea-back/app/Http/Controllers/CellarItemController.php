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

        $bottle = $this->bottleService->findOrCreate($validated['bottle']);
        $vintage = $this->vintageService->findOrCreate($validated['vintage']);

        $cellarItem = $this->cellarItemService->create([
            'bottle_id' => $bottle->id,
            'vintage_id' => $vintage->id,
            ...$validated
        ], auth()->id());

        return response()->json($cellarItem, 201);
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
