<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Domain;
use App\Services\DomainService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DomainServiceTest extends TestCase
{
    use RefreshDatabase;

    protected DomainService $domainService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->domainService = new DomainService();
    }

    public function testFindOrCreateCreatesNewDomain()
    {
        $data = ['name' => 'Domaine Romanée-Conti'];

        $domain = $this->domainService->findOrCreate($data);

        $this->assertDatabaseHas('domains', $data);
        $this->assertEquals('Domaine Romanée-Conti', $domain->name);
    }

    public function testFindOrCreateReturnsExistingDomain()
    {
        $existing = Domain::factory()->create(['name' => 'Domaine Test']);

        $data = ['name' => 'Domaine Test'];

        $domain = $this->domainService->findOrCreate($data);

        $this->assertEquals($existing->id, $domain->id);
        $this->assertDatabaseCount('domains', 1);
    }
}
