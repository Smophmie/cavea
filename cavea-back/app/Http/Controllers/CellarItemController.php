<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CellarItem;
use Illuminate\Support\Facades\Auth;
use App\Services\BottleService;
use App\Services\VintageService;
use Illuminate\Support\Facades\DB;

class CellarItemController extends Controller
{
    protected BottleService $bottleService;
    protected VintageService $vintageService;

    public function __construct(BottleService $bottleService, VintageService $vintageService)
    {
        $this->bottleService = $bottleService;
        $this->vintageService = $vintageService;
    }


    public function index()
    {
        return auth()->user()
            ->cellarItems()
            ->with(['bottle.colour', 'vintage'])
            ->get();
    }

    /**
     * Get the ten last added cellar items.
     */
    public function getLastAdded()
    {
        $userId = auth()->id();

        $items = CellarItem::with(['bottle.colour', 'vintage'])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->take(10)
            ->get();

        return response()->json($items);
    }

    /**
     * Get the stock of bottles.
     */
    public function getTotalStock()
    {
        $userId = auth()->id();

        $totalStock = CellarItem::where('user_id', $userId)
            ->sum('stock');

        return response()->json(['total_stock' => $totalStock]);
    }

    public function getStockByColour()
    {
        $userId = auth()->id();

        $stocks = CellarItem::join('bottles', 'cellar_items.bottle_id', '=', 'bottles.id')
            ->join('colours', 'bottles.colour_id', '=', 'colours.id')
            ->where('cellar_items.user_id', $userId)
            ->select('colours.name as colour', DB::raw('SUM(cellar_items.stock) as total'))
            ->groupBy('colours.name')
            ->orderBy('colours.name')
            ->get()
            ->map(function ($item) {
                return [
                    'colour' => $item->colour,
                    'stock'  => (int) $item->total,
                ];
            });

        return response()->json($stocks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
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

        $cellarItem = CellarItem::create([
            'user_id' => auth()->id(),
            'bottle_id' => $bottle->id,
            'vintage_id' => $vintage->id,
            'stock' => $validated['stock'],
            'rating' => $validated['rating'] ?? null,
            'price' => $validated['price'] ?? null,
            'shop' => $validated['shop'] ?? null,
            'offered_by' => $validated['offered_by'] ?? null,
            'drinking_window_start' => $validated['drinking_window_start'] ?? null,
            'drinking_window_end' => $validated['drinking_window_end'] ?? null,
        ]);

        return response()->json(
            $cellarItem->load(['bottle.colour', 'vintage']),
            201
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $cellarItem = CellarItem::with(['bottle.colour', 'vintage'])->find($id);

        if (! $cellarItem) {
            return response()->json(['error' => 'Elément inexistant'], 404);
        }

        if ($cellarItem->user_id !== auth()->id()) {
            return response()->json(['error' => 'Action non autorisée'], 403);
        }

        return response()->json($cellarItem);
    }

    public function filterByColour($colourId)
    {
        $userId = auth()->id();

        $cellarItems = CellarItem::with(['bottle.colour', 'vintage'])
            ->where('user_id', $userId)
            ->whereHas('bottle', function ($query) use ($colourId) {
                $query->where('colour_id', $colourId);
            })
            ->get();

        return response()->json($cellarItems);
    }

    public function incrementStock($id)
    {
        $item = CellarItem::where('user_id', auth()->id())->findOrFail($id);
        $item->increment('stock');

        return response()->json($item, 200);
    }

    public function decrementStock($id)
    {
        $item = CellarItem::where('user_id', auth()->id())->findOrFail($id);

        if ($item->stock > 0) {
            $item->decrement('stock');
        }

        return response()->json($item, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $cellarItem = CellarItem::find($id);

        if (!$cellarItem) {
            return response()->json([
                'message' => 'Elément inexistant'
            ], 404);
        }

        if ($cellarItem->user_id !== auth()->id()) {
            return response()->json([
                'message' => 'Action non autorisée'
            ], 403);
        }

        $validated = $request->validate([
            'stock' => 'integer|min:0',
            'rating' => 'nullable|numeric|min:0|max:5',
            'price' => 'nullable|numeric|min:0',
            'shop' => 'nullable|string|max:255',
            'offered_by' => 'nullable|string|max:255',
            'drinking_window_start' => 'nullable|integer|digits:4|min:1900|max:2100',
            'drinking_window_end'   => 'nullable|integer|digits:4|min:1900|max:2100|gte:drinking_window_start',
        ]);

        $cellarItem->update($validated);

        return response()->json($cellarItem, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $cellarItem = CellarItem::find($id);
        if ($cellarItem->user_id !== auth()->id()) {
            return response()->json(['error' => 'Action non autorisée'], 403);
        }

        $cellarItem->delete();

        return response()->json(null, 204);
    }
}
