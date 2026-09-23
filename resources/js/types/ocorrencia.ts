export type Linha = {
    id: number;
    protocolo: string;
    status: string;
    status_label: string;
    data: string;
    hora: string;
    telefone: string;
    solicitante: string;
    cidade: string;
    bairro: string;
    queixa: string;
    tarm: string;
    medico: string | null;
    risco: string | null;
    decisao_medica: string | null;
    tipo_recurso: string | null;
    solicitado_envio_hora: string | null;
    unidade: string | null;
    despachada_hora: string | null;
    despachante: string | null;
    unidade_desvinculada: boolean;
    hospital: string | null;
    intercorrencia: string | null;
    travada_por: string | null;
};

export type BaseMapa = { nome: string; lat: number; lng: number };

export type Estimativa = {
    fonte: 'osrm' | 'linha_reta';
    bases: (BaseMapa & { minutos: number; km: number; livres: string[] })[];
    unidades: {
        codigo: string;
        tipo: string;
        base: string;
        origem: 'posicao' | 'base';
        lat: number;
        lng: number;
        minutos: number;
        km: number;
    }[];
};

export type Sugestao = {
    id: string;
    principal: string;
    secundario: string;
    // OSM já traz; Google precisa de /lugar
    lat?: number;
    lng?: number;
    bairro?: string | null;
    logradouro?: string | null;
    numero?: string | null;
};

export type Lugar = {
    rotulo: string;
    logradouro: string | null;
    numero: string | null;
    bairro: string | null;
    lat: number;
    lng: number;
};

export type Referencia = {
    nome: string;
    tipo: string;
    lat: number;
    lng: number;
    metros: number;
};

export type Arredores = {
    endereco: string | null;
    bairro: string | null;
    ruas: { nome: string; metros: number; trechos: [number, number][][] }[];
    referencias: Referencia[];
    avisos: string[];
};

export type LugarEncontrado = {
    nome: string;
    endereco: string;
    lat: number;
    lng: number;
};

export type ConfigMapas = {
    provedor: 'google' | 'osm';
    chave_navegador: string | null;
};
