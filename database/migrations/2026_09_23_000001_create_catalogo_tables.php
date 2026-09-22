<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hospitais', function (Blueprint $table) {
            $table->id();
            $table->string('nome')->unique();
            $table->string('sigla', 20)->nullable();
            $table->datetimes(6);
        });

        Schema::create('unidades', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20)->unique(); // ex.: "CZ 51"
            $table->string('tipo', 10); // TipoRecurso
            $table->string('base');
            $table->boolean('baixada')->default(false); // fora de operação
            $table->datetimes(6);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unidades');
        Schema::dropIfExists('hospitais');
    }
};
