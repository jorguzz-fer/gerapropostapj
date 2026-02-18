import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Plus, Trash2, FileText, DollarSign, Calendar } from "lucide-react";
import type { PropostaFormData, PropostaItemForm } from "../index";

const ITEM_OPTIONS = [
  "Plano Individual PJ",
  "Plano Família PJ",
  "Odonto individual PJ",
  "Odonto familia PJ"
];

interface Props {
  data: PropostaFormData;
  onChange: (data: Partial<PropostaFormData>) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function StepConteudo({ data, onChange, onBack, onNext }: Props) {
  // Set default title if empty
  if (!data.titulo) {
    setTimeout(() => onChange({ titulo: "Proposta Comercial - Plano Pessoa Jurídica" }), 0);
  }

  const updateItem = (index: number, field: keyof PropostaItemForm, value: string | number) => {
    const newItens = [...data.itens];
    (newItens[index] as any)[field] = value;
    // Auto-calc valorTotal
    if (field === "quantidade" || field === "valorUnitario") {
      newItens[index].valorTotal = newItens[index].quantidade * newItens[index].valorUnitario;
    }
    const valorTotal = newItens.reduce((sum, item) => sum + item.valorTotal, 0);
    onChange({ itens: newItens, valorTotal });
  };

  const addItem = () => {
    onChange({
      itens: [...data.itens, { descricao: "", quantidade: 1, valorUnitario: 0, valorTotal: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (data.itens.length <= 1) return;
    const newItens = data.itens.filter((_, i) => i !== index);
    const valorTotal = newItens.reduce((sum, item) => sum + item.valorTotal, 0);
    onChange({ itens: newItens, valorTotal });
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const isValid = data.titulo.trim().length > 0 && data.itens.some((i) => i.descricao.trim().length > 0);

  return (
    <div className="space-y-6">
      {/* Título e Descrição */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Detalhes da Proposta
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Título da Proposta *</Label>
            <Input
              placeholder="Proposta Comercial - Plano Pessoa Jurídica"
              value={data.titulo}
              onChange={(e) => onChange({ titulo: e.target.value })}
              className="h-12 bg-slate-50"
            />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea
              placeholder="Descrição geral da proposta..."
              value={data.descricao}
              onChange={(e) => onChange({ descricao: e.target.value })}
              className="bg-slate-50 min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                Validade (Meses)
              </Label>
              <Select
                value={data.validadeDias === 365 ? "12" : "6"}
                onValueChange={(v) => onChange({ validadeDias: v === "12" ? 365 : 180 })}
              >
                <SelectTrigger className="h-12 bg-slate-50">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 Meses</SelectItem>
                  <SelectItem value="12">12 Meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Input
                placeholder="Observações adicionais"
                value={data.observacoes}
                onChange={(e) => onChange({ observacoes: e.target.value })}
                className="h-12 bg-slate-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Itens */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-primary" />
              Itens da Proposta
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {data.itens.map((item, index) => (
            <div key={index} className="flex gap-3 items-start p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-xs text-slate-500">Descrição</Label>
                  <Select
                    value={item.descricao}
                    onValueChange={(v) => updateItem(index, "descricao", v)}
                  >
                    <SelectTrigger className="h-10 bg-white">
                      <SelectValue placeholder="Selecione o plano..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-slate-500">Qtd</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => updateItem(index, "quantidade", parseInt(e.target.value) || 1)}
                      className="h-10 bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Valor Unit. (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.valorUnitario}
                      onChange={(e) => updateItem(index, "valorUnitario", parseFloat(e.target.value) || 0)}
                      className="h-10 bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Total</Label>
                    <div className="h-10 flex items-center px-3 bg-slate-100 rounded-md text-sm font-semibold text-slate-700">
                      {formatCurrency(item.valorTotal)}
                    </div>
                  </div>
                </div>
              </div>
              {data.itens.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-red-500 hover:bg-red-50 mt-6">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}

          {/* Total */}
          <div className="flex justify-end p-4 bg-slate-900 rounded-lg text-white">
            <div className="text-right">
              <p className="text-sm text-slate-400">Valor Total da Proposta</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(data.valorTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="h-14 px-8 text-lg rounded-xl">
          <ArrowLeft className="mr-2 w-5 h-5" />
          Voltar
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg shadow-orange-500/20"
        >
          Próximo: Revisão e Envio
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
