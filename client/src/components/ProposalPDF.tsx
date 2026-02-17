import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import logo from "@assets/logo.png";

// Register fonts if needed, otherwise use Helvetica/Standard
// Font.register({ family: 'Open Sans', src: '...' });

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.5,
        color: '#334155' // slate-700
    },
    header: {
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ff8000', // Primary
        paddingBottom: 10
    },
    logo: { width: 100, height: 'auto' },
    titleBlock: { marginBottom: 30, textAlign: 'center' },
    mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#ff8000', marginBottom: 5, textTransform: 'uppercase' },
    subTitle: { fontSize: 16, color: '#0f1729', fontWeight: 'bold', marginBottom: 5 }, // Secondary
    clientName: { fontSize: 14, color: '#64748b' },

    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0f1729', // Secondary
        marginTop: 15,
        marginBottom: 8,
        textTransform: 'uppercase',
        borderLeftWidth: 3,
        borderLeftColor: '#ff8000',
        paddingLeft: 5
    },
    subSectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#334155',
        marginTop: 10,
        marginBottom: 5
    },
    paragraph: { marginBottom: 8, textAlign: 'justify' },

    list: { marginBottom: 8, marginLeft: 10 },
    listItem: { flexDirection: 'row', marginBottom: 3 },
    bullet: { width: 10, fontSize: 10, color: '#ff8000' },
    listItemContent: { flex: 1 },

    conditionsBox: {
        backgroundColor: '#f8fafc', // slate-50
        padding: 15,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: 10,
        marginBottom: 10
    },
    conditionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    conditionLabel: { color: '#64748b' },
    conditionValue: { fontWeight: 'bold', color: '#0f1729' },

    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#cbd5e1'
    },
    totalLabel: { fontSize: 12, fontWeight: 'bold', color: '#0f1729' },
    totalValue: { fontSize: 12, fontWeight: 'bold', color: '#ff8000' },

    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 8,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10
    }
});

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const ProposalPDF = ({ companyName, employees, price, consultorNome, totalMonthly }: any) => {
    const annualInvestment = totalMonthly * 12;
    const pricePerDay = (price / 30).toFixed(2);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Image src={logo} style={styles.logo} />
                    <Text style={{ fontSize: 9, color: '#94a3b8' }}>Proposta Comercial</Text>
                </View>

                {/* Cover/Title */}
                <View style={styles.titleBlock}>
                    <Text style={styles.mainTitle}>PROPOSTA COMERCIAL</Text>
                    <Text style={styles.subTitle}>WOW+ SAÚDE POR ASSINATURA</Text>
                    <Text style={styles.clientName}>{companyName}</Text>
                </View>

                {/* 1. Apresentação */}
                <Text style={styles.sectionTitle}>1. APRESENTAÇÃO INSTITUCIONAL</Text>
                <Text style={styles.paragraph}>
                    A WOW+ é uma Health Tech brasileira especializada em soluções de saúde por assinatura, com sede em Osasco/SP. Atua por meio de plataforma digital própria, oferecendo acesso rápido, acessível e sem burocracia a serviços médicos e assistenciais.
                </Text>
                <Text style={styles.paragraph}>
                    Nosso modelo foi desenvolvido para democratizar o acesso à saúde no Brasil, proporcionando atendimento 24 horas por dia, redução de custos empresariais e melhoria da qualidade de vida dos colaboradores.
                </Text>

                {/* 2. Contexto */}
                <Text style={styles.sectionTitle}>2. CONTEXTO E JUSTIFICATIVA</Text>
                <Text style={styles.paragraph}>
                    Empresas do setor logístico operam com equipes distribuídas, jornadas variáveis e alto nível de responsabilidade operacional. Nesse cenário, o acesso ágil a atendimento médico torna-se um diferencial estratégico.
                </Text>
                <Text style={styles.paragraph}>Entre os principais desafios enfrentados pelas empresas estão:</Text>
                <View style={styles.list}>
                    {[
                        "Absenteísmo decorrente de demora em atendimento médico",
                        "Custos elevados com benefícios tradicionais",
                        "Baixa previsibilidade orçamentária em saúde",
                        "Dificuldade de acesso rápido a especialistas"
                    ].map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listItemContent}>{item}</Text>
                        </View>
                    ))}
                </View>
                <Text style={styles.paragraph}>
                    A WOW+ oferece uma solução tecnológica eficiente, de baixo custo e alto impacto organizacional.
                </Text>

                {/* 3. Solução */}
                <Text style={styles.sectionTitle}>3. SOLUÇÃO PROPOSTA – WOW+ MED CORPORATIVO</Text>

                <Text style={styles.subSectionTitle}>3.1 Atendimento Médico 24h</Text>
                <View style={styles.list}>
                    {[
                        "Clínico Geral – utilizações ilimitadas",
                        "Pediatria – utilizações ilimitadas",
                        "Receita médica digital",
                        "Atestado médico digital"
                    ].map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listItemContent}>{item}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.subSectionTitle}>3.2 Especialidades Médicas (até 3 por mês por beneficiário)</Text>
                <View style={styles.list}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {[
                            "Cardiologia", "Ortopedia", "Dermatologia", "Psicologia",
                            "Nutrição", "Endocrinologia", "Gastroenterologia", "Ginecologia",
                            "Geriatria", "Urologia", "Otorrinolaringologia", "Psiquiatria"
                        ].map((item, i) => (
                            <View key={i} style={{ width: '33%', flexDirection: 'row', marginBottom: 2 }}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.listItemContent}>{item}</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={{ marginTop: 5, fontSize: 8, color: '#64748b' }}>Entre outras especialidades disponíveis na plataforma</Text>
                </View>

                <Text style={styles.subSectionTitle}>3.3 Benefícios Complementares</Text>
                <View style={styles.list}>
                    {[
                        "Descontos de até 70% em medicamentos",
                        "Descontos de até 50% em exames e consultas presenciais",
                        "Acesso imediato após ativação",
                        "Plataforma digital com suporte via 0800 e WhatsApp"
                    ].map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listItemContent}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* Break Page if needed, but assuming it fits or flows naturally. React-pdf handles flow. */}
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Image src={logo} style={styles.logo} />
                    <Text style={{ fontSize: 9, color: '#94a3b8' }}>Proposta Comercial</Text>
                </View>

                {/* 4. Condições */}
                <Text style={styles.sectionTitle}>4. CONDIÇÕES COMERCIAIS</Text>
                <View style={styles.conditionsBox}>
                    <View style={styles.conditionRow}>
                        <Text style={styles.conditionLabel}>Empresa:</Text>
                        <Text style={styles.conditionValue}>{companyName}</Text>
                    </View>
                    <View style={styles.conditionRow}>
                        <Text style={styles.conditionLabel}>Quantidade de colaboradores:</Text>
                        <Text style={styles.conditionValue}>{employees}</Text>
                    </View>
                    <View style={styles.conditionRow}>
                        <Text style={styles.conditionLabel}>Valor unitário por colaborador:</Text>
                        <Text style={styles.conditionValue}>{formatCurrency(price)} por mês</Text>
                    </View>

                    <Text style={[styles.subSectionTitle, { marginTop: 15 }]}>4.1 Investimento</Text>

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Investimento mensal:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totalMonthly)}</Text>
                    </View>
                    <View style={[styles.totalRow, { borderTopWidth: 0, marginTop: 5 }]}>
                        <Text style={styles.totalLabel}>Investimento anual:</Text>
                        <Text style={styles.totalValue}>{formatCurrency(annualInvestment)}</Text>
                    </View>

                    <Text style={{ marginTop: 10, fontSize: 8, fontStyle: 'italic', color: '#64748b' }}>
                        O valor corresponde a aproximadamente R$ {pricePerDay} por dia por colaborador.
                    </Text>
                </View>

                {/* 5. Benefícios */}
                <Text style={styles.sectionTitle}>5. BENEFÍCIOS PARA A {companyName.toUpperCase()}</Text>
                <Text style={styles.paragraph}>
                    A implementação da solução WOW+ proporciona benefícios operacionais, financeiros e também alinhamento às boas práticas de saúde ocupacional previstas na NR-1 (Programa de Gerenciamento de Riscos – PGR).
                </Text>

                <Text style={styles.subSectionTitle}>5.1 Benefícios Operacionais e Estratégicos</Text>
                <View style={styles.list}>
                    {[
                        "Redução de absenteísmo, com atendimento médico rápido e remoto.",
                        "Acesso facilitado à saúde para colaboradores que atuam em campo ou em regime de turnos.",
                        "Melhoria na percepção de valorização do colaborador.",
                        "Benefício de baixo impacto financeiro comparado a planos tradicionais.",
                        "Previsibilidade orçamentária e simplicidade operacional."
                    ].map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listItemContent}>{item}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.subSectionTitle}>5.2 Contribuições para Conformidade com a NR-1 (PGR)</Text>
                <View style={styles.list}>
                    {[
                        "Apoio à gestão de riscos psicossociais (acesso a psicólogos).",
                        "Promoção da saúde preventiva e redução de agravamentos.",
                        "Incentivo à cultura de prevenção e autocuidado.",
                        "Mitigação de afastamentos prolongados por intervenção precoce.",
                        "Apoio ao Programa de Gerenciamento de Riscos (PGR)."
                    ].map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listItemContent}>{item}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.subSectionTitle}>5.3 Relevância para o Setor Logístico</Text>
                <Text style={styles.paragraph}>
                    Considerando o perfil operacional da {companyName}, a disponibilidade de atendimento médico 24 horas reforça a responsabilidade corporativa na gestão de saúde e segurança.
                </Text>

                {/* 6. Vigência */}
                <Text style={styles.sectionTitle}>6. VIGÊNCIA E IMPLEMENTAÇÃO</Text>
                <View style={styles.list}>
                    {[
                        "Vigência contratual: 12 meses",
                        "Pagamento mensal",
                        "Ativação imediata após envio da base de colaboradores",
                        "Comunicação interna pode ser apoiada pela WOW+"
                    ].map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listItemContent}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* 7. Próximos Passos */}
                <Text style={styles.sectionTitle}>7. PRÓXIMOS PASSOS</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                    {["Aprovação", "Contrato", "Base", "Ativação", "Comunicado"].map((step, i) => (
                        <View key={i} style={{ alignItems: 'center' }}>
                            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#ff8000', alignItems: 'center', justifyContent: 'center', marginBottom: 5 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>{i + 1}</Text>
                            </View>
                            <Text style={{ fontSize: 8 }}>{step}</Text>
                        </View>
                    ))}
                </View>

                {/* 8. Considerações Finais */}
                <Text style={styles.sectionTitle}>8. CONSIDERAÇÕES FINAIS</Text>
                <Text style={styles.paragraph}>
                    A WOW+ coloca-se à disposição para realizar apresentação executiva à diretoria ou ao setor de Recursos Humanos da {companyName}, com detalhamento técnico.
                </Text>
                <Text style={styles.paragraph}>
                    Trata-se de uma solução moderna, acessível e estratégica para empresas que desejam oferecer saúde de qualidade com responsabilidade financeira.
                </Text>

                <View style={{ marginTop: 30 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Consultor Responsável:</Text>
                    <Text style={{ fontSize: 10 }}>{consultorNome || "Equipe WOW+"}</Text>
                </View>

                <Text style={styles.footer}>
                    WOW+ Saúde por Assinatura | www.wowmais.com.br
                </Text>
            </Page>
        </Document>
    );
};
