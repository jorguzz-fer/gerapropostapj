import React from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, User, Building2, DollarSign, ArrowRight, FileText, Mail, Phone } from "lucide-react";

// Schema for validation
const formSchema = z.object({
  companyName: z.string().min(2, "Nome da empresa é obrigatório"),
  employees: z.coerce.number().min(1, "Mínimo de 1 colaborador"),
  price: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  consultorNome: z.string().min(2, "Nome do consultor é obrigatório"),
  consultorId: z.string().min(1, "ID do consultor é obrigatório"),
  clienteEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  clienteWhatsapp: z.string().optional(),
  logoUrl: z.string().optional(),
});

export default function ConsultantForm() {
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      employees: 0,
      price: 19.90,
      consultorNome: "",
      consultorId: "",
      clienteEmail: "",
      clienteWhatsapp: "",
      logoUrl: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Navigate to proposal with query params
    const params = new URLSearchParams();
    params.append("company", values.companyName);
    params.append("employees", values.employees.toString());
    params.append("price", values.price.toString());
    params.append("consultorNome", values.consultorNome);
    params.append("consultorId", values.consultorId);
    if (values.clienteEmail) params.append("clienteEmail", values.clienteEmail);
    if (values.clienteWhatsapp) params.append("clienteWhatsapp", values.clienteWhatsapp);
    if (values.logoUrl) params.append("logo", values.logoUrl);

    setLocation(`/proposta?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-none">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl p-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-primary" />
            <span className="text-primary font-bold tracking-wider text-sm uppercase">Gerador de Propostas</span>
          </div>
          <CardTitle className="text-2xl font-bold">Nova Proposta WOW+</CardTitle>
          <CardDescription className="text-slate-400">
            Preencha os dados da empresa prospectada para gerar o link.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      Nome da Empresa
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Logmam Transportes Ltda." {...field} className="h-12 bg-slate-50 border-slate-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        Colaboradores
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="450" {...field} className="h-12 bg-slate-50 border-slate-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-500" />
                        Preço por Vida (R$)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="19.90" {...field} className="h-12 bg-slate-50 border-slate-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator className="my-4" />

              {/* Consultant Fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Dados do Consultor
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="consultorNome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-500" />
                          Nome do Consultor
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: João Silva" {...field} className="h-12 bg-slate-50 border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consultorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          ID do Consultor
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: CONS001" {...field} className="h-12 bg-slate-50 border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="my-4" />

              {/* Client Fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Dados do Cliente (Opcional)
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clienteEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-500" />
                          Email do Cliente
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="cliente@empresa.com" {...field} className="h-12 bg-slate-50 border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clienteWhatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-500" />
                          WhatsApp do Cliente
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} className="h-12 bg-slate-50 border-slate-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <Button type="submit" className="w-full h-14 text-lg bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg shadow-orange-500/20">
                Gerar Proposta
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
