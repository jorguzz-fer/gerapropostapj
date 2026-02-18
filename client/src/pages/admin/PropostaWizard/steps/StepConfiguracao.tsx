import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, User, Building2, Mail, Phone } from "lucide-react";
import type { PropostaFormData } from "../index";
import { propostaService } from "@/lib/propostaService";

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

interface Props {
  data: PropostaFormData;
  onChange: (data: Partial<PropostaFormData>) => void;
  onNext: () => void;
}

export default function StepConfiguracao({ data, onChange, onNext }: Props) {
  const [consultores, setConsultores] = useState<any[]>([]);

  useEffect(() => {
    propostaService.listConsultores().then(setConsultores).catch(() => { });
  }, []);

  const handleConsultorSelect = (id: string) => {
    const consultor = consultores.find((c) => c.id === id);
    if (consultor) {
      onChange({
        consultorId: consultor.id,
        consultorNome: consultor.nome,
        // consultorIdCodigo: consultor.idConsultor, // Legacy
        consultorEmail: consultor.email,
        consultorTelefone: consultor.telefone || consultor.whatsapp,
      });
    }
  };

  const fillMockData = () => {
    const consultor = consultores[0];
    const mock = {
      // Consultor (use first available or default)
      consultorId: consultor?.id || "",
      consultorNome: consultor?.nome || "Consultor Teste",
      consultorEmail: consultor?.email || "consultor@teste.com",
      consultorTelefone: consultor?.telefone || "11999999999",

      // Cliente
      clienteNome: "Empresa Teste Ltda",
      clienteEmpresa: "Empresa Teste",
      clienteEmail: "cliente@teste.com",
      clienteWhatsapp: "11988888888",
      clienteCnpj: "00.000.000/0001-00",
      clienteEstado: "SP",
      clienteCidade: "São Paulo",

      // Conteúdo
      titulo: "Proposta Comercial - Plano Corporativo",
      descricao: "Proposta referente a consultoria de benefícios.",
      itens: [
        { descricao: "Plano Individual PJ", quantidade: 2, valorUnitario: 150, valorTotal: 300 },
        { descricao: "Odonto individual PJ", quantidade: 1, valorUnitario: 50, valorTotal: 50 }
      ],
      validadeDias: 30,
      observacoes: "Validade sujeita a aprovação.",
      valorTotal: 350
    };
    onChange(mock);
  };

  const isValid =
    data.clienteNome.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Consultor */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-primary" />
            Dados do Consultor
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {consultores.length > 0 ? (
            <div>
              <Label>Selecionar Consultor Cadastrado</Label>
              <Select value={data.consultorId} onValueChange={handleConsultorSelect}>
                <SelectTrigger className="h-12 bg-slate-50">
                  <SelectValue placeholder="Selecione um consultor..." />
                </SelectTrigger>
                <SelectContent>
                  {consultores.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome} — {c.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                Nome do Consultor
              </Label>
              <Input
                placeholder="Nome completo"
                value={data.consultorNome}
                onChange={(e) => onChange({ consultorNome: e.target.value })}
                className="h-12 bg-slate-50"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">Email do Consultor</Label>
              <Input
                type="email"
                placeholder="consultor@wowmais.com.br"
                value={data.consultorEmail}
                onChange={(e) => onChange({ consultorEmail: e.target.value })}
                className="h-12 bg-slate-50"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">Telefone/WhatsApp</Label>
              <Input
                placeholder="(11) 99999-9999"
                value={data.consultorTelefone}
                onChange={(e) => onChange({ consultorTelefone: e.target.value })}
                className="h-12 bg-slate-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cliente */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-primary" />
            Dados do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                Nome / Razão Social *
              </Label>
              <Input
                placeholder="Nome do cliente ou empresa"
                value={data.clienteNome}
                onChange={(e) => onChange({ clienteNome: e.target.value })}
                className="h-12 bg-slate-50"
              />
            </div>
            <div>
              <Label>Empresa</Label>
              <Input
                placeholder="Nome fantasia"
                value={data.clienteEmpresa}
                onChange={(e) => onChange({ clienteEmpresa: e.target.value })}
                className="h-12 bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                Email do Cliente
              </Label>
              <Input
                type="email"
                placeholder="email@empresa.com"
                value={data.clienteEmail}
                onChange={(e) => onChange({ clienteEmail: e.target.value })}
                className="h-12 bg-slate-50"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                WhatsApp do Cliente
              </Label>
              <Input
                placeholder="(11) 99999-9999"
                value={data.clienteWhatsapp}
                onChange={(e) => onChange({ clienteWhatsapp: e.target.value })}
                className="h-12 bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>CNPJ</Label>
              <Input
                placeholder="00.000.000/0000-00"
                value={data.clienteCnpj}
                onChange={(e) => onChange({ clienteCnpj: e.target.value })}
                className="h-12 bg-slate-50"
              />
            </div>
            <div>
              <Label>Estado (UF)</Label>
              <Select value={data.clienteEstado} onValueChange={(v) => onChange({ clienteEstado: v })}>
                <SelectTrigger className="h-12 bg-slate-50">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_BR.map((uf) => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cidade</Label>
              <Input
                placeholder="Cidade"
                value={data.clienteCidade}
                onChange={(e) => onChange({ clienteCidade: e.target.value })}
                className="h-12 bg-slate-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={fillMockData}
          className="h-14 px-6 text-slate-500 border-dashed border-slate-300 hover:border-primary hover:text-primary"
        >
          🪄 Preencher Teste
        </Button>

        <Button
          onClick={onNext}
          disabled={!isValid}
          className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg shadow-orange-500/20"
        >
          Próximo: Conteúdo
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
