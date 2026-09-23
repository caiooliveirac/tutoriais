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
            // Só a queixa e alguma pista do local são obrigatórias: com
            // solicitante leigo, nada pode impedir o TARM de abrir o chamado.
            'telefone' => ['nullable', 'string', 'max:20'],
            'solicitante' => ['nullable', 'string', 'max:120'],
            'cidade' => ['required', 'string', 'max:80'],
            'bairro' => ['nullable', 'string', 'max:80'],
            'endereco' => ['nullable', 'string', 'max:200', 'required_without_all:bairro,ponto_referencia,lat'],
            'ponto_referencia' => ['nullable', 'string', 'max:200'],
            'queixa' => ['required', 'string', 'max:200'],
            'lat' => ['nullable', 'numeric', 'between:-13.2,-12.6', 'required_with:lng'],
            'lng' => ['nullable', 'numeric', 'between:-38.8,-38.1', 'required_with:lat'],
            // como o TARM chegou ao ponto: endereço, ponto de referência ou clique no mapa
            'localizado_por' => ['nullable', 'in:endereco,referencia,mapa'],
            'vitimas' => ['required', 'array', 'min:1', 'max:20'],
            'vitimas.*.nome' => ['nullable', 'string', 'max:120'],
            'vitimas.*.idade' => ['nullable', 'integer', 'between:0,130'],
            'vitimas.*.sexo' => ['nullable', 'in:M,F'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'endereco.required_without_all' => 'Informe pelo menos uma pista do local: endereço, bairro, ponto de referência ou um clique no mapa.',
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
            'bairro' => 'bairro',
            'vitimas.*.idade' => 'idade',
            'lat' => 'localização no mapa',
        ];
    }
}
