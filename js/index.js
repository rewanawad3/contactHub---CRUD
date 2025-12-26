//Start Global Variables
let contactsList = [];
let currentIndex = null;

const fullNameInput = document.getElementById('fullName');
const phoneInput = document.getElementById('phoneNumber');
const emailInput = document.getElementById('email');
const addressInput = document.getElementById('address');
const groupInput = document.getElementById('group');
const notesInput = document.getElementById('notes');
const isFavoriteInput = document.getElementById('isFavorite');
const isEmergencyInput = document.getElementById('isEmergency');
const saveBtn = document.getElementById('saveContactBtn');
const updateBtn = document.getElementById('updateContactBtn');
const searchInput = document.getElementById('searchInput');
const totalContactsEl = document.getElementById('totalContacts');
const favoriteContactsEl = document.getElementById('favoriteContacts');
const emergencyContactsEl = document.getElementById('emergencyContacts');
const contactsCountText = document.getElementById('contactsCountText');

// Modal
const addContactModal = new bootstrap.Modal(document.getElementById('addContactModal'));

// Load contacts from localStorage
if (localStorage.getItem('contactHubContacts') !== null) {
    contactsList = JSON.parse(localStorage.getItem('contactHubContacts'));
    displayContacts();
    updateStatistics();
}

// Load contacts from localStorage safely
// const savedData = JSON.parse(localStorage.getItem('contactHubContacts')) || [];

// // Filter only valid contacts (having at least name and phone)
// contactsList = savedData.filter(contact => 
//     contact.hasOwnProperty('name') && 
//     contact.hasOwnProperty('phone')
// );

// displayContacts();
// updateStatistics();

// End Global Variables
// Functions
// Function to add a new contact
function addContact() {
    if (validateForm()) {
        const contact = {
            id: Date.now(),
            name: fullNameInput.value.trim(),
            phone: phoneInput.value.trim(),
            email: emailInput.value.trim(),
            address: addressInput.value.trim(),
            group: groupInput.value,
            notes: notesInput.value.trim(),
            isFavorite: isFavoriteInput.checked,
            isEmergency: isEmergencyInput.checked,
            avatar: getInitials(fullNameInput.value.trim()),
            dateAdded: new Date().toLocaleDateString()
        };
const exists = contactsList.some(c =>
    c.phone === contact.phone || (c.email && c.email === contact.email)
);

if (exists) {
    Swal.fire({
        icon: 'info',
        title: 'Already exists',
        text: 'This phone number or email already exists',
        confirmButtonColor: '#7b4bff'
    });
    return;
}

        contactsList.push(contact);
        saveToLocalStorage();
        displayContacts();
        updateStatistics();
        clearForm();
        addContactModal.hide();
        
        // Show success alert from sweet alert
        Swal.fire({
            title: 'Success!',
            text: 'Contact added successfully',
            icon: 'success',
            confirmButtonColor: '#7b4bff',
            timer: 2000
        });
    }
}

// Function to display all contacts
function displayContacts(searchTerm = '') {
    const contactsListEl = document.getElementById('contactsList');
    const favoritesListEl = document.getElementById('favoritesList');
    const emergencyListEl = document.getElementById('emergencyList');
    
    let filteredContacts = contactsList;
    
    // Apply search filter
    if (searchTerm) {
        filteredContacts = contactsList.filter(contact => 
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.phone.includes(searchTerm) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // اظهرلي هنا الليست
    if (filteredContacts.length === 0) {
        contactsListEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-address-book"></i>
                </div>
                <h6 class="mt-3 text-muted">No contacts found</h6>
                <p class="text-muted">Click "Add Contact" to get started</p>
            </div>
        `;
    } else {
        let contactsHTML = '<div class="row g-3">';
        
        filteredContacts.forEach((contact, index) => {
            contactsHTML += createContactCard(contact, index);
        });
        
        contactsHTML += '</div>';
        contactsListEl.innerHTML = contactsHTML;
    }
    
    // Display favorites
    const favorites = contactsList.filter(contact => contact.isFavorite);
    if (favorites.length === 0) {
        favoritesListEl.innerHTML = 'No favorites yet';
    } else {
        let favoritesHTML = '';
        favorites.forEach(contact => {
            favoritesHTML += `
                <div class="favorite-item mb-2 p-2 bg-light rounded">
    <div class="d-flex align-items-center">
        <div class="contact-avatar me-2" style="width: 35px; height: 35px; font-size: 14px;">
            ${contact.avatar}
        </div>

        <div>
            <small class="d-block ">${contact.name}</small>
            <small class="text-muted">${contact.phone}</small>
        </div>

        <button class="icon-btn call ms-auto">
            <i class="fas fa-phone"></i>
        </button>
    </div>
</div>

            `;
        });

        favoritesListEl.innerHTML = favoritesHTML;
    }
    
    // Display emergency
    const emergency = contactsList.filter(contact => contact.isEmergency);
    if (emergency.length === 0) {
        emergencyListEl.innerHTML = 'No emergency contacts';
    } else {
        let emergencyHTML = '';
        emergency.forEach(contact => {
            emergencyHTML += `
                <div class="emergency-item mb-2 p-2 bg-light rounded">
                    <div class="d-flex align-items-center">
                        <div class="contact-avatar me-2" style="width: 35px; height: 35px; font-size: 14px; background: linear-gradient(135deg, #ef4444, #dc2626);">
                            ${contact.avatar}
                        </div>
                        <div>
                            <small class="d-block">${contact.name}</small>
                            <small class="text-muted">${contact.phone}</small>
                        </div>
                        <button class="icon-btn call ms-auto">
    <i class="fas fa-phone"></i>
</button>

                    </div>
                </div>
            `;
        });
        emergencyListEl.innerHTML = emergencyHTML;
    }
}

// فانكشن الكارد الاساسية بتاعتي
function createContactCard(contact, index) {
    return `
    <div class="col-md-6">
        <div class="contact-item bg-white p-3">

            <!-- Header -->
            <div class="d-flex align-items-start mb-3">
                <div class="position-relative me-3">
                    <div class="contact-avatar">
                        ${contact.avatar}
                    </div>

                    ${contact.isFavorite ? `
<span class="overlay-badge favorite" style="top:-6px;right:-6px">
    <i class="fas fa-star"></i>
</span>` : ''}

${contact.isEmergency ? `
<span class="overlay-badge emergency" style="bottom:-6px;right:-6px">
    <i class="fas fa-heart-pulse"></i>
</span>` : ''}

                </div>

                <div>
                    <h6 class="mb-1 fw-bold">${contact.name}</h6>
                    <div class="d-flex align-items-center text-muted small contact-phone">

                        <i class="fas fa-phone me-2"></i>
                        ${contact.phone}
                    </div>
                </div>
            </div>

            <!-- Info -->
            <div class="contact-details mb-3">

                ${
                    contact.email
                    ? `
                    <div class="info-row email">
                        <i class="fas fa-envelope"></i>
                        <span>${contact.email}</span>
                    </div>`
                    : ''
                }

                ${
                    contact.address
                    ? `
                    <div class="info-row location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${contact.address}</span>
                    </div>`
                    : ''
                }

            </div>

            <!-- Tags -->
            <div class="contact-tags mb-3">
                ${
                    contact.group
                    ? `<span class="tag ${contact.group}">${contact.group}</span>`
                    : ''
                }
                ${
                    contact.isEmergency
                    ? `<span class="tag emergency">
    <i class="fas fa-heart-pulse me-1"></i> Emergency
</span>
`
                    : ''
                }
            </div>

            <!-- Footer -->
            <div class="contact-footer pt-3 border-top d-flex justify-content-between align-items-center">

                <div class="d-flex gap-2">
                    <button class="icon-btn call">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="icon-btn message">
                        <i class="fas fa-comment"></i>
                    </button>
                </div>

                <div class="d-flex gap-2">
                    <button onclick="toggleFavorite(${contact.id})" class="icon-btn">
                        <i class="fas fa-star ${contact.isFavorite ? 'text-warning' : ''}"></i>
                    </button>

                    <button onclick="toggleEmergency(${contact.id})" class="icon-btn">
                        <i class="fas fa-heart-pulse ${contact.isEmergency ? 'text-danger' : ''}"></i>
                    </button>

                    <button onclick="editContact(${index})" class="icon-btn">
                        <i class="fas fa-pen"></i>
                    </button>

                    <button onclick="deleteContact(${index})" class="icon-btn text-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>

            </div>
        </div>
    </div>
    `;
}

// Function to update contact
function updateContact() {
    if (validateForm()) {
        contactsList[currentIndex] = {
            ...contactsList[currentIndex],
            name: fullNameInput.value.trim(),
            phone: phoneInput.value.trim(),
            email: emailInput.value.trim(),
            address: addressInput.value.trim(),
            group: groupInput.value,
            notes: notesInput.value.trim(),
            isFavorite: isFavoriteInput.checked,
            isEmergency: isEmergencyInput.checked,
            avatar: getInitials(fullNameInput.value.trim())
        };

        saveToLocalStorage();
        displayContacts();
        updateStatistics();
        clearForm();
        addContactModal.hide();
        
        // Reset buttons
        saveBtn.classList.remove('d-none');
        updateBtn.classList.add('d-none');
        
        Swal.fire({
            title: 'Updated!',
            text: 'Contact updated successfully',
            icon: 'success',
            confirmButtonColor: '#7b4bff',
            timer: 2000
        });
    }
}

// Function to delete contact
function deleteContact(index) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            contactsList.splice(index, 1);
            saveToLocalStorage();
            displayContacts();
            updateStatistics();
            
            Swal.fire({
                title: 'Deleted!',
                text: 'Contact has been deleted.',
                icon: 'success',
                confirmButtonColor: '#7b4bff',
                timer: 2000
            });
        }
    });
}

// Function to edit contact
function editContact(index) {
    currentIndex = index;
    const contact = contactsList[index];
    
    // Fill form with contact data
    fullNameInput.value = contact.name;
    phoneInput.value = contact.phone;
    emailInput.value = contact.email || '';
    addressInput.value = contact.address || '';
    groupInput.value = contact.group || '';
    notesInput.value = contact.notes || '';
    isFavoriteInput.checked = contact.isFavorite;
    isEmergencyInput.checked = contact.isEmergency;
    
    // Update modal title
    document.getElementById('modalTitle').textContent = 'Edit Contact';
    
    // Switch buttons
    saveBtn.classList.add('d-none');
    updateBtn.classList.remove('d-none');
    
    // Show modal
    addContactModal.show();
}

// Function to toggle favorite status
function toggleFavorite(id) {
    const index = contactsList.findIndex(contact => contact.id === id);
    if (index !== -1) {
        contactsList[index].isFavorite = !contactsList[index].isFavorite;
        saveToLocalStorage();
        displayContacts();
        updateStatistics();
    }
}

// Function to toggle emergency status
function toggleEmergency(id) {
    const index = contactsList.findIndex(contact => contact.id === id);
    if (index !== -1) {
        contactsList[index].isEmergency = !contactsList[index].isEmergency;
        saveToLocalStorage();
        displayContacts();
        updateStatistics();
    }
}

// Function to clear form
function clearForm() {
    fullNameInput.value = '';
    phoneInput.value = '';
    emailInput.value = '';
    addressInput.value = '';
    groupInput.value = '';
    notesInput.value = '';
    isFavoriteInput.checked = false;
    isEmergencyInput.checked = false;
    
    // Clear validation states
    fullNameInput.classList.remove('is-invalid', 'is-valid');
    phoneInput.classList.remove('is-invalid', 'is-valid');
    emailInput.classList.remove('is-invalid', 'is-valid');
    
    // Reset modal title
    document.getElementById('modalTitle').textContent = 'Add New Contact';
}

// Function to update statistics
function updateStatistics() {
    const total = contactsList.length;
    const favorites = contactsList.filter(contact => contact.isFavorite).length;
    const emergency = contactsList.filter(contact => contact.isEmergency).length;
    
    totalContactsEl.textContent = total;
    favoriteContactsEl.textContent = favorites;
    emergencyContactsEl.textContent = emergency;
    contactsCountText.textContent = `Manage and organize your ${total} contacts`;
}

// Function to save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('contactHubContacts', JSON.stringify(contactsList));
}

// Function to get initials for my photo
function getInitials(name) {
    return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// start the Validation
function validateForm() {
    let isValid = true;
    
    // Validate name
    if (!validateName()) {
        isValid = false;
    }
    
    // Validate phone (egy)
    if (!validatePhone()) {
        isValid = false;
    }
    
    // Validate email
    if (emailInput.value.trim() && !validateEmail()) {
        isValid = false;
    }
    
    return isValid;
}

function validateName() {
    const name = fullNameInput.value.trim();
    const nameError = document.getElementById('nameError');
    
    if (name.length < 3) {
        fullNameInput.classList.add('is-invalid');
        fullNameInput.classList.remove('is-valid');
        nameError.textContent = 'Name must be at least 3 characters long';
        return false;
    }
    
    fullNameInput.classList.remove('is-invalid');
    fullNameInput.classList.add('is-valid');
    return true;
}

function validatePhone() {
    const phone = phoneInput.value.trim();
    const phoneError = document.getElementById('phoneError');
    const egyptianPhoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
    
    if (!egyptianPhoneRegex.test(phone)) {
        phoneInput.classList.add('is-invalid');
        phoneInput.classList.remove('is-valid');
        phoneError.textContent = 'Please enter a valid Egyptian phone number (11 digits starting with 01)';
        return false;
    }
    
    phoneInput.classList.remove('is-invalid');
    phoneInput.classList.add('is-valid');
    return true;
}

function validateEmail() {
    const email = emailInput.value.trim();
    const emailError = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        emailInput.classList.add('is-invalid');
        emailInput.classList.remove('is-valid');
        emailError.textContent = 'Please enter a valid email address';
        return false;
    }
    
    if (email) {
        emailInput.classList.remove('is-invalid');
        emailInput.classList.add('is-valid');
    } else {
        emailInput.classList.remove('is-invalid', 'is-valid');
    }
    
    return true;
}

// Add contact button
saveBtn.addEventListener('click', addContact);

// Update contact button
updateBtn.addEventListener('click', updateContact);

// Search input
searchInput.addEventListener('input', function() {
    displayContacts(this.value);
});

// Real-time validation
fullNameInput.addEventListener('input', validateName);
phoneInput.addEventListener('input', validatePhone);
emailInput.addEventListener('input', validateEmail);

// Clear form 
document.getElementById('addContactModal').addEventListener('hidden.bs.modal', function() {
    clearForm();
    saveBtn.classList.remove('d-none');
    updateBtn.classList.add('d-none');
});

// display
displayContacts();