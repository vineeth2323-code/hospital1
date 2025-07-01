function loadPharmacyData() {
  // Load pharmacy dashboard with prescriptions and stock
  loadPharmacyPrescriptions();
  loadPharmacyStock();
}

function loadPharmacyPrescriptions() {
  // Get prescriptions that haven't been fulfilled
  const prescriptions = appData.prescriptions.filter(pres => !pres.fulfilled);
  
  const prescriptionsList = document.createElement('div');
  prescriptionsList.className = 'pharmacy-prescriptions';
  prescriptionsList.innerHTML = '<h3>Pending Prescriptions</h3>';
  
  if (prescriptions.length === 0) {
    prescriptionsList.innerHTML += '<p>No pending prescriptions found.</p>';
  } else {
    prescriptions.forEach(pres => {
      const patient = appData.users.find(u => u.id === pres.patientId);
      const doctor = appData.users.find(u => u.id === pres.doctorId);
      const card = document.createElement('div');
      card.className = 'prescription-card';
      card.innerHTML = `
        <h4>Prescription for ${patient ? patient.name : 'Patient'}</h4>
        <p><strong>Prescribed by:</strong> ${doctor ? doctor.name : 'Doctor'}</p>
        <p><strong>Date:</strong> ${new Date(pres.date).toLocaleDateString()}</p>
        <p><strong>Medications:</strong></p>
        <ul>
          ${pres.medications.map(med => `<li>${med.name} - ${med.dosage}</li>`).join('')}
        </ul>
        <p><strong>Instructions:</strong> ${pres.instructions}</p>
        <button class="btn btn-success fulfill-btn" data-prescription-id="${pres.id}">Mark as Fulfilled</button>
      `;
      prescriptionsList.appendChild(card);
    });
    
    // Add event listeners for fulfill buttons
    document.querySelectorAll('.fulfill-btn').forEach(btn => {
      btn.addEventListener('click', () => fulfillPrescription(btn.dataset.prescriptionId));
    });
  }
  
  const pharmacyPage = document.getElementById('pharmacy-page');
  pharmacyPage.innerHTML = '';
  pharmacyPage.appendChild(prescriptionsList);
}

function fulfillPrescription(prescriptionId) {
  const prescription = appData.prescriptions.find(p => p.id == prescriptionId);
  if (!prescription) return;
  
  prescription.fulfilled = true;
  prescription.fulfilledDate = new Date();
  
  // Send notification to patient
  sendNotification(
    appData.currentUser.id,
    prescription.patientId,
    `Your prescription has been fulfilled and is ready for pickup`,
    'prescription_fulfilled'
  );
  
  // Also notify billing
  const billingUser = appData.users.find(u => u.role === 'billing');
  if (billingUser) {
    sendNotification(
      appData.currentUser.id,
      billingUser.id,
      `Prescription fulfilled for Patient ID: ${prescription.patientId}`,
      'prescription_billing'
    );
  }
  
  alert('Prescription marked as fulfilled!');
  loadPharmacyPrescriptions(); // Refresh the list
}

function loadPharmacyStock() {
  // In a real app, this would fetch from an API
  if (appData.pharmacyStock.length === 0) {
    // Initialize with sample data if empty
    appData.pharmacyStock = [
      { id: 1, name: 'Paracetamol', quantity: 150, threshold: 20 },
      { id: 2, name: 'Ibuprofen', quantity: 80, threshold: 15 },
      { id: 3, name: 'Amoxicillin', quantity: 45, threshold: 10 },
      { id: 4, name: 'Lisinopril', quantity: 30, threshold: 5 },
      { id: 5, name: 'Atorvastatin', quantity: 18, threshold: 5 }
    ];
  }
  
  const stockList = document.createElement('div');
  stockList.className = 'pharmacy-stock';
  stockList.innerHTML = '<h3>Current Stock</h3>';
  
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginTop = '15px';
  
  table.innerHTML = `
    <thead>
      <tr style="background-color: #f2f2f2;">
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Medication</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Quantity</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${appData.pharmacyStock.map(med => `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px;">${med.name}</td>
          <td style="padding: 10px;">${med.quantity}</td>
          <td style="padding: 10px;">
            <span style="color: ${med.quantity <= med.threshold ? 'var(--danger)' : 'var(--success)'}">
              ${med.quantity <= med.threshold ? 'Low Stock' : 'In Stock'}
            </span>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;
  
  stockList.appendChild(table);
  
  const pharmacyPage = document.getElementById('pharmacy-page');
  pharmacyPage.appendChild(stockList);
}
