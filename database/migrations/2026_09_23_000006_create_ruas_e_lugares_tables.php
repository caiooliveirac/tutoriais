<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ruas e lugares de Salvador (OpenStreetMap), carregados pelo MapaSeeder.
     * `som` é o nome "falado" (App\Services\Mapas\Fonetica) para achar o que
     * o TARM escreveu de ouvido; `homonimos` conta quantos outros lugares da
     * cidade têm o mesmo nome — sinal para confirmar o bairro.
     */
    public function up(): void
    {
        Schema::create('ruas', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('som', 120)->index();
            $table->string('tipo', 30);
            $table->string('bairro')->nullable()->index();
            $table->decimal('lat', 9, 6);
            $table->decimal('lng', 9, 6);
            $table->decimal('lat_min', 9, 6);
            $table->decimal('lat_max', 9, 6);
            $table->decimal('lng_min', 9, 6);
            $table->decimal('lng_max', 9, 6);
            $table->json('trechos');
            $table->unsignedSmallInteger('homonimos')->default(0);
            $table->index(['lat_min', 'lat_max']);
        });

        Schema::create('lugares', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('som', 120)->index();
            $table->string('tipo', 60);
            $table->string('bairro')->nullable()->index();
            $table->decimal('lat', 9, 6);
            $table->decimal('lng', 9, 6);
            $table->unsignedSmallInteger('homonimos')->default(0);
            $table->index(['lat', 'lng']);
        });

        // Nada impede abrir a ocorrência: com solicitante leigo, o TARM
        // registra o que conseguir e a equipe completa no local.
        Schema::table('ocorrencias', function (Blueprint $table) {
            $table->string('telefone', 20)->nullable()->change();
            $table->string('solicitante')->nullable()->change();
            $table->string('bairro')->nullable()->change();
            $table->string('endereco')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lugares');
        Schema::dropIfExists('ruas');
    }
};
