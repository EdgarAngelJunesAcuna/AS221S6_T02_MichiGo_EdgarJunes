import Web3 from 'web3';
import SavingsAccountABI from './SavingsAccount.json'; // Asegúrate de que la ruta sea correcta y que exista el ABI

/**
 * Función para crear y obtener una instancia del contrato SavingsAccount
 * @param web3 Instancia de Web3 que se esté utilizando
 * @param account Dirección de la cuenta que se utilizará para interactuar con el contrato
 * @param contractAddress Dirección del contrato desplegado en la red
 * @returns Instancia del contrato de SavingsAccount
 */
export const getSavingsAccountContract = (
  web3: Web3,
  account: string,
  contractAddress: string
) => {
  console.log('Creando instancia del contrato en la dirección:', contractAddress);
  
  // Verifica que todos los parámetros sean correctos
  if (!web3) {
    throw new Error('Web3 no está inicializado.');
  }
  if (!account) {
    throw new Error('La cuenta no está definida.');
  }
  if (!contractAddress) {
    throw new Error('La dirección del contrato no está definida.');
  }

  // Crea y retorna la instancia del contrato
  return new web3.eth.Contract(SavingsAccountABI as any, contractAddress, {
    from: account, // Cuenta desde la cual se realizarán las transacciones
  });
};
