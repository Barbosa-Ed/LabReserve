import { Reservation } from '../types';

/**
 * Generates a high-resolution, beautifully styled .JPG card
 * highlighting the room allocation following the Bloco + Número standard (e.g. B204, C302).
 */
export async function generateReservationJpgDataUrl(res: Reservation): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 1500;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to create canvas context');

  // Background
  ctx.fillStyle = '#FAFAFE';
  ctx.fillRect(0, 0, width, height);

  // Top header brand banner (Deep Navy / Royal Blue gradient)
  const gradient = ctx.createLinearGradient(0, 0, width, 260);
  gradient.addColorStop(0, '#002B8A');
  gradient.addColorStop(1, '#1D4ED8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, 260);

  // Brand title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('LabReserve', 70, 95);

  ctx.fillStyle = '#93C5FD';
  ctx.font = '600 24px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('SISTEMA ACADÊMICO DE GESTÃO DE LABORATÓRIOS', 70, 135);

  // Official badge on top right
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.roundRect(width - 360, 60, 290, 56, 12);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText('ALOCAÇÃO OFICIAL', width - 330, 96);

  // Main Card Canvas Container
  const cardX = 60;
  const cardY = 200;
  const cardW = width - 120;
  const cardH = height - 280;

  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 20, 80, 0.12)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 15;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 28);
  ctx.fill();
  ctx.shadowColor = 'transparent'; // reset shadow

  // Top Spotlight Ribbon inside card: ROOM CODE (Bloco + Número standard)
  const roomCode = res.assignedLabCode || 'B204';
  const location = res.assignedLocation || 'Bloco B, 2º Andar (Sala 204)';
  const labName = res.assignedLabName || 'Laboratório de Desenvolvimento';

  // Room Banner Container
  const roomBannerY = cardY + 36;
  ctx.fillStyle = '#F0F5FF';
  ctx.beginPath();
  ctx.roundRect(cardX + 36, roomBannerY, cardW - 72, 220, 20);
  ctx.fill();

  // Status badge
  ctx.fillStyle = '#006C49';
  ctx.beginPath();
  ctx.roundRect(cardX + 66, roomBannerY + 28, 200, 38, 19);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SALA CONFIRMADA', cardX + 85, roomBannerY + 53);

  // Room Code Display (B204, C302, etc.)
  ctx.fillStyle = '#002B8A';
  ctx.font = '900 84px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`SALA ${roomCode}`, cardX + 66, roomBannerY + 140);

  ctx.fillStyle = '#4B5563';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${location.toUpperCase()} • ${labName}`, cardX + 68, roomBannerY + 185);

  // Details Grid
  let contentY = roomBannerY + 280;

  // Row 1: Disciplina & Capacidade Alocada (Removed Turma Designada)
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('DISCIPLINA', cardX + 50, contentY);
  ctx.fillText('CAPACIDADE ALOCADA', cardX + 580, contentY);

  contentY += 36;
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(res.subject, cardX + 50, contentY);
  ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${res.studentsCount} Alunos (1 PC por aluno)`, cardX + 580, contentY);

  contentY += 60;
  // Row 2: Professor & SIAPE
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('DOCENTE RESPONSÁVEL', cardX + 50, contentY);
  ctx.fillText('TOTAL DE ESTAÇÕES DA SALA', cardX + 580, contentY);

  contentY += 36;
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${res.professorName} (SIAPE: ${res.siape})`, cardX + 50, contentY);
  ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${res.totalStations || res.studentsCount} Computadores`, cardX + 580, contentY);

  contentY += 60;
  // Row 3: Data e Horário
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('DATA DA AULA', cardX + 50, contentY);
  ctx.fillText('HORÁRIO & DURAÇÃO', cardX + 580, contentY);

  contentY += 36;
  ctx.fillStyle = '#1D4ED8';
  ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(res.dateFormatted, cardX + 50, contentY);
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${res.startTime} às ${res.endTime} (${res.durationStr})`, cardX + 580, contentY);

  contentY += 60;
  // Row 4: Softwares Homologados
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('AMBIENTE & SOFTWARES INSTALADOS NAS MÁQUINAS', cardX + 50, contentY);

  contentY += 32;
  const softwareList = res.requiredSoftware.length > 0 ? res.requiredSoftware.join('  •  ') : 'Configuração Padrão do DTI';
  ctx.fillStyle = '#374151';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(softwareList, cardX + 50, contentY);

  // Perforated dividing line
  contentY += 60;
  ctx.setLineDash([12, 10]);
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cardX + 40, contentY);
  ctx.lineTo(cardX + cardW - 40, contentY);
  ctx.stroke();
  ctx.setLineDash([]); // reset

  // Ticket Footer: Clean Official Academic Notice (Digital Key removed)
  contentY += 50;
  ctx.fillStyle = '#F0FDF4';
  ctx.beginPath();
  ctx.roundRect(cardX + 40, contentY, cardW - 80, 140, 16);
  ctx.fill();

  ctx.fillStyle = '#166534';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('ALOCAÇÃO CONFIRMADA PELO DEPARTAMENTO DE TI', cardX + 70, contentY + 48);

  ctx.fillStyle = '#374151';
  ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('O laboratório estará higienizado e com as máquinas preparadas para o horário da aula.', cardX + 70, contentY + 86);
  ctx.fillText(`Localização: ${location}`, cardX + 70, contentY + 116);

  // Protocol & timestamp at the very bottom
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Protocolo Oficial: ${res.protocol} • Emitido em: ${new Date().toLocaleDateString('pt-BR')} • DTI Campus`, cardX + 40, cardY + cardH - 30);

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Downloads the card as a JPEG file
 */
export async function downloadReservationJpg(res: Reservation): Promise<void> {
  const dataUrl = await generateReservationJpgDataUrl(res);
  const link = document.createElement('a');
  const room = (res.assignedLabCode || 'SALA').replace(/\s+/g, '-');
  link.download = `comprovante-reserva-${room}-${res.dateStr}.jpg`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Shares the card using Web Share API with File fallback
 */
export async function shareReservationJpg(res: Reservation): Promise<void> {
  const dataUrl = await generateReservationJpgDataUrl(res);
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const room = res.assignedLabCode || 'SALA';
  const file = new File([blob], `comprovante-reserva-${room}.jpg`, { type: 'image/jpeg' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `Reserva Sala ${room} - ${res.subject}`,
        text: `Comprovante oficial de alocação de sala ${room} (${res.assignedLocation || 'Campus'}) para a aula de ${res.subject}.`,
      });
      return;
    } catch {
      // User cancelled share or not supported
    }
  }

  // Fallback to download
  await downloadReservationJpg(res);
}
