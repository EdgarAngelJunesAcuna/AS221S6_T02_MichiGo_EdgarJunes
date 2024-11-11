import { Component, OnInit } from '@angular/core';
import Web3 from 'web3';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import contractABI from 'src/app/abi/SavingsAccount.json';

interface Transaction {
  type: 'deposit' | 'withdraw';
  from: string;
  to: string;
  amount: string;
  date: Date;
}

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {
  transactions: Transaction[] = [];
  web3: Web3;
  contract: any;
  contractAddress: string = '0x800902fFC83417fc9aAbA04133Fc1A9b2B1a3CCF';
  searchTerm: string = '';
  timeout: number = 20000; // Tiempo de espera para las solicitudes

  constructor() {
    this.web3 = new Web3(new Web3.providers.HttpProvider('https://holesky.infura.io/v3/24d195e931c84f18ad1cc25a02690488'));
  }

  async ngOnInit() {
    await this.loadContract();
    await this.loadTransactions();
  }

  async loadContract() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.contract = new this.web3.eth.Contract(contractABI, this.contractAddress);
        console.log("Contrato cargado correctamente.");
      } catch (error) {
        console.error("Error al conectar con MetaMask o cargar el contrato:", error);
      }
    } else {
      console.warn("MetaMask no está instalado");
    }
  }

  async loadTransactions() {
    if (!this.contract) {
      console.error("Contrato no inicializado");
      return;
    }
  
    const controller = new AbortController();
    const signal = controller.signal;
    setTimeout(() => controller.abort(), this.timeout);
  
    try {
      const latestBlock = Number(await this.web3.eth.getBlockNumber());
      const batchSize = 100; // Reduce el tamaño del lote para evitar límites
      this.transactions = [];
  
      for (let i = 0; i <= latestBlock; i += batchSize) {
        const fromBlock = i;
        const toBlock = Math.min(i + batchSize - 1, latestBlock);
  
        // Espera antes de hacer la solicitud para evitar exceder el límite
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo de espera
  
        const depositEvents = await this.contract.getPastEvents('Deposit', { fromBlock, toBlock, signal });
        const withdrawEvents = await this.contract.getPastEvents('Withdraw', { fromBlock, toBlock, signal });
  
        this.transactions.push(
          ...depositEvents.map((event: any) => ({
            type: 'deposit',
            from: event.returnValues.from,
            to: event.returnValues.account,
            amount: this.web3.utils.fromWei(event.returnValues.amount, 'ether'),
            date: new Date(Number(event.returnValues.timestamp) * 1000)
          })),
          ...withdrawEvents.map((event: any) => ({
            type: 'withdraw',
            from: event.returnValues.account,
            to: '',
            amount: this.web3.utils.fromWei(event.returnValues.amount, 'ether'),
            date: new Date(Number(event.returnValues.timestamp) * 1000)
          }))
        );
      }
  
      this.transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
      console.log("Transacciones obtenidas:", this.transactions);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`La solicitud se ha cancelado después de ${this.timeout / 1000} segundos de espera`);
      } else {
        console.error("Error al cargar el historial de transacciones:", error);
      }
    }
  }
  

  async synchronizeTransactions() {
    console.log("Sincronizando transacciones...");
    await this.loadTransactions();
  }

  filteredTransactions() {
    return this.transactions.filter(tx =>
      tx.from.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (tx.to && tx.to.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  downloadPDF() {
    const doc = new jsPDF();
    doc.text("Historial de Transacciones", 10, 10);
    this.filteredTransactions().forEach((tx, index) => {
      doc.text(
        `Transacción ${index + 1}: De: ${tx.from}, Para: ${tx.to || 'N/A'}, Monto: ${tx.amount} ETH, Fecha: ${tx.date.toLocaleString()}`,
        10,
        20 + index * 10
      );
    });
    doc.save("historial_transacciones.pdf");
  }

  downloadExcel() {
    const ws = XLSX.utils.json_to_sheet(this.filteredTransactions());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historial");
    XLSX.writeFile(wb, "historial_transacciones.xlsx");
  }

  downloadCSV() {
    const csvData = this.filteredTransactions()
      .map(tx => `${tx.type},${tx.from},${tx.to || 'N/A'},${tx.amount},${tx.date.toLocaleString()}`)
      .join("\n");
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial_transacciones.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
