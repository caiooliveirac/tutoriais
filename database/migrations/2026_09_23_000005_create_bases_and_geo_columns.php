<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Bases com coordenada (para estimar tempo de chegada), posição ao vivo
     * das unidades (API de rastreamento) e local da ocorrência.
     */
    public function up(): void
    {
        Schema::create('bases', function (Blueprint $table) {
            $table->id();
            $table->string('nome')->unique();
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->string('fonte_coordenada'); // de onde veio a coordenada
            $table->datetimes(6);
        });

        Schema::table('unidades', function (Blueprint $table) {
            $table->dropColumn('base');
            $table->foreignId('base_id')->nullable()->after('tipo')->constrained('bases');
            $table->decimal('lat', 10, 7)->nullable()->after('baixada');
            $table->decimal('lng', 10, 7)->nullable()->after('lat');
            $table->dateTime('posicao_em', 6)->nullable()->after('lng');
        });

        Schema::table('ocorrencias', function (Blueprint $table) {
            $table->decimal('lat', 10, 7)->nullable()->after('ponto_referencia');
            $table->decimal('lng', 10, 7)->nullable()->after('lat');
        });
    }

    public function down(): void
    {
        Schema::table('ocorrencias', function (Blueprint $table) {
            $table->dropColumn(['lat', 'lng']);
        });

        Schema::table('unidades', function (Blueprint $table) {
            $table->dropConstrainedForeignId('base_id');
            $table->dropColumn(['lat', 'lng', 'posicao_em']);
            $table->string('base')->default('');
        });

        Schema::dropIfExists('bases');
    }
};
