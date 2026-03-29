<?php

use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    public function up(): void
    {
        DB::table('regions')->insert([
            'name' => 'Autre',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('regions')->where('name', 'Autre')->delete();
    }
};
