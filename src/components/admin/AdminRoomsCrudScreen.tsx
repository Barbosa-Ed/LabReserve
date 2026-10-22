import React, { useState } from 'react';
import { Lab, ScheduleSlot } from '../../types';
import { SOFTWARE_CATEGORIES } from '../../data/mockData';

interface AdminRoomsCrudScreenProps {
  labs: Lab[];
  onSaveLab: (lab: Lab) => void;
  onDeleteLab: (labId: string) => void;
}

export const AdminRoomsCrudScreen: React.FC<AdminRoomsCrudScreenProps> = ({
  labs,
  onSaveLab,
  onDeleteLab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlock, setFilterBlock] = useState('all');

  // Modal states for Create / Edit
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [labToDelete, setLabToDelete] = useState<Lab | null>(null);

  // Inspector of schedule slots for a room
  const [inspectingLabSchedule, setInspectingLabSchedule] = useState<Lab | null>(null);

  // Form Fields
  const [block, setBlock] = useState('Bloco C');
  const [floor, setFloor] = useState('3º Andar');
  const [roomNumber, setRoomNumber] = useState('302');
  const [name, setName] = useState('Macintosh Studio & Design');
  const [category, setCategory] = useState('Design Digital & Mobile');
  const [capacity, setCapacity] = useState(30);
  const [cpu, setCpu] = useState('Apple M3 8-Core');
  const [ram, setRam] = useState('16GB');
  const [storage, setStorage] = useState('SSD 512GB');
  const [status, setStatus] = useState<'livre' | 'reservada' | 'manutencao'>('livre');
  const [installedSoftware, setInstalledSoftware] = useState<string[]>(['VS Code', 'Xcode 15']);
  const [customSoftwareInput, setCustomSoftwareInput] = useState('');

  // Amenities
  const [airConditioned, setAirConditioned] = useState(true);
  const [projector, setProjector] = useState('Projetor 4K Ultra');
  const [whiteBoard, setWhiteBoard] = useState(true);
  const [noBreak, setNoBreak] = useState(true);

  // Derived Standard Room Code: Bloco letter + Room number, e.g. "C" + "302" = "C302"
  const getDerivedCode = (b: string, num: string) => {
    const blockLetter = b.replace(/[^A-Za-z]/g, '').toUpperCase() || 'C';
    const cleanNum = num.replace(/\D/g, '') || '302';
    return `${blockLetter}${cleanNum}`;
  };

  const currentCode = getDerivedCode(block, roomNumber);

  const handleOpenCreate = () => {
    setEditingLab(null);
    setBlock('Bloco C');
    setFloor('3º Andar');
    setRoomNumber('302');
    setName('Laboratório de Informática Aplicada');
    setCategory('Desenvolvimento & Sistemas');
    setCapacity(35);
    setCpu('Intel Core i7');
    setRam('16GB RAM');
    setStorage('SSD 512GB');
    setStatus('livre');
    setInstalledSoftware(['VS Code', 'Git', 'PostgreSQL']);
    setAirConditioned(true);
    setProjector('Projetor FullHD');
    setWhiteBoard(true);
    setNoBreak(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lab: Lab) => {
    setEditingLab(lab);
    setBlock(lab.block || 'Bloco B');
    setFloor(lab.floor || '2º Andar');
    setRoomNumber(lab.roomNumber || '204');
    setName(lab.name.includes('-') ? lab.name.split('-')[1].trim() : lab.name);
    setCategory(lab.category || 'Geral');
    setCapacity(lab.capacity);
    setCpu(lab.cpu || 'Intel Core i7');
    setRam(lab.ram || '16GB RAM');
    setStorage(lab.storage || 'SSD 512GB');
    setStatus(lab.status);
    setInstalledSoftware([...lab.installedSoftware]);
    setAirConditioned(lab.airConditioned);
    setProjector(lab.projector);
    setWhiteBoard(lab.whiteBoard);
    setNoBreak(lab.noBreak);
    setIsModalOpen(true);
  };

  const handleAddCustomSoftware = () => {
    if (customSoftwareInput.trim() && !installedSoftware.includes(customSoftwareInput.trim())) {
      setInstalledSoftware([...installedSoftware, customSoftwareInput.trim()]);
      setCustomSoftwareInput('');
    }
  };

  const handleToggleSoftware = (soft: string) => {
    setInstalledSoftware((prev) =>
      prev.includes(soft) ? prev.filter((s) => s !== soft) : [...prev, soft]
    );
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCode = getDerivedCode(block, roomNumber);
    const labData: Lab = {
      id: editingLab ? editingLab.id : `lab-${finalCode.toLowerCase()}-${Date.now()}`,
      code: finalCode,
      name: `${finalCode} - ${name.trim()}`,
      category: category.trim(),
      block: block.trim(),
      floor: floor.trim(),
      roomNumber: roomNumber.trim(),
      capacity: Number(capacity) || 30,
      cpu: cpu.trim() || 'Intel Core i7',
      ram: ram.trim() || '16GB',
      storage: storage.trim() || 'SSD 512GB',
      installedSoftware,
      airConditioned,
      projector,
      whiteBoard,
      noBreak,
      availableHours: '08:00 às 22:00',
      status,
      scheduleSlots: editingLab?.scheduleSlots || [],
      image: editingLab?.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    };

    onSaveLab(labData);
    setIsModalOpen(false);
  };

  const filteredLabs = labs.filter((lab) => {
    if (filterBlock !== 'all' && !lab.block.toLowerCase().includes(filterBlock.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        lab.code.toLowerCase().includes(q) ||
        lab.name.toLowerCase().includes(q) ||
        lab.installedSoftware.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Header */}
      <section className="px-gutter pt-4 pb-2 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold">
                Administração
              </span>
              <span className="text-on-surface-variant font-label-sm">• Catálogo de Salas</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight mt-1">
              Gerenciar Salas e Laboratórios
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Cadastre e gerencie a infraestrutura seguindo o padrão de nomenclatura <strong>Bloco + Número</strong> (ex: <code>C302</code>, <code>B204</code>), defina softwares homologados, capacidade e acompanhe a disponibilidade.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-bold flex items-center gap-2 hover:bg-primary transition-all shadow-sm active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[20px]">add_box</span>
            Cadastrar Nova Sala
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-3 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por código (ex: C302, B204), software ou nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
            />
          </div>

          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="h-11 px-3 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
          >
            <option value="all">Todos os Blocos</option>
            <option value="bloco a">Bloco A</option>
            <option value="bloco b">Bloco B</option>
            <option value="bloco c">Bloco C</option>
            <option value="bloco d">Bloco D</option>
          </select>
        </div>
      </section>

      {/* Rooms Table / Cards Grid */}
      <section className="px-gutter py-2 flex flex-col gap-3">
        {filteredLabs.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-8 text-center text-on-surface-variant border border-outline-variant/30">
            <span className="material-symbols-outlined text-[48px] opacity-40 mb-2">meeting_room</span>
            <p className="font-title-md text-title-md font-semibold text-on-surface">Nenhuma sala encontrada</p>
            <p className="font-body-sm text-body-sm mt-1">Tente ajustar seus termos de busca ou cadastre uma nova sala.</p>
          </div>
        ) : (
          filteredLabs.map((lab) => {
            const hasSlots = lab.scheduleSlots && lab.scheduleSlots.length > 0;
            return (
              <article
                key={lab.id}
                className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex flex-col gap-3 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-primary text-on-primary flex flex-col items-center justify-center font-bold shadow-sm shrink-0">
                      <span className="font-headline-sm text-headline-sm font-mono tracking-tight leading-none">
                        {lab.code}
                      </span>
                      <span className="text-[10px] uppercase opacity-80 mt-0.5">{lab.block}</span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="font-title-md text-title-md text-on-surface font-bold">
                          {lab.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          lab.status === 'livre'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : lab.status === 'reservada'
                            ? 'bg-primary-fixed text-on-primary-fixed'
                            : 'bg-error-container text-on-error-container'
                        }`}>
                          {lab.status === 'livre' ? 'Livre' : lab.status === 'reservada' ? 'Em Uso' : 'Manutenção'}
                        </span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {lab.block} • {lab.floor} (Sala {lab.roomNumber}) • {lab.category}
                      </span>
                    </div>
                  </div>

                  {/* Quick specs badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-primary">desktop_windows</span>
                      {lab.capacity} computadores
                    </span>
                  </div>
                </div>

                {/* Softwares Homologados */}
                <div className="flex flex-col gap-1 bg-surface-container-low p-2.5 rounded-xl">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                    Softwares Instalados ({lab.installedSoftware.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lab.installedSoftware.map((soft) => (
                      <span
                        key={soft}
                        className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-medium"
                      >
                        {soft}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Schedule preview & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-outline-variant/15">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectingLabSchedule(lab)}
                      className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1.5 hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-primary">calendar_month</span>
                      Ver Ocupação ({hasSlots ? lab.scheduleSlots!.length : 0} aulas)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(lab)}
                      className="px-3 py-1.5 rounded-lg bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold flex items-center gap-1 hover:bg-primary-fixed-dim transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Editar Sala
                    </button>

                    <button
                      type="button"
                      onClick={() => setLabToDelete(lab)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors cursor-pointer"
                      title="Excluir Sala"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-xl rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold font-mono">
                  {currentCode}
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {editingLab ? `Editar Sala ${editingLab.code}` : 'Cadastrar Nova Sala'}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Nomenclatura padrão: <strong>{currentCode}</strong> ({block}, Sala {roomNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
              {/* Standard Code Builder: Bloco + Número */}
              <div className="grid grid-cols-3 gap-2.5 bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-bold block mb-1">
                    Bloco
                  </label>
                  <select
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant/40"
                  >
                    <option value="Bloco A">Bloco A</option>
                    <option value="Bloco B">Bloco B</option>
                    <option value="Bloco C">Bloco C</option>
                    <option value="Bloco D">Bloco D</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-bold block mb-1">
                    Andar
                  </label>
                  <select
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant/40"
                  >
                    <option value="Térreo">Térreo</option>
                    <option value="1º Andar">1º Andar</option>
                    <option value="2º Andar">2º Andar</option>
                    <option value="3º Andar">3º Andar</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-bold block mb-1">
                    Número (ex: 302)
                  </label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="302"
                    className="w-full h-11 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-outline-variant/40 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Nome Descritivo & Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Nome Descritivo da Sala
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Laboratório de Desenvolvimento"
                    className="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/30"
                  />
                </div>

                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                    Tamanho (Capacidade de Máquinas)
                  </label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={100}
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
                    className="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/30 font-bold"
                  />
                </div>
              </div>

              {/* Status da Sala */}
              <div>
                <label className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
                  Status Operacional Geral
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('livre')}
                    className={`h-11 rounded-lg font-label-md text-label-md font-bold transition-all ${
                      status === 'livre'
                        ? 'bg-secondary text-on-secondary shadow-sm'
                        : 'bg-surface-container-low text-on-surface'
                    }`}
                  >
                    Livre
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('reservada')}
                    className={`h-11 rounded-lg font-label-md text-label-md font-bold transition-all ${
                      status === 'reservada'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface'
                    }`}
                  >
                    Reservada
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('manutencao')}
                    className={`h-11 rounded-lg font-label-md text-label-md font-bold transition-all ${
                      status === 'manutencao'
                        ? 'bg-error text-on-error shadow-sm'
                        : 'bg-surface-container-low text-on-surface'
                    }`}
                  >
                    Manutenção
                  </button>
                </div>
              </div>

              {/* Softwares Instalados */}
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface font-semibold block">
                  Softwares Homologados na Sala
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar software ou pacote (ex: Docker, SolidWorks)..."
                    value={customSoftwareInput}
                    onChange={(e) => setCustomSoftwareInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSoftware();
                      }
                    }}
                    className="flex-1 h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/30"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSoftware}
                    className="px-4 h-11 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-bold hover:bg-surface-container-high"
                  >
                    Adicionar
                  </button>
                </div>

                {/* Popular Software Quick Picks */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {SOFTWARE_CATEGORIES.flatMap((c) => c.items).slice(0, 10).map((soft) => {
                    const isSelected = installedSoftware.includes(soft);
                    return (
                      <button
                        key={soft}
                        type="button"
                        onClick={() => handleToggleSoftware(soft)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {isSelected ? 'check' : 'add'}
                        </span>
                        {soft}
                      </button>
                    );
                  })}
                </div>

                {/* Selected software chips */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {installedSoftware.map((soft) => (
                    <span
                      key={soft}
                      className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold flex items-center gap-1"
                    >
                      {soft}
                      <button
                        type="button"
                        onClick={() => handleToggleSoftware(soft)}
                        className="hover:text-error"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Hardware / Amenities Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-outline-variant/20">
                <label className="flex items-center gap-2 cursor-pointer font-body-sm text-body-sm">
                  <input
                    type="checkbox"
                    checked={airConditioned}
                    onChange={(e) => setAirConditioned(e.target.checked)}
                    className="w-4 h-4 rounded text-primary"
                  />
                  Climatizado
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-body-sm text-body-sm">
                  <input
                    type="checkbox"
                    checked={whiteBoard}
                    onChange={(e) => setWhiteBoard(e.target.checked)}
                    className="w-4 h-4 rounded text-primary"
                  />
                  Quadro Branco
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-body-sm text-body-sm">
                  <input
                    type="checkbox"
                    checked={noBreak}
                    onChange={(e) => setNoBreak(e.target.checked)}
                    className="w-4 h-4 rounded text-primary"
                  />
                  Nobreak Central
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-body-sm text-body-sm">
                  <input
                    type="checkbox"
                    checked={projector !== ''}
                    onChange={(e) => setProjector(e.target.checked ? 'Projetor 4K' : '')}
                    className="w-4 h-4 rounded text-primary"
                  />
                  Projetor
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-all shadow-sm active:scale-95"
                >
                  Salvar Sala
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE INSPECTOR MODAL */}
      {inspectingLabSchedule && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setInspectingLabSchedule(null)}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold font-mono text-lg">
                  {inspectingLabSchedule.code}
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Agenda & Ocupação: Sala {inspectingLabSchedule.code}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {inspectingLabSchedule.name} • {inspectingLabSchedule.capacity} Estações
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingLabSchedule(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3">
              {(!inspectingLabSchedule.scheduleSlots || inspectingLabSchedule.scheduleSlots.length === 0) ? (
                <div className="p-6 text-center text-on-surface-variant bg-surface-container-low rounded-xl">
                  <span className="material-symbols-outlined text-[36px] opacity-40 mb-1">event_available</span>
                  <p className="font-title-md text-title-md font-bold text-on-surface">Sala 100% Livre</p>
                  <p className="font-body-sm text-body-sm mt-0.5">Nenhum bloco de aula alocado atualmente para esta sala.</p>
                </div>
              ) : (
                inspectingLabSchedule.scheduleSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">schedule</span>
                      <div className="flex flex-col">
                        <span className="font-title-md text-title-md text-on-surface font-bold">
                          {slot.subject}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Docente: {slot.professorName}
                        </span>
                        <span className="text-xs font-mono text-primary font-bold mt-1">
                          📅 {slot.date} • ⏰ {slot.startTime} às {slot.endTime}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold shrink-0">
                      Reservada
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setInspectingLabSchedule(null)}
              className="w-full h-11 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-bold hover:bg-surface-container-high transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {labToDelete && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLabToDelete(null)}
        >
          <div
            className="bg-surface-container-lowest w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">delete_forever</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Excluir Sala {labToDelete.code}?
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 mb-4">
              A sala <strong>{labToDelete.name}</strong> ({labToDelete.block}) e seus softwares vinculados serão removidos do catálogo de alocação acadêmica.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLabToDelete(null)}
                className="flex-1 h-11 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteLab(labToDelete.id);
                  setLabToDelete(null);
                }}
                className="flex-1 h-11 rounded-xl bg-error text-on-error font-label-md text-label-md font-bold"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
