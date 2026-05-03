<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Models\WishlistItem;
use App\Services\WishlistService;
use App\Services\BottleService;
use App\Services\VintageService;
use App\Services\DomainService;
use App\Services\AppellationService;

class WishlistController extends Controller
{
    public function __construct(
        protected WishlistService $wishlistService,
        protected BottleService $bottleService,
        protected VintageService $vintageService,
        protected DomainService $domainService,
        protected AppellationService $appellationService,
    ) {
    }

    public function index(): JsonResponse
    {
        $items = $this->wishlistService->getUserItems(auth()->id());
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'bottle.name'              => 'required|string|max:255',
                'bottle.domain_name'       => 'required|string|max:255',
                'bottle.colour_id'         => 'required|exists:colours,id',
                'bottle.region_id'         => 'required|exists:regions,id',
                'bottle.grape_variety_ids'   => 'nullable|array',
                'bottle.grape_variety_ids.*' => 'exists:grape_varieties,id',
                'vintage.year'             => 'required|integer|digits:4|min:1901|max:2026',
                'appellation_name'         => 'nullable|string|max:255',
            ]);
        } catch (ValidationException $e) {
            Log::error('[WISHLIST_ITEM_POST] Validation failed', [
                'user_id' => auth()->id(),
                'errors'  => $e->errors(),
            ]);

            return response()->json([
                'message' => 'Les données fournies ne sont pas valides',
                'errors'  => $e->errors(),
            ], 422);
        }

        try {
            $domain = $this->domainService->findOrCreate([
                'name' => $validated['bottle']['domain_name'],
            ]);

            $appellation = null;
            if (!empty($validated['appellation_name'])) {
                $appellation = $this->appellationService->findOrCreate([
                    'name' => $validated['appellation_name'],
                ]);
            }

            $bottle = $this->bottleService->findOrCreate([
                'name'              => $validated['bottle']['name'],
                'domain_id'         => $domain->id,
                'colour_id'         => $validated['bottle']['colour_id'],
                'region_id'         => $validated['bottle']['region_id'],
                'grape_variety_ids' => $validated['bottle']['grape_variety_ids'] ?? [],
            ]);

            $vintage = $this->vintageService->findOrCreate($validated['vintage']);

            $wishlistItem = $this->wishlistService->create([
                'bottle_id'      => $bottle->id,
                'vintage_id'     => $vintage->id,
                'appellation_id' => $appellation?->id,
            ], auth()->id());

            return response()->json($wishlistItem, 201);
        } catch (\Exception $e) {
            Log::error('[WISHLIST_ITEM_POST] Error creating wishlist item', [
                'user_id'       => auth()->id(),
                'error_message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de l\'ajout à la liste de souhaits.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        $wishlistItem = $this->wishlistService->findByIdAndUser($id, auth()->id());

        if (!$wishlistItem) {
            return response()->json(['message' => 'Élément non trouvé'], 404);
        }

        return response()->json($wishlistItem);
    }

    public function destroy(WishlistItem $wishlistItem): JsonResponse
    {
        $this->authorize('delete', $wishlistItem);

        $this->wishlistService->delete($wishlistItem);
        return response()->json(null, 204);
    }
}
