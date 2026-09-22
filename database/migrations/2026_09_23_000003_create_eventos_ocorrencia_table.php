<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Linha do tempo e auditoria da ocorrência. Append-only: o banco
     * recusa UPDATE e DELETE; correção é um novo evento.
     */
    public function up(): void
    {
        Schema::create('eventos_ocorrencia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ocorrencia_id')->constrained();
            $table->string('tipo', 30); // TipoEvento
            $table->string('descricao');
            $table->json('antes')->nullable();
            $table->json('depois')->nullable();
            $table->foreignId('user_id')->nullable()->constrained(); // null = sistema
            $table->string('perfil', 30)->nullable();
            $table->string('ip', 45)->nullable();
            $table->dateTime('created_at', 6)->index();
        });

        foreach (['UPDATE', 'DELETE'] as $operacao) {
            $nome = 'eventos_ocorrencia_sem_'.strtolower($operacao);
            DB::unprepared(<<<SQL
                CREATE TRIGGER {$nome} BEFORE {$operacao} ON eventos_ocorrencia
                FOR EACH ROW
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'eventos_ocorrencia e append-only'
                SQL);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('eventos_ocorrencia');
    }
};
