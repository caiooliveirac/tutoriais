<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ocorrencias', function (Blueprint $table) {
            $table->id();
            $table->string('protocolo', 20)->unique();
            $table->string('status', 30)->index(); // StatusOcorrencia
            $table->dateTime('aberta_em', 6);

            // Atendimento (TARM)
            $table->foreignId('tarm_id')->constrained('users');
            $table->string('telefone', 20);
            $table->string('solicitante');
            $table->string('cidade');
            $table->string('bairro');
            $table->string('endereco');
            $table->string('ponto_referencia')->nullable();
            $table->string('queixa');

            // Triagem (médico regulador)
            $table->foreignId('medico_id')->nullable()->constrained('users');
            $table->string('tipo_ocorrencia')->nullable();
            $table->string('motivo')->nullable();
            $table->string('detalhamento')->nullable();
            $table->string('risco', 20)->nullable(); // Risco
            $table->text('hma')->nullable();
            $table->string('decisao_medica')->nullable();
            $table->string('tipo_recurso', 10)->nullable(); // TipoRecurso pedido
            $table->dateTime('solicitado_envio_em', 6)->nullable();

            // Despacho e regulação
            $table->foreignId('unidade_id')->nullable()->constrained('unidades');
            $table->dateTime('despachada_em', 6)->nullable();
            $table->boolean('unidade_desvinculada')->default(false);
            $table->text('relato_equipe')->nullable();
            $table->foreignId('hospital_id')->nullable()->constrained('hospitais');

            // Intercorrência ativa (asterisco vermelho até alguém dar ciência)
            $table->string('intercorrencia', 30)->nullable();

            // Ficha aberta por outro usuário
            $table->foreignId('travada_por')->nullable()->constrained('users');
            $table->dateTime('travada_em', 6)->nullable();

            $table->datetimes(6);
        });

        Schema::create('vitimas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ocorrencia_id')->constrained()->cascadeOnDelete();
            $table->string('nome')->nullable(); // pode ser "NÃO IDENTIFICADO"
            $table->unsignedSmallInteger('idade')->nullable();
            $table->char('sexo', 1)->nullable(); // M / F
            $table->json('sinais_vitais')->nullable(); // pa, fc, fr, temp, spo2, hgt, glasgow
            $table->datetimes(6);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vitimas');
        Schema::dropIfExists('ocorrencias');
    }
};
