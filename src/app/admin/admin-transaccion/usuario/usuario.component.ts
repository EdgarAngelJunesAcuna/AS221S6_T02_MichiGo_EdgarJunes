import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import Web3 from 'web3';
import contractABI from 'src/app/abi/MichiGoSavings.json';

interface Contact {
  name: string;
  wallet: string;
}

interface Account {
  address: string;
  balance: string;
}

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  searchTerm: string = '';
  showAddContactModal: boolean = false;
  showEditContactModalVisible: boolean = false;
  showAccountModal: boolean = false;
  newContactName: string = '';
  newContactWallet: string = '';
  selectedContact: Contact | null = null;
  contractAddress: string = '0x800902fFC83417fc9aAbA04133Fc1A9b2B1a3CCF';
  contract: any;
  useLocalStorage: boolean = false;
  account: string = '';
  accounts: Account[] = [];
  web3: Web3;

  constructor() {
    this.web3 = new Web3(window.ethereum);
  }

  async ngOnInit() {
    await this.initializeContract();
    this.setupAccountChangeListener();
    if (this.useLocalStorage) {
      this.loadContactsFromLocalStorage();
    }
  }

  async initializeContract() {
    if (window.ethereum) {
      try {
        const accountAddresses = await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.accounts = await Promise.all(
          accountAddresses.map(async (address: string) => {
            const balance = await this.web3.eth.getBalance(address);
            return {
              address,
              balance: this.web3.utils.fromWei(balance, 'ether')
            };
          })
        );
        this.account = this.accounts[0].address;
        this.contract = new this.web3.eth.Contract(contractABI, this.contractAddress, { from: this.account });

        console.log("Contrato inicializado correctamente.");
        await this.syncContactsFromContract();
      } catch (error) {
        console.error("Error al conectar con MetaMask o inicializar el contrato:", error);
        this.fallbackToLocalStorage();
      }
    } else {
      console.warn("MetaMask no está instalado");
      this.fallbackToLocalStorage();
    }
  }

  setupAccountChangeListener() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accountAddresses: string[]) => {
        if (accountAddresses.length > 0) {
          this.account = accountAddresses[0];
          this.contract = new this.web3.eth.Contract(contractABI, this.contractAddress, { from: this.account });
          this.syncContactsFromContract();
          Swal.fire('Cuenta Cambiada', `Nueva cuenta activa: ${this.account}`, 'success');
        }
      });
    }
  }

  async syncContactsFromContract() {
    try {
      console.log("Sincronizando contactos desde el contrato...");
      const contacts = await this.contract.methods.getContacts().call();
      this.contacts = contacts.map((contact: any) => ({ name: contact.name, wallet: contact.wallet }));
      this.saveContactsToLocalStorage();
      this.filteredContacts = [...this.contacts];
      this.useLocalStorage = false;
    } catch (error) {
      console.error("Error al sincronizar contactos desde el contrato:", error);
      this.fallbackToLocalStorage();
    }
  }

  fallbackToLocalStorage() {
    this.useLocalStorage = true;
    this.loadContactsFromLocalStorage();
  }

  loadContactsFromLocalStorage() {
    const storedContacts = localStorage.getItem('contacts');
    this.contacts = storedContacts ? JSON.parse(storedContacts) : [];
    this.filteredContacts = [...this.contacts];
  }

  saveContactsToLocalStorage() {
    localStorage.setItem('contacts', JSON.stringify(this.contacts));
  }

  filterContacts() {
    this.filteredContacts = this.contacts.filter(contact =>
      contact.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      contact.wallet.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  addContact() {
    if (!this.newContactName || !this.newContactWallet) {
      Swal.fire('Advertencia', 'Por favor, completa todos los campos', 'warning');
      return;
    }

    this.contacts.push({ name: this.newContactName, wallet: this.newContactWallet });
    this.saveContactsToLocalStorage();
    Swal.fire('Éxito', 'Contacto agregado exitosamente', 'success');
    this.showAddContactModal = false;
    this.newContactName = '';
    this.newContactWallet = '';
    this.loadContactsFromLocalStorage();
  }

  showEditContactModal(contact: Contact) {
    this.selectedContact = { ...contact };
    this.showEditContactModalVisible = true;
  }

  closeEditModal() {
    this.showEditContactModalVisible = false;
    this.selectedContact = null;
  }

  editContact() {
    if (!this.selectedContact) return;

    const index = this.contacts.findIndex(contact => contact.wallet === this.selectedContact!.wallet);
    if (index !== -1) {
      this.contacts[index].name = this.selectedContact.name;
      this.saveContactsToLocalStorage();
      Swal.fire('Guardado', 'El contacto ha sido actualizado', 'success');
      this.closeEditModal();
      this.loadContactsFromLocalStorage();
    }
  }

  deleteContact(contact: Contact) {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'No podrá revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      background: '#333',
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        this.contacts = this.contacts.filter(c => c.wallet !== contact.wallet);
        this.saveContactsToLocalStorage();
        Swal.fire('Eliminado', 'El contacto ha sido eliminado', 'success');
        this.loadContactsFromLocalStorage();
      }
    });
  }

  toggleAccountModal() {
    this.showAccountModal = !this.showAccountModal;
  }

  async switchAccount(account: Account) {
    this.account = account.address;
    this.contract = new this.web3.eth.Contract(contractABI, this.contractAddress, { from: this.account });
    Swal.fire('Cuenta Cambiada', `Cuenta activa: ${account.address}`, 'success');
    this.showAccountModal = false;
    await this.syncContactsFromContract();
  }

  async switchAccountPrompt() {
    try {
      const permission = await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });

      if (permission) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          this.account = accounts[0];
          this.contract = new this.web3.eth.Contract(contractABI, this.contractAddress, { from: this.account });
          Swal.fire('Cuenta Actualizada', `Cuenta activa: ${this.account}`, 'success');
          await this.syncContactsFromContract();
        }
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo obtener la cuenta activa', 'error');
      console.error("Error al actualizar la cuenta activa:", error);
    }
  }

  getAccountIcon(account: Account) {
    return `https://avatars.dicebear.com/api/identicon/${account.address}.svg`;
  }
}
