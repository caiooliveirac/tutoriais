<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Quem despachou a unidade (enfermeiro ou rádio-operador) fica na própria
     * ocorrência, para aparecer nas listas sem ler a linha do tempo.
     */
    public function up(): void
    {
        Schema::table('ocorrencias', function (Blueprint $table) {
            $table->foreignId('despachada_por')->nullable()->after('despachada_em')->constrained('users');
        });
    }

    public function down(): void
    {
        Schema::table('ocorrencias', function (Blueprint $table) {
            $table->dropConstrainedForeignId('despachada_por');
        });
    }
};
