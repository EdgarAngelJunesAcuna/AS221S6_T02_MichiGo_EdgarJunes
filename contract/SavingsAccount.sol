// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title MichiGoSavings - Un contrato de ahorro descentralizado para MichiGo
/// @notice Este contrato permite la creación de un sistema de ahorro automático con tasas y descuentos configurables.
/// @dev Incluye funcionalidades de parada de emergencia y bloqueo de fondos por tiempo definido.
contract MichiGoSavings {
    /// @notice Dirección del propietario del contrato
    address public owner;

    /// @notice Dirección de la cuenta de ahorro donde se enviarán los ahorros
    address public savingsAccount;

    /// @notice Dirección que recibirá los fondos restantes después de aplicar el descuento y el ahorro
    address public transactionReceiver;

    /// @notice Tasa de ahorro aplicada a los depósitos (por defecto 10%)
    /// @dev Se puede ajustar mediante la función `setSavingsRate`
    uint256 public savingsRate = 10;

    /// @notice Descuento aplicado a las transferencias (por defecto 30%)
    /// @dev Se puede ajustar mediante la función `setTransferDiscount`
    uint256 public transferDiscount = 30;

    /// @notice Indica si el contrato está en paro de emergencia (por defecto, no activo)
    bool public emergencyStop = false;

    /// @notice Límite máximo de depósito permitido en el contrato (por defecto 100 ETH)
    uint256 public maxDepositAmount = 100 ether;

    /// @dev Estructura para almacenar la información de los usuarios
    struct User {
        string name;
        address wallet;
    }

    /// @dev Mappings para gestionar el registro de usuarios, sus balances y los tiempos de bloqueo
    mapping(address => User) public users;
    mapping(address => bool) public isRegistered;
    mapping(address => uint256) private balances;
    mapping(address => uint256) private lockTime;
    address[] public userAddresses;

    /// @notice Evento que se emite cuando un usuario se registra
    /// @param wallet Dirección del usuario registrado
    /// @param name Nombre del usuario registrado
    event UserRegistered(address indexed wallet, string name);

    /// @notice Evento que se emite cuando se realiza un depósito
    /// @param from Dirección que realiza el depósito
    /// @param account Dirección de la cuenta receptora
    /// @param amount Cantidad total depositada
    /// @param discountedAmount Cantidad después de aplicar el descuento
    /// @param savingsAmount Cantidad destinada al ahorro
    /// @param remainingAmount Cantidad restante después de aplicar el ahorro
    /// @param gasUsed Gas utilizado en la operación
    /// @param gasPrice Precio del gas en la transacción
    event Deposit(
        address indexed from, 
        address indexed account, 
        uint256 amount, 
        uint256 discountedAmount, 
        uint256 savingsAmount, 
        uint256 remainingAmount, 
        uint256 gasUsed, 
        uint256 gasPrice
    );

    /// @notice Evento que se emite cuando un usuario retira sus fondos
    /// @param account Dirección del usuario que retira
    /// @param amount Cantidad retirada
    event Withdraw(address indexed account, uint256 amount);

    /// @notice Evento que se emite cuando se cambia la tasa de ahorro
    /// @param oldRate Tasa de ahorro anterior
    /// @param newRate Nueva tasa de ahorro
    event SavingsRateChanged(uint256 oldRate, uint256 newRate);

    /// @notice Evento que se emite cuando se cambia el descuento de transferencias
    /// @param oldDiscount Descuento anterior
    /// @param newDiscount Nuevo descuento
    event TransferDiscountChanged(uint256 oldDiscount, uint256 newDiscount);

    /// @notice Evento que se emite cuando se cambia la cuenta de ahorro
    /// @param oldAccount Cuenta de ahorro anterior
    /// @param newAccount Nueva cuenta de ahorro
    event SavingsAccountChanged(address oldAccount, address newAccount);

    /// @notice Evento que se emite cuando se cambia el receptor de las transacciones
    /// @param oldReceiver Receptor anterior
    /// @param newReceiver Nuevo receptor
    event TransactionReceiverChanged(address oldReceiver, address newReceiver);

    /// @notice Evento que se emite cuando se activa o desactiva la parada de emergencia
    /// @param status Estado actual de la parada de emergencia
    event EmergencyStopActivated(bool status);

    /// @notice Constructor del contrato
    /// @param _savingsAccount Dirección de la cuenta de ahorro
    /// @param _transactionReceiver Dirección del receptor de transacciones
    constructor(address _savingsAccount, address _transactionReceiver) {
        owner = msg.sender;
        savingsAccount = _savingsAccount;
        transactionReceiver = _transactionReceiver;
    }

    /// @notice Solo el propietario del contrato puede ejecutar esta función
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario puede ejecutar esta accion");
        _;
    }

    /// @notice Esta función no se puede ejecutar durante el paro de emergencia
    modifier stopInEmergency() {
        require(!emergencyStop, "Operaciones detenidas temporalmente.");
        _;
    }

    /// @notice Esta función solo se puede ejecutar durante una emergencia
    modifier onlyInEmergency() {
        require(emergencyStop, "Esta funcion solo es accesible en emergencias.");
        _;
    }

    /// @notice Registra un nuevo usuario en el contrato
    /// @param name Nombre del usuario
    /// @param wallet Dirección de la billetera del usuario
    function registerUser(string memory name, address wallet) public stopInEmergency {
        require(!isRegistered[wallet], "Usuario ya registrado");
        users[wallet] = User(name, wallet);
        isRegistered[wallet] = true;
        userAddresses.push(wallet);
        emit UserRegistered(wallet, name);
    }

    /// @notice Realiza un depósito en una cuenta registrada
    /// @param account Dirección de la cuenta que recibirá los fondos
    function deposit(address account) public payable stopInEmergency {
        require(msg.value > 0, "Debes depositar mas de 0 ETH.");
        require(msg.value <= maxDepositAmount, "Deposito supera el limite permitido.");
        require(isRegistered[account], "El destinatario no esta registrado");

        uint256 discountedAmount = msg.value - ((msg.value * transferDiscount) / 100);
        uint256 savingsAmount = (discountedAmount * savingsRate) / 100;
        uint256 remainingAmount = discountedAmount - savingsAmount;

        uint256 gasUsed = gasleft();
        uint256 gasPrice = tx.gasprice;

        (bool sentSavings, ) = savingsAccount.call{value: savingsAmount}("");
        require(sentSavings, "Fallo al transferir a la cuenta de ahorro.");

        (bool sentRemaining, ) = account.call{value: remainingAmount}("");
        require(sentRemaining, "Fallo al transferir al receptor.");

        balances[account] += remainingAmount;
        lockTime[account] = block.timestamp + 1 weeks;

        gasUsed = gasUsed - gasleft();
        emit Deposit(msg.sender, account, msg.value, discountedAmount, savingsAmount, remainingAmount, gasUsed, gasPrice);
    }

    /// @notice Permite a los usuarios retirar sus fondos después de que se desbloqueen
    function withdraw() public stopInEmergency {
        require(balances[msg.sender] > 0, "No tienes fondos para retirar.");
        require(block.timestamp >= lockTime[msg.sender], "Los fondos estan bloqueados.");
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Fallo al transferir al usuario.");
        emit Withdraw(msg.sender, amount);
    }

    /// @notice Activa o desactiva la parada de emergencia
    function toggleEmergencyStop() public onlyOwner {
        emergencyStop = !emergencyStop;
        emit EmergencyStopActivated(emergencyStop);
    }

    /// @notice Cambia la tasa de ahorro del contrato
    /// @param _savingsRate Nueva tasa de ahorro (debe ser entre 0% y 100%)
    function setSavingsRate(uint256 _savingsRate) public onlyOwner {
        require(_savingsRate <= 100, "La tasa de ahorro no puede ser mayor al 100%");
        emit SavingsRateChanged(savingsRate, _savingsRate);
        savingsRate = _savingsRate;
    }

    /// @notice Cambia el descuento aplicado en las transferencias
    /// @param _transferDiscount Nuevo porcentaje de descuento (debe ser entre 0% y 100%)
    function setTransferDiscount(uint256 _transferDiscount) public onlyOwner {
        require(_transferDiscount <= 100, "El descuento no puede ser mayor al 100%");
        emit TransferDiscountChanged(transferDiscount, _transferDiscount);
        transferDiscount = _transferDiscount;
    }

    /// @notice Cambia la cuenta de ahorro
    /// @param _savingsAccount Nueva dirección de la cuenta de ahorro
    function changeSavingsAccount(address _savingsAccount) public onlyOwner {
        emit SavingsAccountChanged(savingsAccount, _savingsAccount);
        savingsAccount = _savingsAccount;
    }

    /// @notice Cambia el receptor de las transacciones
    /// @param _transactionReceiver Nueva dirección del receptor de transacciones
    function changeTransactionReceiver(address _transactionReceiver) public onlyOwner {
        emit TransactionReceiverChanged(transactionReceiver, _transactionReceiver);
        transactionReceiver = _transactionReceiver;
    }

    /// @notice Obtiene el balance de una cuenta específica
    /// @param account Dirección de la cuenta de usuario
    /// @return Balance actual de la cuenta
    function getBalance(address account) public view returns (uint256) {
        return balances[account];
    }

    /// @notice Devuelve el tiempo restante antes de que los fondos de una cuenta se desbloqueen
    /// @param account Dirección de la cuenta de usuario
    /// @return Tiempo restante en segundos hasta el desbloqueo de los fondos
    function getTimeUntilUnlock(address account) public view returns (uint256) {
        if (block.timestamp >= lockTime[account]) {
            return 0;
        } else {
            return lockTime[account] - block.timestamp;
        }
    }
}
