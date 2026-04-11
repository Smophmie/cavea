<?php

use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    public function up(): void
    {
        DB::table('grape_varieties')->insert(['name' => 'Marselan']);
    }

    public function down(): void
    {
        DB::table('grape_varieties')->where('name', 'Marselan')->delete();
    }
};
