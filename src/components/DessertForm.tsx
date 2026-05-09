import { useState, FormEvent } from 'react';

interface DessertFormProps {
  onSubmit: (name: string, description: string) => void;
}

export default function DessertForm({ onSubmit }: DessertFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name, description);
    setName('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 border-2 border-border-soft shadow-[10px_10px_0px_#D9C5B2]">
      <div className="space-y-8">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-text-accent mb-3">Identificação do Produto</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="NOME TÉCNICO DO DOCE"
            className="w-full px-5 py-4 border-2 border-border-soft focus:border-text-dark outline-none transition-all placeholder:text-border-soft/60 uppercase font-serif font-black tracking-tight text-xl"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-text-accent mb-3">Memorial Descritivo</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes sobre a composição, validade ou observações técnicas..."
            className="w-full px-5 py-4 border-2 border-border-soft focus:border-text-dark outline-none transition-all placeholder:text-border-soft/60 min-h-[160px] text-sm font-medium italic leading-relaxed"
          />
        </div>
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-text-dark text-white py-5 text-sm uppercase tracking-[0.3em] font-bold hover:bg-black transition-all active:scale-[0.99] shadow-lg shadow-black/10"
          >
            Registrar Ficha Técnica
          </button>
        </div>
      </div>
    </form>
  );
}
