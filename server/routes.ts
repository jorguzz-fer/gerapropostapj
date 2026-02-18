import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  createPropostaSchema,
  enviarPropostaSchema,
  createConsultorSchema,
  createMetaSchema,
} from "@shared/schema";
import { sendEmail } from "./services/email";

// Evita XSS ao inserir dados de usuário em HTML gerado
function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ==================== CONSULTORES ====================

  app.get("/api/consultores", async (_req, res) => {
    const consultores = await storage.getConsultores();
    res.json(consultores);
  });

  app.get("/api/consultores/:id", async (req, res) => {
    const consultor = await storage.getConsultor(req.params.id);
    if (!consultor) return res.status(404).json({ message: "Consultor não encontrado" });
    res.json(consultor);
  });

  app.post("/api/consultores", async (req, res) => {
    const parsed = createConsultorSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
    try {
      const consultor = await storage.createConsultor(parsed.data as any);
      res.status(201).json(consultor);
    } catch (error: any) {
      const isUniqueViolation = error?.code === "23505" || error?.message?.includes("unique");
      if (isUniqueViolation) {
        return res.status(409).json({ message: "Já existe um consultor com este email." });
      }
      console.error("Erro ao criar consultor:", error);
      res.status(500).json({ message: error?.message || "Erro ao salvar consultor." });
    }
  });

  app.put("/api/consultores/:id", async (req, res) => {
    const parsed = createConsultorSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
    const updated = await storage.updateConsultor(req.params.id, parsed.data as any);
    if (!updated) return res.status(404).json({ message: "Consultor não encontrado" });
    res.json(updated);
  });

  app.delete("/api/consultores/:id", async (req, res) => {
    const deleted = await storage.deleteConsultor(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Consultor não encontrado" });
    res.json({ message: "Consultor removido" });
  });

  // ==================== PROPOSTAS ====================

  app.get("/api/propostas", async (req, res) => {
    const filters = {
      status: req.query.status as string | undefined,
      estado: req.query.estado as string | undefined,
      consultorId: req.query.consultorId as string | undefined,
    };
    const propostas = await storage.getPropostas(filters);
    res.json(propostas);
  });

  app.get("/api/propostas/dashboard", async (_req, res) => {
    const metrics = await storage.getDashboardMetrics();
    res.json(metrics);
  });

  app.get("/api/propostas/:id", async (req, res) => {
    const proposta = await storage.getProposta(req.params.id);
    if (!proposta) return res.status(404).json({ message: "Proposta não encontrada" });
    res.json(proposta);
  });

  app.post("/api/propostas", async (req, res) => {
    const parsed = createPropostaSchema.safeParse(req.body);
    if (!parsed.success) {
      console.error("Erro validacao proposta:", JSON.stringify(parsed.error.format(), null, 2));
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }
    try {
      const payload = { ...parsed.data };
      if (payload.consultorId === "" || payload.consultorId === "mock-id") {
        payload.consultorId = undefined;
      }
      const proposta = await storage.createProposta(payload as any);
      res.status(201).json(proposta);
    } catch (error: any) {
      console.error("Erro ao criar proposta:", error);
      const detailedError = error instanceof Error ? error.message : JSON.stringify(error);
      const postgresError = error.detail ? ` - Detail: ${error.detail}` : "";
      res.status(500).json({ message: `Erro backend: ${detailedError}${postgresError}` });
    }
  });

  // Validação no PUT: aceita apenas campos editáveis da proposta
  app.put("/api/propostas/:id", async (req, res) => {
    const parsed = createPropostaSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
    const updated = await storage.updateProposta(req.params.id, parsed.data as any);
    if (!updated) return res.status(404).json({ message: "Proposta não encontrada" });
    res.json(updated);
  });

  app.delete("/api/propostas/:id", async (req, res) => {
    const deleted = await storage.deleteProposta(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Proposta não encontrada" });
    res.json({ message: "Proposta removida" });
  });

  // Enviar proposta
  app.post("/api/propostas/:id/enviar", async (req, res) => {
    const parsed = enviarPropostaSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

    const proposta = await storage.getProposta(req.params.id);
    if (!proposta) return res.status(404).json({ message: "Proposta não encontrada" });

    const { metodo } = parsed.data;

    if (metodo === "EMAIL" || metodo === "AMBOS") {
      if (proposta.clienteEmail) {
        let consultorEmail: string | null = null;
        if (proposta.consultorId) {
          const consultor = await storage.getConsultor(proposta.consultorId);
          consultorEmail = consultor?.email || null;
        }

        const formatCurrency = (val: string | number) =>
          new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(val));

        // Dados escapados para evitar XSS no email
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background-color: #0f172a; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: #f97316; margin: 0;">Nova Proposta WOW+</h1>
            </div>
            <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Olá <strong>${escapeHtml(proposta.clienteNome)}</strong>,</p>
              <p>Segue abaixo a proposta solicitada:</p>

              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <h3 style="margin-top: 0; color: #0f172a;">${escapeHtml(proposta.titulo)}</h3>
                <p style="color: #64748b; font-size: 14px;">${escapeHtml(proposta.descricao)}</p>
                <div style="border-top: 1px solid #cbd5e1; margin-top: 12px; padding-top: 12px;">
                  <strong style="color: #0f172a; font-size: 18px;">Valor Total: ${formatCurrency(proposta.valorTotal || 0)}</strong>
                </div>
              </div>

              <p>O consultor responsável entrará em contato em breve.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">WOW+ Saúde - Soluções em Benefícios</p>
            </div>
          </div>
        `;

        const toAddress = consultorEmail || proposta.clienteEmail;
        const ccAddresses: string[] = [];
        if (consultorEmail && proposta.clienteEmail) {
          ccAddresses.push(proposta.clienteEmail);
        }
        ccAddresses.push("contato@wowmais.com.br");

        const emailSent = await sendEmail({
          to: toAddress,
          subject: `Proposta WOW+: ${escapeHtml(proposta.titulo)}`,
          html: emailHtml,
          cc: ccAddresses,
        });

        await storage.createEnvio({
          propostaId: proposta.id,
          metodo: "EMAIL",
          destinatario: proposta.clienteEmail,
          status: emailSent ? "ENVIADO" : "FALHOU",
          errorMessage: emailSent ? null : "Erro ao enviar email via Resend",
        });
      }
    }

    if (metodo === "WHATSAPP" || metodo === "AMBOS") {
      if (proposta.clienteWhatsapp) {
        // WhatsApp: registra o envio como PENDENTE — integração real deve ser implementada
        await storage.createEnvio({
          propostaId: proposta.id,
          metodo: "WHATSAPP",
          destinatario: proposta.clienteWhatsapp,
          status: "PENDENTE",
        });
      }
    }

    const updated = await storage.updateProposta(proposta.id, {
      status: "ENVIADA",
      metodoEnvio: metodo,
      dataEnvio: new Date(),
      dataExpiracao: new Date(Date.now() + (proposta.validadeDias || 30) * 86400000),
    });

    res.json(updated);
  });

  // Envios de uma proposta
  app.get("/api/propostas/:id/envios", async (req, res) => {
    const envios = await storage.getEnviosByProposta(req.params.id);
    res.json(envios);
  });

  // ==================== METAS ====================

  app.get("/api/metas", async (_req, res) => {
    const metas = await storage.getMetas();
    res.json(metas);
  });

  app.get("/api/metas/:id", async (req, res) => {
    const meta = await storage.getMeta(req.params.id);
    if (!meta) return res.status(404).json({ message: "Meta não encontrada" });
    res.json(meta);
  });

  app.post("/api/metas", async (req, res) => {
    const parsed = createMetaSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
    const meta = await storage.createMeta(parsed.data as any);
    res.status(201).json(meta);
  });

  app.put("/api/metas/:id", async (req, res) => {
    const parsed = createMetaSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
    const updated = await storage.updateMeta(req.params.id, parsed.data as any);
    if (!updated) return res.status(404).json({ message: "Meta não encontrada" });
    res.json(updated);
  });

  app.delete("/api/metas/:id", async (req, res) => {
    const deleted = await storage.deleteMeta(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Meta não encontrada" });
    res.json({ message: "Meta removida" });
  });

  return httpServer;
}
