import {
    type User, type InsertUser,
    type Consultor, type InsertConsultor,
    type Proposta, type InsertProposta,
    type PropostaEnvio, type InsertPropostaEnvio,
    type MetaProposta, type InsertMetaProposta,
    type PropostaItem,
    users, consultores, propostas, propostaEnvios, metasPropostas
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { type IStorage, type PropostaFilters, type DashboardMetrics } from "./storage";

export class PostgresStorage implements IStorage {
    // Users
    async getUser(id: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user;
    }

    async createUser(user: InsertUser): Promise<User> {
        const [newUser] = await db.insert(users).values(user).returning();
        return newUser;
    }

    // Consultores
    async getConsultores(): Promise<Consultor[]> {
        return await db.select().from(consultores).orderBy(desc(consultores.createdAt));
    }

    async getConsultor(id: string): Promise<Consultor | undefined> {
        const [consultor] = await db.select().from(consultores).where(eq(consultores.id, id));
        return consultor;
    }

    async createConsultor(data: InsertConsultor): Promise<Consultor> {
        const [newConsultor] = await db.insert(consultores).values(data).returning();
        return newConsultor;
    }

    async updateConsultor(id: string, data: Partial<InsertConsultor>): Promise<Consultor | undefined> {
        const [updated] = await db
            .update(consultores)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(consultores.id, id))
            .returning();
        return updated;
    }

    async deleteConsultor(id: string): Promise<boolean> {
        const [deleted] = await db.delete(consultores).where(eq(consultores.id, id)).returning();
        return !!deleted;
    }

    // Propostas
    async getPropostas(filters?: PropostaFilters): Promise<Proposta[]> {
        const conditions = [];
        if (filters?.status) conditions.push(eq(propostas.status, filters.status as any));
        if (filters?.estado) conditions.push(eq(propostas.clienteEstado, filters.estado));
        if (filters?.consultorId) conditions.push(eq(propostas.consultorId, filters.consultorId));

        // Note: Drizzle's 'and' expects at least one argument, so we need to handle empty array
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        return await db.select().from(propostas).where(whereClause).orderBy(desc(propostas.createdAt));
    }

    async getProposta(id: string): Promise<Proposta | undefined> {
        const [proposta] = await db.select().from(propostas).where(eq(propostas.id, id));
        return proposta;
    }

    async getNextNumeroProposta(): Promise<string> {
        // Mantido para compatibilidade com IStorage, mas createProposta usa transação
        const year = new Date().getFullYear();
        const yearPrefix = `PRP-${year}-`;
        const [seqResult] = await db
            .select({ maxSeq: sql<number>`COALESCE(MAX(SPLIT_PART(numero_proposta, '-', 3)::INTEGER), 0)` })
            .from(propostas)
            .where(sql`numero_proposta LIKE ${yearPrefix + "%"}`);
        const nextSeq = (Number(seqResult?.maxSeq) || 0) + 1;
        return `${yearPrefix}${String(nextSeq).padStart(4, "0")}`;
    }

    async createProposta(data: InsertProposta): Promise<Proposta> {
        // Transação garante que SELECT e INSERT são atômicos, eliminando race condition
        return await db.transaction(async (tx) => {
            const year = new Date().getFullYear();
            const yearPrefix = `PRP-${year}-`;

            const [seqResult] = await tx
                .select({ maxSeq: sql<number>`COALESCE(MAX(SPLIT_PART(numero_proposta, '-', 3)::INTEGER), 0)` })
                .from(propostas)
                .where(sql`numero_proposta LIKE ${yearPrefix + "%"}`);

            const nextSeq = (Number(seqResult?.maxSeq) || 0) + 1;
            const numeroProposta = `${yearPrefix}${String(nextSeq).padStart(4, "0")}`;

            const [newProposta] = await tx.insert(propostas).values({
                ...data,
                numeroProposta,
                createdAt: new Date(),
                updatedAt: new Date()
            }).returning();
            return newProposta;
        });
    }

    async updateProposta(id: string, data: Partial<InsertProposta>): Promise<Proposta | undefined> {
        const [updated] = await db
            .update(propostas)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(propostas.id, id))
            .returning();
        return updated;
    }

    async deleteProposta(id: string): Promise<boolean> {
        const [deleted] = await db.delete(propostas).where(eq(propostas.id, id)).returning();
        return !!deleted;
    }

    // Envios
    async getEnviosByProposta(propostaId: string): Promise<PropostaEnvio[]> {
        return await db.select().from(propostaEnvios).where(eq(propostaEnvios.propostaId, propostaId));
    }

    async createEnvio(data: InsertPropostaEnvio): Promise<PropostaEnvio> {
        const [novoEnvio] = await db.insert(propostaEnvios).values({
            ...data,
            createdAt: new Date()
        }).returning();
        return novoEnvio;
    }

    // Metas
    async getMetas(): Promise<MetaProposta[]> {
        return await db.select().from(metasPropostas).orderBy(desc(metasPropostas.createdAt));
    }

    async getMeta(id: string): Promise<MetaProposta | undefined> {
        const [meta] = await db.select().from(metasPropostas).where(eq(metasPropostas.id, id));
        return meta;
    }

    async createMeta(data: InsertMetaProposta): Promise<MetaProposta> {
        const [novaMeta] = await db.insert(metasPropostas).values(data).returning();
        return novaMeta;
    }

    async updateMeta(id: string, data: Partial<InsertMetaProposta>): Promise<MetaProposta | undefined> {
        const [updated] = await db
            .update(metasPropostas)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(metasPropostas.id, id))
            .returning();
        return updated;
    }

    async deleteMeta(id: string): Promise<boolean> {
        const [deleted] = await db.delete(metasPropostas).where(eq(metasPropostas.id, id)).returning();
        return !!deleted;
    }

    // Dashboard
    async getDashboardMetrics(): Promise<DashboardMetrics> {
        const allPropostas = await db.select().from(propostas);
        const enviadas = allPropostas.filter(p => p.status !== "RASCUNHO");
        const aceitas = allPropostas.filter(p => p.status === "ACEITA");

        const totalEnviadas = enviadas.length;
        const totalAceitas = aceitas.length;
        const valorTotalAceito = aceitas.reduce((sum, p) => sum + parseFloat(p.valorTotal || "0"), 0);
        const taxaConversao = totalEnviadas > 0 ? (totalAceitas / totalEnviadas) * 100 : 0;

        // Helper maps (similar logic to MemStorage but processing fetched data)
        // For optimization in future: Use SQL GROUP BY aggregation

        // Por estado
        const estadoMap = new Map<string, { count: number; aceitas: number }>();
        enviadas.forEach(p => {
            const estado = p.clienteEstado || "N/A";
            const curr = estadoMap.get(estado) || { count: 0, aceitas: 0 };
            curr.count++;
            if (p.status === "ACEITA") curr.aceitas++;
            estadoMap.set(estado, curr);
        });
        const propostasPorEstado = Array.from(estadoMap.entries()).map(([estado, data]) => ({ estado, ...data }));

        // Por mês
        const mesMap = new Map<string, { enviadas: number; aceitas: number }>();
        allPropostas.forEach(p => {
            const mes = new Date(p.createdAt).toISOString().slice(0, 7);
            const curr = mesMap.get(mes) || { enviadas: 0, aceitas: 0 };
            if (p.status !== "RASCUNHO") curr.enviadas++;
            if (p.status === "ACEITA") curr.aceitas++;
            mesMap.set(mes, curr);
        });
        const propostasPorMes = Array.from(mesMap.entries())
            .map(([mes, data]) => ({ mes, ...data }))
            .sort((a, b) => a.mes.localeCompare(b.mes));

        // Por status
        const statusMap = new Map<string, number>();
        allPropostas.forEach(p => {
            statusMap.set(p.status, (statusMap.get(p.status) || 0) + 1);
        });
        const propostasPorStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

        // Top Consultores
        const allConsultores = await this.getConsultores();
        const consultorMap = new Map<string, { nome: string; aceitas: number; total: number }>();
        enviadas.forEach(p => {
            if (p.consultorId) {
                const consultor = allConsultores.find(c => c.id === p.consultorId);
                const nome = consultor?.nome || "Desconhecido";
                const curr = consultorMap.get(p.consultorId) || { nome, aceitas: 0, total: 0 };
                curr.total++;
                if (p.status === "ACEITA") curr.aceitas++;
                consultorMap.set(p.consultorId, curr);
            }
        });
        const topConsultores = Array.from(consultorMap.values())
            .sort((a, b) => b.aceitas - a.aceitas)
            .slice(0, 10);

        // Valor Acumulado
        const valorMesMap = new Map<string, number>();
        aceitas.forEach(p => {
            const mes = new Date(p.createdAt).toISOString().slice(0, 7);
            valorMesMap.set(mes, (valorMesMap.get(mes) || 0) + parseFloat(p.valorTotal || "0"));
        });
        let acumulado = 0;
        const valorAcumuladoPorMes = Array.from(valorMesMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([mes, valor]) => {
                acumulado += valor;
                return { mes, valor: acumulado };
            });

        // Recentes
        const propostasRecentes = allPropostas
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);

        // Funil de Conversão
        const statusCount = new Map<string, number>();
        allPropostas.forEach(p => {
            statusCount.set(p.status, (statusCount.get(p.status) || 0) + 1);
        });

        const funilConversao = [
            { etapa: "Rascunho", count: statusCount.get("RASCUNHO") || 0 },
            { etapa: "Enviada", count: (statusCount.get("ENVIADA") || 0) + (statusCount.get("VISUALIZADA") || 0) + (statusCount.get("ACEITA") || 0) + (statusCount.get("RECUSADA") || 0) },
            { etapa: "Visualizada", count: (statusCount.get("VISUALIZADA") || 0) + (statusCount.get("ACEITA") || 0) + (statusCount.get("RECUSADA") || 0) },
            { etapa: "Aceita", count: statusCount.get("ACEITA") || 0 }
        ];

        // Heatmap Dia da Semana (0-6) x Hora (0-23)
        // Simplificado: Apenas contagem por dia da semana
        const heatmapMap = new Map<string, number>();
        allPropostas.forEach(p => {
            const date = new Date(p.createdAt);
            const dia = date.getDay(); // 0 = Domingo
            const hora = date.getHours();
            const key = `${dia}-${hora}`;
            heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1);
        });

        const heatmapDiaSemana = Array.from(heatmapMap.entries()).map(([key, count]) => {
            const [dia, hora] = key.split('-').map(Number);
            return { dia, hora, count };
        });

        // Faixa de Valor
        const faixas = {
            "Até 1k": 0,
            "1k - 5k": 0,
            "5k - 10k": 0,
            "10k+": 0
        };

        allPropostas.forEach(p => {
            const valor = parseFloat(p.valorTotal || "0");
            if (valor <= 1000) faixas["Até 1k"]++;
            else if (valor <= 5000) faixas["1k - 5k"]++;
            else if (valor <= 10000) faixas["5k - 10k"]++;
            else faixas["10k+"]++;
        });

        const propostasPorFaixaValor = Object.entries(faixas).map(([faixa, count]) => ({ faixa, count }));

        // Tempo Médio de Resposta (em horas)
        // Considera tempo entre criação e status final (ACEITA/RECUSADA)
        // Idealmente usaria dataEnvio e dataResposta, mas vamos usar updatedAt como proxy
        let totalTempo = 0;
        let countTempo = 0;

        allPropostas.forEach(p => {
            if ((p.status === "ACEITA" || p.status === "RECUSADA") && p.createdAt && p.updatedAt) {
                const diff = new Date(p.updatedAt).getTime() - new Date(p.createdAt).getTime();
                if (diff > 0) {
                    totalTempo += diff;
                    countTempo++;
                }
            }
        });

        const tempoMedioResposta = countTempo > 0 ? (totalTempo / countTempo) / (1000 * 60 * 60) : 0;

        // Atualizar Top Consultores com taxa
        const topConsultoresComTaxa = topConsultores.map(c => ({
            ...c,
            taxa: c.total > 0 ? (c.aceitas / c.total) * 100 : 0
        }));

        return {
            totalEnviadas,
            totalAceitas,
            valorTotalAceito,
            taxaConversao,
            propostasPorEstado,
            propostasPorMes,
            propostasPorStatus,
            topConsultores: topConsultoresComTaxa,
            valorAcumuladoPorMes,
            propostasRecentes,
            funilConversao,
            heatmapDiaSemana,
            propostasPorFaixaValor,
            tempoMedioResposta
        };
    }
}
