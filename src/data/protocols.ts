export interface Protocol {
  id: string;
  title: string;
  category: "Fluxo Padrão" | "Intercorrências" | "Jurídico/Administrativo" | "Triagem";
  shortDescription: string;
  fullContent: string; // Supports basic formatting characters like \n
  bulletPoints?: string[];
  tutorialFlowId?: string;
}

export const protocols: Protocol[] = [
  {
    id: "fluxo-padrao-1",
    title: "Triagem Básica (Quem, Onde, O Que)",
    category: "Fluxo Padrão",
    shortDescription: "Os três pilares da regulação inicial.",
    fullContent: "Todo atendimento deve iniciar identificando o solicitante e paciente (QUEM), a localização exata com referência (ONDE) e a queixa principal (O QUE). Mantenha o tempo de regulação abaixo de 3 minutos.",
    tutorialFlowId: "triagem_inicial",
    bulletPoints: [
        "Confirme o município e bairro imediatamente.",
        "Se houver múltiplas vítimas, identifique a mais grave.",
        "Obtenha um ponto de referência visual."
    ]
  },
  {
    id: "intercorrencia-recusa",
    title: "Recusa de Atendimento",
    category: "Intercorrências",
    shortDescription: "Procedimento quando o paciente não aceita a remoção.",
    fullContent: "A recusa é um direito do paciente desde que ele esteja lúcido, orientado e capaz de tomar decisões. A equipe deve explicar claramente os riscos da não-remoção.",
    tutorialFlowId: "recusa_atendimento",
    bulletPoints: [
        "Avaliar nível de consciência (Glasgow 15).",
        "Preencher termo de recusa assinado pelo paciente ou testemunha.",
        "Se risco de morte iminente e recusa, acionar apoio policial (risco x benefício).",
        "Registrar em prontuário a orientação dada."
    ]
  },
  {
    id: "intercorrencia-qta",
    title: "QTA / Evasão / Trote",
    category: "Intercorrências",
    shortDescription: "Paciente não localizado ou inexistente.",
    fullContent: "Quando a equipe chega ao local e não encontra a vítima ou a ocorrência não existe (QTA).",
    tutorialFlowId: "qta_fluxo",
    bulletPoints: [
        "Tentar contato telefônico com o solicitante novamente.",
        "Aguardar 5 minutos no local com giroscópio ligado.",
        "Registrar QTA no sistema.",
        "Liberar a viatura (código QJ) imediatamente para próxima missão."
    ]
  },
  {
    id: "juridico-obito",
    title: "Óbito em Domicílio",
    category: "Jurídico/Administrativo",
    shortDescription: "Atuação do SAMU em casos de morte evidente.",
    fullContent: "O SAMU não emite atestado de óbito para mortes naturais sem assistência prévia e NÃO realiza remoção de cadáveres.",
    bulletPoints: [
        "Se morte natural conhecida: Orientar família a buscar médico assistente ou posto de saúde.",
        "Se morte suspeita ou violenta: Preservar a cena e acionar Polícia Militar (para IML/DPT).",
        "A equipe só atesta óbito se houver intervenção/PCR sem sucesso no local."
    ]
  },
  {
    id: "intercorrencia-piora",
    title: "Piora Clínica / Solicitação de Apoio",
    category: "Intercorrências",
    shortDescription: "Paciente degrada durante atendimento da Unidade Básica.",
    fullContent: "Quando a equipe identificada no local percebe que a gravidade do caso excede a capacidade de resolução da unidade (Ex: USB atendendo Infarto ou AVC instável).",
    tutorialFlowId: "piora_apoio",
    bulletPoints: [
        "Reavaliar ABCDE e Sinais Vitais.",
        "Contatar Regulação Médica imediatamente.",
        "Solicitar apoio de USA (Unidade de Suporte Avançado).",
        "Iniciar manobras de estabilização possíveis até chegada do apoio."
    ]
  }
];
