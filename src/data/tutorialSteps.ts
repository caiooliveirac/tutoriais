export interface TutorialStep {
  id: number;
  title: string;
  description: string;
  highlightId?: string;
  triggerAction?: 'open_call' | 'dispatch_call';
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Login e Acesso",
    description: "Para iniciar, utilize as credenciais padrão (Senha PC: 'samu192'). Certifique-se de que o softphone (3cx) está ativo. Use o menu de perfil para registrar suas pausas e saída do plantão.",
    highlightId: "user-profile-menu"
  },
  {
    id: 2,
    title: "O Início: Recebendo do TARM",
    description: "Ao receber a ligação, verifique se os 4 últimos dígitos do código batem com a ocorrência aberta. Confirme os dados iniciais (nome, idade, queixa) e diga 'Pode passar!' para assumir a linha com o solicitante."
  },
  {
    id: 3,
    title: "1º Ato: Seleção (Clique na Lista)",
    description: "Enquanto fala com o TARM, localize a ocorrência na lista de 'Pendentes'. CLIQUE em qualquer chamado abaixo para abrir a ficha completa e iniciar a anamnese.",
    highlightId: "priority-list",
    triggerAction: "open_call"
  },
  {
    id: 4,
    title: "1º Ato: Análise da Ficha",
    description: "Com a ficha aberta, seus olhos devem ir direto para: Queixa Principal (Header), Tempo de Espera e Histórico. Use essas informações para confirmar a gravidade com o solicitante.",
    highlightId: "call-detail-modal"
  },
  {
    id: 5,
    title: "Triagem e Decisão",
    description: "Classifique o risco: Vermelho (Imediato), Amarelo (Urgente). Para decidir, clique em 'Despachar Unidade' na janela aberta. Se for caso de orientação, usaria 'Cancelar/Finalizar'.",
    highlightId: "call-dispatch-btn",
    triggerAction: "dispatch_call"
  },
  {
    id: 6,
    title: "2º Ato: Contato com a Equipe",
    description: "Após despachar, anote o número da viatura. Se demorar, ligue '*70' + Viatura. Confirme a chegada e a estabilização da vítima."
  },
  {
    id: 7,
    title: "Encerramento (Acolhido)",
    description: "A ocorrência é finalizada apenas quando o paciente é entregue no hospital (Acolhido). Garanta a 'maca zero' antes de liberar a equipe."
  }
];
