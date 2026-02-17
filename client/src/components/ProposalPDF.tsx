import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 30, fontFamily: 'Helvetica' },
    header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
    section: { margin: 10, padding: 10, flexGrow: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    label: { fontSize: 10, color: '#64748b' },
    value: { fontSize: 10, color: '#0f172a', fontWeight: 'bold' },
});

export const ProposalPDF = ({ companyName, employees, price, consultorNome, totalMonthly }: any) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text>WOW+ Saúde</Text>
            </View>
            <Text style={styles.title}>Proposta para {companyName}</Text>
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.label}>Colaboradores:</Text>
                    <Text style={styles.value}>{employees}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Valor:</Text>
                    <Text style={styles.value}>R$ {price}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Consultor:</Text>
                    <Text style={styles.value}>{consultorNome}</Text>
                </View>
            </View>
        </Page>
    </Document>
);
