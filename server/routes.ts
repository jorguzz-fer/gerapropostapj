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
    const consultor = await storage.createConsultor(parsed.data as any);
    res.status(201).json(consultor);
  });

  app.put("/api/consultores/:id", async (req, res) => {
    const updated = await storage.updateConsultor(req.params.id, req.body);
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
      const proposta = await storage.createProposta(parsed.data as any);
      res.status(201).json(proposta);
    } catch (error: any) {
      console.error("Erro ao criar proposta:", error);
      res.status(500).json({ message: error.message || "Erro interno ao criar proposta" });
    }
  });

  app.put("/api/propostas/:id", async (req, res) => {
    const updated = await storage.updateProposta(req.params.id, req.body);
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

    // Log envio(s)
    if (metodo === "EMAIL" || metodo === "AMBOS") {
      if (proposta.clienteEmail) {
        // Construct Email HTML
        const formatCurrency = (val: string | number) =>
          new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(val));

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background-color: #0f172a; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: #f97316; margin: 0;">Nova Proposta WOW+</h1>
            </div>
            <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Olá <strong>${proposta.clienteNome}</strong>,</p>
              <p>Segue abaixo a proposta solicitada:</p>
              
              <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <h3 style="margin-top: 0; color: #0f172a;">${proposta.titulo}</h3>
                <p style="color: #64748b; font-size: 14px;">${proposta.descricao || ""}</p>
                <div style="border-top: 1px solid #cbd5e1; margin-top: 12px; padding-top: 12px;">
                  <strong style="color: #0f172a; font-size: 18px;">Valor Total: ${formatCurrency(proposta.valorTotal || 0)}</strong>
                </div>
              </div>

              <p>O consultor <strong>${proposta.consultorId ? "responsável" : ""}</strong> entrará em contato em breve.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">WOW+ Saúde - Soluções em Benefícios</p>
            </div>
          </div>
        `;

        const emailSent = await sendEmail({
          to: proposta.clienteEmail,
          subject: `Proposta WOW+: ${proposta.titulo}`,
          html: emailHtml,
          // Consultant Email as CC if available is not directly in proposal object, would need join. 
          // For now, simple send to client.
          bcc: ["contato@wowmais.com.br"]
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
        await storage.createEnvio({
          propostaId: proposta.id,
          metodo: "WHATSAPP",
          destinatario: proposta.clienteWhatsapp,
          status: "ENVIADO",
        });
      }
    }

    // Update proposta status
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
    const updated = await storage.updateMeta(req.params.id, req.body);
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
