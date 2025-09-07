document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const actionButton = document.getElementById('actionButton');
    const phoneInput = document.getElementById('phoneInput');
    const amountInput = document.getElementById('amountInput');
    const confirmationModal = document.getElementById('confirmationModal');
    const processingModal = document.getElementById('processingModal');
    const successModal = document.getElementById('successModal');
    const confirmButton = document.getElementById('confirmButton');
    const cards = document.querySelectorAll('.card');
    const processingIcon = document.getElementById('processingIcon');
    const successIcon = document.getElementById('successIcon');

    // State
    let buttonState = 0; // 0: Далее, 1: Оплатить, 2: Подтвердить
    let selectedCard = 'DBC****9460';
    let currentAmount = 1;
    let currentPhone = '061329999';
    let isProcessing = false; // Prevent multiple clicks

    // Initialize
    updateButtonState();
    setupEventListeners();
    updateTime();

    function setupEventListeners() {
        // Action button click - cycles through states
        actionButton.addEventListener('click', handleActionButtonClick);

        // Confirm button click - process payment immediately
        confirmButton.addEventListener('click', function() {
            if (!isProcessing) {
                processPayment();
            }
        });

        // Card selection
        cards.forEach(card => {
            card.addEventListener('click', function() {
                cards.forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                selectedCard = this.dataset.card;
            });
        });

        // Input validation
        phoneInput.addEventListener('input', function() {
            currentPhone = this.value;
            validateForm();
        });
        
        amountInput.addEventListener('input', function() {
            currentAmount = parseFloat(this.value) || 0;
            validateForm();
        });

        // Modal close on background click
        [confirmationModal, processingModal, successModal].forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal(this);
                }
            });
        });
    }

    function validateForm() {
        const phone = phoneInput.value.trim();
        const amount = amountInput.value.trim();
        
        return phone.length > 0 && amount.length > 0 && currentAmount > 0;
    }

    function updateButtonState() {
        const isValid = validateForm();
        
        if (!isValid) {
            buttonState = 0;
            actionButton.textContent = 'Далее';
            actionButton.style.backgroundColor = '#FF9800';
        } else {
            switch(buttonState) {
                case 0:
                    actionButton.textContent = 'Далее';
                    actionButton.style.backgroundColor = '#FF9800';
                    break;
                case 1:
                    actionButton.textContent = 'Оплатить';
                    actionButton.style.backgroundColor = '#FF9800';
                    break;
                case 2:
                    actionButton.textContent = 'Подтвердить';
                    actionButton.style.backgroundColor = '#4CAF50';
                    break;
            }
        }
    }

    function handleActionButtonClick() {
        const isValid = validateForm();
        
        if (!isValid) {
            return;
        }

        switch(buttonState) {
            case 0:
                // Далее -> Оплатить
                buttonState = 1;
                updateButtonState();
                break;
            case 1:
                // Оплатить -> Подтвердить (show confirmation modal)
                buttonState = 2;
                updateButtonState();
                updateConfirmationData();
                showModal(confirmationModal);
                break;
            case 2:
                // Подтвердить -> Process payment
                processPayment();
                break;
        }
    }

    function updateConfirmationData() {
        // Update amount displays
        const amountDisplays = document.querySelectorAll('.amount-display');
        amountDisplays.forEach(display => {
            display.textContent = currentAmount.toFixed(2) + ' TJS';
        });
        
        // Update phone numbers
        const phoneElements = document.querySelectorAll('#confirmationPhone, #processingPhone, #successPhone');
        phoneElements.forEach(element => {
            element.textContent = currentPhone;
        });
        
        // Update amounts in details
        const amountValues = document.querySelectorAll('.payment-details .detail-row .value');
        amountValues.forEach(value => {
            if (value.textContent.includes('TJS') && !value.textContent.includes('0.00')) {
                value.textContent = currentAmount.toFixed(2) + ' TJS';
            } else if (value.textContent === '1' || value.textContent === '1.00') {
                value.textContent = currentAmount.toString();
            }
        });
    }

    function processPayment() {
        if (isProcessing) return;
        
        isProcessing = true;
        
        // Update processing modal with current data
        updateConfirmationData();
        updateProcessingData();
        updateTime();
        
        // Hide confirmation modal
        closeModal(confirmationModal);
        
        // Show processing modal with yellow icon (638AFDD9...)
        showModal(processingModal);
        
        // After 1.5 seconds, change to green checkmark (88F54815...)
        setTimeout(() => {
            closeModal(processingModal);
            
            // Change icon to green checkmark
            if (successIcon) {
                successIcon.src = 'images/88F54815-F2BA-443F-8CA4-AC4784316B4E_4_5005_c.jpeg';
            }
            
            updateSuccessData();
            showModal(successModal);
            
            // Reset button state
            buttonState = 0;
            isProcessing = false;
            updateButtonState();
        }, 1500);
    }

    function updateProcessingData() {
        // Update processing modal with current data
        document.getElementById('processingAmount').textContent = currentAmount.toFixed(2) + ' TJS';
        document.getElementById('processingPhone').textContent = currentPhone;
    }

    function updateSuccessData() {
        // Update success modal with current data
        document.getElementById('successAmount').textContent = currentAmount.toFixed(2) + ' TJS';
        document.getElementById('successPhone').textContent = currentPhone;
        updateTime();
    }

    function updateTime() {
        const now = new Date();
        const date = now.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
        const time = now.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Update all time elements
        const timeElements = document.querySelectorAll('#processingTime, #successTime');
        timeElements.forEach(element => {
            element.textContent = time;
        });

        const dateElements = document.querySelectorAll('#processingDate, #successDate');
        dateElements.forEach(element => {
            element.textContent = date;
        });
    }

    function showModal(modal) {
        modal.classList.add('show');
        document.body.classList.add('modal-open');
    }

    function closeModal(modal) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
    }

    // Auto-format amount input
    amountInput.addEventListener('input', function() {
        currentAmount = parseFloat(this.value) || 0;
        updateButtonState();
    });

    // Phone number formatting
    phoneInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length > 0) {
            this.value = value;
            currentPhone = value;
        }
        updateButtonState();
    });

    // Close modals with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });

    // Prevent zoom on input focus (iOS)
    document.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'INPUT') {
            e.target.style.fontSize = '16px';
        }
    });

    // Initialize with proper state
    setTimeout(() => {
        updateButtonState();
    }, 100);
});
