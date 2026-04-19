<?php

namespace Tests\Feature;

use Dedoc\Scramble\Http\Middleware\RestrictedDocsAccess;
use Tests\TestCase;

class ScrambleTest extends TestCase
{
    public function testOpenApiHasBearerSecurityScheme()
    {
        $response = $this->withoutMiddleware(RestrictedDocsAccess::class)->getJson('/docs/api.json');

        $response->assertStatus(200);

        $spec = $response->json();

        $this->assertArrayHasKey('http', $spec['components']['securitySchemes']);
        $this->assertEquals('http', $spec['components']['securitySchemes']['http']['type']);
        $this->assertEquals('bearer', $spec['components']['securitySchemes']['http']['scheme']);
    }
}
