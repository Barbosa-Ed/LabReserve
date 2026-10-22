import React, { useState } from 'react';
import { Reservation, User } from '../types';
import { SOFTWARE_CATEGORIES } from '../data/mockData';
import { downloadReservationJpg, shareReservationJpg } from '../utils/cardGenerator';

interface ReservationWizardProps {
  currentUser: User;
  onFinishReservation: (newReservation: Reservation) => void;
  onCancel: () => void;
  activeReservationForTicket?: Reservation | null;
}

export const ReservationWizard: React.FC<ReservationWizardProps> = ({
  currentUser,
  onFinishReservation,
  onCancel,
  activeReservationForTicket,
}) => {
  // If an active ticket is passed to view directly, start in ticket mode!
  const [isViewingSubmitted, setIsViewingSubmitted] = useState<boolean>(!!activeReservationForTicket);

  // Professor Request Form States
  const [discipline, setDiscipline] = useState('');
  const [studentsCount, setStudentsCount] = useState(32);

  // Dates carousel options
  const dateOptions = [
    { label: 'QUA', day: '25', full: 'Qua, 25 de Outubro', dateVal: '2023-10-25' },
    { label: 'QUI', day: '26', full: 'Qui, 26 de Outubro', dateVal: '2023-10-26' },
    { label: 'SEX', day: '27', full: 'Sex, 27 de Outubro', dateVal: '2023-10-27' },
    { label: 'SEG', day: '30', full: 'Seg, 30 de Outubro', dateVal: '2023-10-30' },
    { label: 'TER', day: '31', full: 'Ter, 31 de Outubro', dateVal: '2023-10-31' },
    { label: 'QUA', day: '01', full: 'Qua, 01 de Novembro', dateVal: '2023-11-01' },
    { label: 'QUI', day: '02', full: 'Qui, 02 de Novembro', dateVal: '2023-11-02' },
  ];
  const [selectedDateObj, setSelectedDateObj] = useState(dateOptions[2]); // Friday 27 default

  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('17:30');

  // Selected software list
  const [selectedSoftwares, setSelectedSoftwares] = useState<string[]>([
    'VS Code',
    'Android Studio',
    'PostgreSQL / DBeaver',
  ]);
  const [customSoftware, setCustomSoftware] = useState('');

  // Ticket State
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(
    activeReservationForTicket || null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

  // Handle software tag toggle
  const toggleSoftware = (name: string) => {
    setSelectedSoftwares((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  // Adjust students count
  const handleStudentChange = (newVal: number) => {
    const clamped = Math.max(1, Math.min(60, newVal));
    setStudentsCount(clamped);
  };

  // Calculate duration string
  const calculateDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let diffMinutes = endH * 60 + endM - (startH * 60 + startM);
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
  };

  // Submit Professor Request (Without choosing room!)
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = calculateDuration(startTime, endTime);
    const randomProtocolNum = Math.floor(1000 + Math.random() * 9000);
    const protocolCode = `#LR-2023-${randomProtocolNum}`;

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      protocol: protocolCode,
      subject: discipline.trim(),
      course: currentUser.department || 'Graduação',
      assignedClass: 'Graduação / Aula Prática',
      professorName: currentUser.name,
      professorId: currentUser.id,
      siape: currentUser.siape || '198421',
      studentsCount: studentsCount,
      dateStr: selectedDateObj.dateVal,
      dateFormatted: selectedDateObj.full,
      startTime: startTime,
      endTime: endTime,
      durationStr: duration,
      requiredSoftware: selectedSoftwares,
      extraSoftware: customSoftware.trim() || undefined,
      status: 'pendente', // Admin will approve/reject and assign room!
      qrCodeText: `LR-PEND-${randomProtocolNum}`,
      createdAt: new Date().toISOString(),
    };

    setCurrentReservation(newRes);
    onFinishReservation(newRes);
    setIsViewingSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Copy Protocol to Clipboard
  const handleCopyProtocol = () => {
    const text = currentReservation?.protocol || '#LR-2023-8941';
    navigator.clipboard.writeText(text);
    setToastMessage('Código copiado com sucesso!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Download .JPG Card
  const handleDownloadJpgCard = async () => {
    if (!currentReservation) return;
    try {
      setIsGeneratingCard(true);
      await downloadReservationJpg(currentReservation);
      setToastMessage('Card .JPG baixado com sucesso!');
    } catch {
      setToastMessage('Erro ao gerar imagem.');
    } finally {
      setIsGeneratingCard(false);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  // Share .JPG Card
  const handleShareJpgCard = async () => {
    if (!currentReservation) return;
    try {
      setIsGeneratingCard(true);
      await shareReservationJpg(currentReservation);
      setToastMessage('Card pronto para compartilhamento!');
    } catch {
      handleCopyProtocol();
    } finally {
      setIsGeneratingCard(false);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  // Add to Calendar intent
  const handleAddToCalendar = () => {
    if (!currentReservation) return;
    const roomName = currentReservation.assignedLabCode || 'Sala a Confirmar';
    const title = encodeURIComponent(`Aula: ${currentReservation.subject} (${roomName})`);
    const details = encodeURIComponent(
      `Alocação de laboratório para ${currentReservation.studentsCount} alunos. Protocolo: ${currentReservation.protocol}.`
    );
    const location = encodeURIComponent(`${currentReservation.assignedLocation || 'Campus'} - Universidade`);
    const dateFormattedClean = currentReservation.dateStr.replace(/-/g, '');
    const startTimeClean = currentReservation.startTime.replace(':', '') + '00';
    const endTimeClean = currentReservation.endTime.replace(':', '') + '00';
    const dates = `${dateFormattedClean}T${startTimeClean}Z/${dateFormattedClean}T${endTimeClean}Z`;

    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
    window.open(calUrl, '_blank');
  };

  // ==========================================
  // PROFESSOR FORM: ONLY CLASS REQUIREMENTS (NO ROOM PICKING)
  // ==========================================
  if (!isViewingSubmitted) {
    return (
      <form onSubmit={handleSubmitRequest} className="flex flex-col w-full px-margin pb-24 space-y-space-lg">
        {/* Info Banner for Professor */}
        <section className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-outline-variant/20 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">school</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Solicitar Pedido de Laboratório
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Informe os dados da aula e os softwares necessários. A <strong>Coordenação / DTI</strong> analisará os requisitos e alocará a melhor sala disponível seguindo a capacidade da turma.
            </p>
          </div>
        </section>

        {/* Contexto Acadêmico: Disciplina */}
        <section className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-md border border-outline-variant/20">
          <div className="flex items-center gap-space-sm text-primary">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">menu_book</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Dados da Aula</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Informe a matéria da aula prática</p>
            </div>
          </div>

          {/* Text Input Disciplina */}
          <div className="space-y-space-xs">
            <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="input-disciplina">
              Matéria / Disciplina *
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-on-surface-variant text-[20px]">
                edit_note
              </span>
              <input
                id="input-disciplina"
                type="text"
                required
                placeholder="Ex: Redes de Computadores, Sistemas Operacionais, Inteligência Artificial..."
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          </div>
        </section>

        {/* Lotação e Capacidade Necessária */}
        <section className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-md border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm text-primary">
              <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">person_check</span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Tamanho da Turma</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Postos de trabalho necessários para os alunos</p>
              </div>
            </div>
            <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-2.5 py-1 rounded-full flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              1:1 Aluno/PC
            </span>
          </div>

          {/* Card Contador Dinâmico */}
          <div className="bg-surface-container-low p-space-md rounded-xl flex items-center justify-between">
            <button
              aria-label="Diminuir alunos"
              className="w-11 h-11 rounded-lg bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-sm active:scale-95 transition-transform cursor-pointer"
              id="btn-decrement"
              type="button"
              onClick={() => handleStudentChange(studentsCount - 1)}
            >
              <span className="material-symbols-outlined text-[20px]">remove</span>
            </button>
            <div className="flex flex-col items-center">
              <span className="font-display-lg text-display-lg text-primary leading-none font-bold" id="student-count-display">
                {studentsCount}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">estações ativas</span>
            </div>
            <button
              aria-label="Aumentar alunos"
              className="w-11 h-11 rounded-lg bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-sm active:scale-95 transition-transform cursor-pointer"
              id="btn-increment"
              type="button"
              onClick={() => handleStudentChange(studentsCount + 1)}
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>

          {/* Slider de Ajuste Fino */}
          <div className="space-y-space-xs pt-1">
            <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
              <span>Min: 1</span>
              <span>Ajuste Rápido</span>
              <span>Máx: 60</span>
            </div>
            <input
              className="w-full accent-primary-container h-2 bg-surface-container rounded-lg cursor-pointer"
              id="student-slider"
              max={60}
              min={1}
              type="range"
              value={studentsCount}
              onChange={(e) => handleStudentChange(parseInt(e.target.value, 10))}
            />
          </div>

          <div className="bg-surface-container-high p-space-sm rounded-lg flex items-center gap-space-sm text-on-surface">
            <span className="material-symbols-outlined text-primary text-[20px] shrink-0">info</span>
            <p className="font-body-sm text-body-sm">
              O administrador alocará uma sala com no mínimo <strong>{studentsCount} computadores</strong> funcionais.
            </p>
          </div>
        </section>

        {/* Data e Horários de Uso */}
        <section className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-md border border-outline-variant/20">
          <div className="flex items-center gap-space-sm text-primary">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">event</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Data e Horário da Aula</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Selecione o dia e o bloco de aulas</p>
            </div>
          </div>

          {/* Carrossel Horizontal de Datas */}
          <div className="space-y-space-xs">
            <span className="font-label-md text-label-md text-on-surface">
              Data da Aula: <strong className="text-primary">{selectedDateObj.full}</strong>
            </span>
            <div className="flex gap-2 overflow-x-auto pb-2 pt-1 -mx-2 px-2 no-scrollbar">
              {dateOptions.map((opt) => {
                const isSelected = opt.dateVal === selectedDateObj.dateVal;
                return (
                  <button
                    key={opt.dateVal}
                    className={`date-chip flex-shrink-0 w-16 py-2.5 rounded-xl flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-sm scale-105'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                    type="button"
                    onClick={() => setSelectedDateObj(opt)}
                  >
                    <span className={`font-label-sm text-label-sm ${isSelected ? 'opacity-90 font-bold' : 'opacity-80'}`}>
                      {opt.label}
                    </span>
                    <span className="font-headline-sm text-headline-sm font-bold">{opt.day}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bloco de Início e Término */}
          <div className="grid grid-cols-2 gap-space-sm pt-1">
            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="time-start">
                Horário Início
              </label>
              <div className="relative">
                <select
                  className="w-full h-12 pl-3 pr-8 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md appearance-none focus:outline-none"
                  id="time-start"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  <option value="08:00">08:00</option>
                  <option value="10:00">10:00</option>
                  <option value="13:30">13:30</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="18:30">18:30</option>
                  <option value="19:15">19:15</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3 text-on-surface-variant pointer-events-none text-[18px]">
                  schedule
                </span>
              </div>
            </div>

            <div className="space-y-space-xs">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="time-end">
                Horário Término
              </label>
              <div className="relative">
                <select
                  className="w-full h-12 pl-3 pr-8 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md appearance-none focus:outline-none"
                  id="time-end"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                >
                  <option value="10:00">10:00</option>
                  <option value="12:00">12:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="17:30">17:30</option>
                  <option value="21:00">21:00</option>
                  <option value="22:00">22:00</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3 text-on-surface-variant pointer-events-none text-[18px]">
                  timelapse
                </span>
              </div>
            </div>
          </div>

          {/* Badge Automático de Duração */}
          <div className="flex items-center justify-between bg-surface-container-high px-space-md py-2.5 rounded-lg">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Tempo total de ocupação</span>
            <span className="bg-primary-fixed text-on-primary-fixed font-label-md text-label-md px-3 py-1 rounded-full flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
              Duração: {calculateDuration(startTime, endTime)}
            </span>
          </div>
        </section>

        {/* Softwares Específicos Necessários */}
        <section className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-md border border-outline-variant/20">
          <div className="flex items-center gap-space-sm text-primary">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">terminal</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Softwares Necessários</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Selecione os pacotes exigidos para a aula prática</p>
            </div>
          </div>

          {SOFTWARE_CATEGORIES.map((cat) => (
            <div key={cat.id} className="space-y-space-xs pt-0.5">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                {cat.title}
              </span>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item) => {
                  const isSelected = selectedSoftwares.includes(item);
                  return (
                    <button
                      key={item}
                      className={`software-pill px-3 py-1.5 rounded-full font-label-md text-label-md flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                          : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                      }`}
                      type="button"
                      onClick={() => toggleSoftware(item)}
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          isSelected ? 'text-white' : 'text-on-surface-variant'
                        }`}
                      >
                        {isSelected ? 'check_circle' : 'add'}
                      </span>
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Campo de Texto Adicional */}
          <div className="space-y-space-xs pt-1">
            <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="outros-softwares">
              Outro software, versão ou biblioteca específica
            </label>
            <input
              className="w-full h-12 px-4 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder-on-surface-variant/60 focus:outline-none focus:bg-surface-container-high transition-colors"
              id="outros-softwares"
              placeholder="ex: Node v20, Docker, PyTorch 2.3, GCC 13"
              type="text"
              value={customSoftware}
              onChange={(e) => setCustomSoftware(e.target.value)}
            />
          </div>
        </section>

        {/* Action Button */}
        <section className="pt-2">
          <button
            className="w-full h-14 bg-primary-container hover:bg-primary text-on-primary rounded-xl font-title-md text-title-md shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer font-bold"
            type="submit"
          >
            <span>Enviar Pedido de Sala à Administração</span>
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
          <p className="text-center font-label-sm text-label-sm text-on-surface-variant mt-2">
            O administrador definirá a sala adequada e notificará você com o comprovante.
          </p>
        </section>
      </form>
    );
  }

  // ==========================================
  // PROFESSOR TICKET / SUBMITTED STATUS VIEW
  // ==========================================
  const ticket = currentReservation;
  const isApproved = ticket?.status === 'confirmada';
  const isPending = ticket?.status === 'pendente';
  const isRejected = ticket?.status === 'rejeitada';

  return (
    <div className="flex flex-col w-full pb-safe">
      <div className="px-margin pt-space-md pb-space-lg flex flex-col items-center text-center">
        {/* Status Badge */}
        <div className="relative flex items-center justify-center w-20 h-20 mb-space-md">
          {isApproved ? (
            <>
              <div className="absolute inset-0 rounded-full bg-secondary-container/50 animate-ping opacity-75"></div>
              <div className="relative w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center shadow-md">
                <span
                  className="material-symbols-outlined text-[44px] text-on-secondary-container"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
                >
                  check_circle
                </span>
              </div>
            </>
          ) : isPending ? (
            <div className="relative w-20 h-20 rounded-full bg-tertiary-fixed flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[44px] text-on-tertiary-fixed-variant animate-spin">
                sync
              </span>
            </div>
          ) : (
            <div className="relative w-20 h-20 rounded-full bg-error-container flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[44px] text-on-error-container">
                cancel
              </span>
            </div>
          )}
        </div>

        {/* Title & Subtitle */}
        <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs font-bold">
          {isApproved
            ? 'Reserva Confirmada!'
            : isPending
            ? 'Pedido Enviado para Análise!'
            : 'Pedido Rejeitado pelo Administrador'}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
          {isApproved
            ? 'Sua alocação de laboratório foi aprovada pelo DTI. A sala já está reservada.'
            : isPending
            ? 'A equipe administrativa de TI recebeu suas informações e está alocando o laboratório ideal.'
            : 'Sua solicitação de sala não pôde ser atendida para este horário. Veja a justificativa abaixo.'}
        </p>

        {/* Protocol Snippet */}
        <div className="mt-space-md inline-flex items-center gap-space-sm bg-surface-container-high px-space-md py-space-xs rounded-full">
          <span className="font-label-md text-label-md text-on-surface-variant font-medium">Protocolo:</span>
          <span className="font-title-md text-title-md text-primary font-bold tracking-wide" id="protocol-code">
            {ticket?.protocol || '#LR-2023-8941'}
          </span>
          <button
            aria-label="Copiar código de protocolo"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant transition-colors active:scale-95 text-primary cursor-pointer"
            id="copy-btn"
            onClick={handleCopyProtocol}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]" id="copy-icon">
              content_copy
            </span>
          </button>
        </div>
      </div>

      <div className="px-margin flex flex-col gap-space-lg mb-space-xl">
        {/* Rejection Justification Box if rejected */}
        {isRejected && ticket?.adminJustification && (
          <div className="bg-error-container/40 border border-error/30 p-4 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-error font-bold font-title-md">
              <span className="material-symbols-outlined text-[22px]">report</span>
              Justificativa da Administração
            </div>
            <p className="font-body-md text-body-md text-on-surface leading-relaxed">
              "{ticket.adminJustification}"
            </p>
            <span className="text-xs text-on-surface-variant mt-1">
              Revisado por: {ticket.reviewedBy || 'Coordenação DTI'}
            </span>
          </div>
        )}

        {/* Stylized Boarding Pass / Ticket */}
        <div className="relative bg-surface-container-lowest rounded-xl shadow-md overflow-hidden border border-outline-variant/30">
          {/* Laboratory Spotlight Header */}
          <div className="relative h-28 w-full overflow-hidden">
            <img
              alt="Laboratório"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBD2Co1JjGyCh6mgvhBjn8ujEzM6E_2gmAKxWNF4vFNpNflc3hRGBtuHlp6FbWCuWGusIDoi2WTw-Uy8RKT4xZZ1SJVo4nsuY09dWNaNcSsC2WKncGkVZKiRYjBwP3v2ge_fNBmKLEXdes00u6CI_bcSojYsswdCSuzz4yW7T0OEDslcF_XYbLoY_SVE6-n2L5dnIbzBYYIHDBrOHlQlrsHuRexPyZ9srXBasdMDaM22MmtvI9Zj9t2tQ"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent"></div>
            <div className="absolute top-space-sm left-space-md bg-surface/90 backdrop-blur-md px-space-sm py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <span className={`w-2 h-2 rounded-full ${isApproved ? 'bg-secondary animate-pulse' : 'bg-tertiary'}`}></span>
              <span className="font-label-sm text-label-sm font-bold">
                {isApproved ? `Sala Autenticada: ${ticket.assignedLabCode}` : 'Aguardando Alocação da Sala'}
              </span>
            </div>
          </div>

          {/* Ticket Body Content */}
          <div className="px-space-md pt-space-xs pb-space-md flex flex-col gap-space-md">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                Disciplina & Curso
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-bold">
                {ticket?.subject || 'Desenvolvimento Web & Mobile'}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[16px] text-outline">school</span>
                {ticket?.professorName || 'Prof. Dr. André Silva'} (SIAPE: {ticket?.siape || '198421'})
              </p>
            </div>

            {/* Standard Room Name Spotlight */}
            <div className="grid grid-cols-2 gap-space-sm bg-surface-container-low p-space-sm rounded-lg">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                  Sala (Bloco + Número)
                </span>
                <span className="font-title-md text-title-md text-primary font-black">
                  {ticket?.assignedLabCode ? `Sala ${ticket.assignedLabCode}` : 'Pendente de Alocação'}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {ticket?.assignedLocation || 'A definir pelo Admin'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Capacidade / Lotação</span>
                <span className="font-title-md text-title-md text-on-surface font-bold">
                  {ticket?.studentsCount || 32} Alunos
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Total: {ticket?.totalStations || ticket?.studentsCount || 32} Estações
                </span>
              </div>
            </div>

            <div className="flex items-start gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-title-md text-on-surface font-semibold">
                  {ticket?.dateFormatted || 'Sexta-feira, 27 de Outubro'}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                  {ticket?.startTime || '14:00'} às {ticket?.endTime || '17:30'} (Duração: {ticket?.durationStr || '3h30min'})
                </span>
              </div>
            </div>

            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1 font-semibold">
                Ambiente de Software
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(ticket?.requiredSoftware && ticket.requiredSoftware.length > 0
                  ? ticket.requiredSoftware
                  : ['VS Code', 'PostgreSQL']
                ).map((soft, idx) => (
                  <span
                    key={idx}
                    className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[13px]">code</span>
                    {soft}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Ticket Bottom: Confirmação Oficial do DTI */}
          <div className="px-space-md pt-space-xs pb-space-lg flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-secondary font-semibold font-label-md text-label-md">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              {isApproved
                ? `Alocação aprovada para a ${ticket?.assignedLabCode || 'Sala'}`
                : isPending
                ? 'Em análise pela equipe técnica do DTI'
                : 'Solicitação não atendida'}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-sm">
              {isApproved
                ? `O espaço físico e os computadores da ${ticket?.assignedLabCode || 'sala'} estarão preparados para o início da sua aula.`
                : isPending
                ? 'Você receberá uma notificação assim que a moderação definir a sala adequada.'
                : 'Consulte a justificativa fornecida pela coordenação acima.'}
            </p>
          </div>
        </div>

        {/* Action Buttons with .JPG Card Sharing */}
        <div className="flex flex-col gap-space-sm">
          {/* Share / Download .JPG Card Button */}
          {isApproved && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                className="w-full h-12 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
                onClick={handleDownloadJpgCard}
                disabled={isGeneratingCard}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                {isGeneratingCard ? 'Gerando Card...' : 'Baixar Card .JPG da Sala'}
              </button>

              <button
                className="w-full h-12 rounded-xl bg-surface-container-highest text-on-surface font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-surface-dim active:scale-95 transition-all cursor-pointer"
                onClick={handleShareJpgCard}
                disabled={isGeneratingCard}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">share</span>
                Compartilhar Card .JPG
              </button>
            </div>
          )}

          {isApproved && (
            <button
              className="w-full h-12 rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all cursor-pointer"
              onClick={handleAddToCalendar}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">event</span>
              Adicionar à Agenda (Google / Outlook)
            </button>
          )}

          <button
            className="w-full py-space-sm text-center text-primary font-label-md text-label-md font-bold hover:underline transition-all cursor-pointer"
            onClick={onCancel}
            type="button"
          >
            Voltar para a Página Inicial
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      <div
        className={`fixed bottom-6 inset-x-4 max-w-xs mx-auto bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-full shadow-lg flex items-center justify-center gap-2 transition-opacity duration-300 z-50 ${
          toastMessage ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-[18px] text-secondary-fixed">check</span>
        <span className="font-body-sm text-body-sm">{toastMessage}</span>
      </div>
    </div>
  );
};
