<?php

namespace Database\Seeders;

use App\Enums\Perfil;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Usuários de demonstração (um por perfil) e catálogos. Senhas fáceis
     * de propósito: o sistema só contém dados fictícios.
     */
    public function run(): void
    {
        $usuarios = [
            ['tarm', 'TARM Demo', [Perfil::Tarm]],
            ['radio', 'Rádio-operador Demo', [Perfil::RadioOperador]],
            ['enf', 'Enfermeiro Regulador Demo', [Perfil::EnfermeiroRegulador]],
            ['medico', 'Médico Regulador Demo', [Perfil::MedicoRegulador]],
            ['chefe', 'Chefe de Plantão Demo', [Perfil::ChefePlantao, Perfil::MedicoRegulador]],
            ['admin', 'Administrativo Demo', [Perfil::Administrativo]],
        ];

        foreach ($usuarios as [$login, $nome, $perfis]) {
            User::updateOrCreate(
                ['email' => "{$login}@samu.test"],
                [
                    'name' => $nome,
                    'password' => "{$login}123",
                    'perfis' => $perfis,
                    'email_verified_at' => now(),
                ],
            );
        }

        $this->call(CatalogoSeeder::class);

        // ~30 mil ruas e lugares: fora dos testes, que semeiam um mapa pequeno próprio.
        if (! app()->runningUnitTests()) {
            $this->call(MapaSeeder::class);
        }
    }
}
