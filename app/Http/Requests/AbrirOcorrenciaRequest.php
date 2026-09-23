<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AbrirOcorrenciaRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'telefone' => ['required', 'string', 'max:20'],
            'solicitante' => ['required', 'string', 'max:120'],
            'cidade' => ['required', 'string', 'max:80'],
            'bairro' => ['required', 'string', 'max:80'],
            'endereco' => ['required', 'string', 'max:200'],
            'ponto_referencia' => ['nullable', 'string', 'max:200'],
            'queixa' => ['required', 'string', 'max:200'],
            'lat' => ['nullable', 'numeric', 'between:-13.2,-12.6', 'required_with:lng'],
            'lng' => ['nullable', 'numeric', 'between:-38.8,-38.1', 'required_with:lat'],
            'vitimas' => ['required', 'array', 'min:1', 'max:20'],
            'vitimas.*.nome' => ['nullable', 'string', 'max:120'],
            'vitimas.*.idade' => ['nullable', 'integer', 'between:0,130'],
            'vitimas.*.sexo' => ['nullable', 'in:M,F'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'ponto_referencia' => 'ponto de referência',
            'endereco' => 'endereço',
            'vitimas.*.idade' => 'idade',
            'lat' => 'localização no mapa',
        ];
    }
}
